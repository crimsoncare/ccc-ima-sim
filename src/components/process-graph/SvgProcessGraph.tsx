/**
 * Pure SVG process graph — replaces React Flow with direct SVG rendering.
 *
 * Uses ELK.js for layout (same as before), then renders nodes and edges
 * as SVG elements with proper arrow markers (orient="auto"), inline labels,
 * and manual pan/zoom. This fixes React Flow's broken markerEnd orientation,
 * CSS-vs-SVG label disconnect, and removes ~2.4MB of bundle.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ELK, { type ElkNode, type ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { useMiningStore } from '@/store/mining-store';
import { PROCESS_START, PROCESS_END, computeDFGForCases } from '@/mining/dfg';
import { computeThroughputTime, convertTimeUnit, getTimeUnitLabel } from '@/mining/throughput';
import { getCasesForVariants } from '@/mining/variants';

const elk = new ELK();

// ── Phase colors ───────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  'Registration': '#78909c', 'Vitals & Triage': '#78909c',
  'Waiting Room': '#f59e0b', 'Queue Reassignment': '#f59e0b',
  'History Taking': '#2e7d32', 'Physical Examination': '#2e7d32',
  'Clinical Assessment': '#2e7d32', 'Care Planning': '#2e7d32',
  'Chart Review': '#2e7d32', 'Medication Reconciliation': '#388e3c',
  'Progress Assessment': '#388e3c', 'Chief Complaint': '#43a047',
  'Focused Examination': '#43a047', 'Treatment Plan': '#43a047',
  'CT-Attending Handoff': '#00897b', 'Case Discussion': '#00897b',
  'Case Presentation': '#5e35b1', 'Attending Examination': '#5e35b1',
  'Collaborative Planning': '#7e57c2', 'Case Update': '#7e57c2',
  'Joint Assessment': '#7e57c2', 'Follow-up Plan': '#7e57c2',
  'Quick Review': '#9575cd', 'Focused Treatment': '#9575cd',
  'Discharge Instructions': '#546e7a', 'Follow-up Scheduling': '#546e7a',
  'Process Start': '#0091ea', 'Process End': '#0091ea',
};

function getNodeColor(label: string): string {
  if (['Registration', 'Vitals & Triage', 'Discharge Instructions', 'Follow-up Scheduling'].includes(label)) return '#607d8b';
  if (['Waiting Room', 'Queue Reassignment'].includes(label)) return '#ef6c00';
  if (['History Taking', 'Physical Examination', 'Clinical Assessment', 'Care Planning',
       'Chart Review', 'Medication Reconciliation', 'Progress Assessment',
       'Chief Complaint', 'Focused Examination', 'Treatment Plan'].includes(label)) return '#2e7d32';
  if (['CT-Attending Handoff', 'Case Discussion'].includes(label)) return '#00796b';
  if (['Case Presentation', 'Attending Examination', 'Collaborative Planning',
       'Case Update', 'Joint Assessment', 'Follow-up Plan',
       'Quick Review', 'Focused Treatment'].includes(label)) return '#1565c0';
  return '#e65100';
}

// ── SVG path from ELK bend points with rounded corners ─────
function elkPointsToRoundedPath(points: Array<{ x: number; y: number }>, radius = 14): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const dx1 = prev.x - curr.x, dy1 = prev.y - curr.y;
    const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);
    const r = Math.min(radius, len1 / 2, len2 / 2);

    if (r < 1 || len1 < 1 || len2 < 1) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const x1 = curr.x + (dx1 / len1) * r;
    const y1 = curr.y + (dy1 / len1) * r;
    const x2 = curr.x + (dx2 / len2) * r;
    const y2 = curr.y + (dy2 / len2) * r;

    d += ` L ${x1} ${y1}`;
    d += ` Q ${curr.x} ${curr.y} ${x2} ${y2}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

// ── Layout result types ────────────────────────────────────
interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frequency: number;
  color: string;
  isStartEnd: boolean;
  kpiValue?: string;
}

interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  path: string;
  color: string;
  frequency: number;
  ratio: number;
  strokeWidth: number;
  isDashed: boolean;
  hideLabel: boolean;
  throughputTime?: string;
  labelX: number;
  labelY: number;
}

interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

// ── Component ──────────────────────────────────────────────
interface SvgProcessGraphProps {
  mode?: 'explorer' | 'variant';
}

export function SvgProcessGraph({ mode = 'explorer' }: SvgProcessGraphProps) {
  const {
    dfg, eventLog, variants,
    visibleNodes, visibleEdges, selectedVariantIds,
    kpiType, aggregationMethod, timeUnit,
    setSelectedActivity, setSelectedEdge,
  } = useMiningStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<LayoutResult | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const activeDFG = useMemo(() => {
    if (!dfg || !eventLog || !variants) return dfg;
    if (mode === 'variant' && selectedVariantIds.size < (variants?.length ?? 0)) {
      const selectedVars = variants.filter((v) => selectedVariantIds.has(v.id));
      const caseIds = getCasesForVariants(selectedVars);
      return computeDFGForCases(eventLog, caseIds);
    }
    return dfg;
  }, [dfg, eventLog, variants, mode, selectedVariantIds]);

  // Run ELK layout
  useEffect(() => {
    if (!activeDFG) return;

    const filteredNodes = activeDFG.nodes.filter((n) =>
      mode === 'explorer' ? visibleNodes.has(n.activity) : true,
    );
    const filteredEdges = activeDFG.edges.filter((e) =>
      mode === 'explorer'
        ? visibleEdges.has(`${e.source}->${e.target}`) &&
          visibleNodes.has(e.source) && visibleNodes.has(e.target)
        : true,
    );

    const elkGraph: ElkNode = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.spacing.nodeNode': '65',
        'elk.layered.spacing.nodeNodeBetweenLayers': '60',
        'elk.layered.spacing.edgeEdgeBetweenLayers': '18',
        'elk.layered.spacing.edgeNodeBetweenLayers': '22',
        'elk.layered.nodePlacement.favorStraightEdges': 'true',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.mergeEdges': 'false',
        'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
      },
      children: filteredNodes.map((n) => ({
        id: n.activity,
        width: n.activity === PROCESS_START || n.activity === PROCESS_END ? 190 : 240,
        height: n.activity === PROCESS_START || n.activity === PROCESS_END ? 50 : 54,
      })),
      edges: filteredEdges.map((e, i) => ({
        id: `e-${i}`,
        sources: [e.source],
        targets: [e.target],
      })),
    };

    elk.layout(elkGraph).then((layoutedGraph) => {
      const freqThreshold = filteredEdges.length > 10
        ? filteredEdges.map(e => e.frequency).sort((a, b) => a - b)[Math.floor(filteredEdges.length * 0.3)]
        : 0;
      const maxFrequency = Math.max(...filteredEdges.map(e => e.frequency), 1);
      const elkEdges = (layoutedGraph.edges ?? []) as ElkExtendedEdge[];

      const nodes: LayoutNode[] = (layoutedGraph.children ?? []).map((elkNode) => {
        const dfgNode = filteredNodes.find((n) => n.activity === elkNode.id)!;
        const isStartEnd = elkNode.id === PROCESS_START || elkNode.id === PROCESS_END;

        let kpiValue: string | undefined;
        if (kpiType === 'throughput_time') {
          const edgesForNode = filteredEdges.filter((e) => e.target === dfgNode.activity);
          if (edgesForNode.length > 0) {
            const avgTime = edgesForNode.reduce((sum, e) =>
              sum + computeThroughputTime(e, aggregationMethod), 0) / edgesForNode.length;
            kpiValue = `${convertTimeUnit(avgTime, timeUnit).toFixed(1)}${getTimeUnitLabel(timeUnit)}`;
          }
        }

        return {
          id: elkNode.id,
          x: elkNode.x ?? 0,
          y: elkNode.y ?? 0,
          width: elkNode.width ?? 240,
          height: elkNode.height ?? 54,
          frequency: dfgNode.frequency,
          color: isStartEnd ? '#0091ea' : getNodeColor(elkNode.id),
          isStartEnd,
          kpiValue,
        };
      });

      const edges: LayoutEdge[] = filteredEdges.map((e, i) => {
        const edgeColor = PHASE_COLORS[e.source] ?? '#e65100';
        const ratio = maxFrequency > 0 ? Math.min(e.frequency / maxFrequency, 1) : 0.5;
        const strokeWidth = Math.max(2.5, Math.min(10, 2.5 + ratio * 7.5));

        const tTime = computeThroughputTime(e, aggregationMethod);
        const tConverted = convertTimeUnit(tTime, timeUnit);
        const timeLabel = tConverted > 0
          ? `${tConverted.toFixed(1)} ${getTimeUnitLabel(timeUnit)}`
          : undefined;

        const elkEdge = elkEdges[i];
        const sections = elkEdge?.sections ?? [];
        let path = '';
        let labelX = 0;
        let labelY = 0;

        if (sections.length > 0) {
          const pathPoints = sections.flatMap(section => [
            section.startPoint,
            ...(section.bendPoints ?? []),
            section.endPoint,
          ]);

          // Label placement uses full path (before shortening)
          const segs = pathPoints.map((p, idx) =>
            idx === 0 ? 0 : Math.hypot(p.x - pathPoints[idx - 1].x, p.y - pathPoints[idx - 1].y)
          );
          const total = segs.reduce((a, b) => a + b, 0);
          const target = Math.max(20, Math.min(total - 20, total * 0.35));
          let walked = 0;
          for (let idx = 1; idx < pathPoints.length; idx++) {
            if (walked + segs[idx] >= target) {
              const t = (target - walked) / segs[idx];
              const px = pathPoints[idx - 1].x + t * (pathPoints[idx].x - pathPoints[idx - 1].x);
              const py = pathPoints[idx - 1].y + t * (pathPoints[idx].y - pathPoints[idx - 1].y);
              const dx = pathPoints[idx].x - pathPoints[idx - 1].x;
              const dy = pathPoints[idx].y - pathPoints[idx - 1].y;
              const len = Math.hypot(dx, dy);
              if (len > 0) {
                labelX = px + (-dy / len) * 16;
                labelY = py + (dx / len) * 16;
              } else {
                labelX = px + 16;
                labelY = py;
              }
              break;
            }
            walked += segs[idx];
          }

          // Shorten last segment by arrow length so stroke ends at arrow base
          const ARROW_LEN = 14;
          if (pathPoints.length >= 2) {
            const last = pathPoints[pathPoints.length - 1];
            const prev = pathPoints[pathPoints.length - 2];
            const sdx = last.x - prev.x;
            const sdy = last.y - prev.y;
            const slen = Math.hypot(sdx, sdy);
            if (slen > ARROW_LEN) {
              pathPoints[pathPoints.length - 1] = {
                x: last.x - (sdx / slen) * ARROW_LEN,
                y: last.y - (sdy / slen) * ARROW_LEN,
              };
            }
          }
          path = elkPointsToRoundedPath(pathPoints);
        }

        return {
          id: `${e.source}->${e.target}`,
          source: e.source,
          target: e.target,
          path,
          color: edgeColor,
          frequency: e.frequency,
          ratio,
          strokeWidth,
          isDashed: ratio < 0.15,
          hideLabel: e.frequency < freqThreshold,
          throughputTime: timeLabel,
          labelX,
          labelY,
        };
      });

      // Compute bounds
      let maxX = 0, maxY = 0;
      for (const n of nodes) {
        maxX = Math.max(maxX, n.x + n.width);
        maxY = Math.max(maxY, n.y + n.height);
      }

      setLayout({ nodes, edges, width: maxX + 40, height: maxY + 40 });
    }).catch(console.error);
  }, [activeDFG, visibleNodes, visibleEdges, mode, kpiType, aggregationMethod, timeUnit]);

  // Fit view when layout changes
  useEffect(() => {
    if (!layout || !svgRef.current) return;
    const svg = svgRef.current;
    const { width: svgW, height: svgH } = svg.getBoundingClientRect();
    const padding = 30;
    const scaleX = (svgW - padding * 2) / layout.width;
    const scaleY = (svgH - padding * 2) / layout.height;
    const k = Math.min(scaleX, scaleY, 1.0);
    const x = (svgW - layout.width * k) / 2;
    const y = (svgH - layout.height * k) / 2;
    setTransform({ x, y, k });
  }, [layout]);

  // Pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setTransform({
      x: panStart.current.tx + (e.clientX - panStart.current.x),
      y: panStart.current.ty + (e.clientY - panStart.current.y),
      k: transform.k,
    });
  }, [transform.k]);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Zoom: native wheel listener (non-passive) so preventDefault() works
  const transformRef = useRef(transform);
  transformRef.current = transform;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const t = transformRef.current;

      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newK = Math.max(0.1, Math.min(2.5, t.k * factor));
      const ratio = newK / t.k;

      setTransform({
        x: mx - (mx - t.x) * ratio,
        y: my - (my - t.y) * ratio,
        k: newK,
      });
    };
    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, []);

  // Interaction handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    setSelectedEdgeId(null);
    setSelectedActivity(nodeId);
  }, [setSelectedActivity]);

  const handleEdgeClick = useCallback((edgeId: string, source: string, target: string) => {
    setSelectedEdgeId(edgeId);
    setSelectedNode(null);
    setSelectedEdge({ source, target });
  }, [setSelectedEdge]);

  // Collect unique edge colors for marker definitions
  const markerColors = useMemo(() => {
    if (!layout) return [];
    const colors = new Set(layout.edges.map(e => e.color));
    return Array.from(colors);
  }, [layout]);

  // Zoom/fit helpers
  const zoomBy = useCallback((factor: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newK = Math.max(0.1, Math.min(2.5, transform.k * factor));
    const ratio = newK / transform.k;
    setTransform({
      x: cx - (cx - transform.x) * ratio,
      y: cy - (cy - transform.y) * ratio,
      k: newK,
    });
  }, [transform]);

  const fitView = useCallback(() => {
    if (!layout || !svgRef.current) return;
    const svg = svgRef.current;
    const { width: svgW, height: svgH } = svg.getBoundingClientRect();
    const padding = 30;
    const scaleX = (svgW - padding * 2) / layout.width;
    const scaleY = (svgH - padding * 2) / layout.height;
    const k = Math.min(scaleX, scaleY, 1.0);
    const x = (svgW - layout.width * k) / 2;
    const y = (svgH - layout.height * k) / 2;
    setTransform({ x, y, k });
  }, [layout]);

  if (!layout) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Computing layout...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Arrow markers: refX=0 so base sits at (shortened) path end, tip reaches target node */}
        <defs>
          {markerColors.map(color => (
            <marker
              key={color}
              id={`arrow-${color.replace('#', '')}`}
              viewBox="0 0 14 12"
              refX="0"
              refY="6"
              markerWidth="14"
              markerHeight="12"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M 0 0 L 14 6 L 0 12 Z" fill={color} />
            </marker>
          ))}
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* ── Edges (behind nodes) ── */}
          {layout.edges.map(edge => {
            const isHovered = hoveredEdge === edge.id;
            const isSelected = selectedEdgeId === edge.id;
            const isTopEdge = edge.ratio > 0.6 && !edge.hideLabel;
            const showLabel = isHovered || isSelected || isTopEdge;
            const markerId = `arrow-${edge.color.replace('#', '')}`;

            return (
              <g key={edge.id}>
                {/* Invisible hit area */}
                <path
                  d={edge.path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={Math.max(20, edge.strokeWidth + 12)}
                  onMouseEnter={() => setHoveredEdge(edge.id)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={(evt) => { evt.stopPropagation(); handleEdgeClick(edge.id, edge.source, edge.target); }}
                  style={{ cursor: 'pointer' }}
                />
                {/* Visible edge */}
                <path
                  d={edge.path}
                  fill="none"
                  stroke={edge.color}
                  strokeWidth={isHovered ? edge.strokeWidth + 1.5 : edge.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={edge.isDashed ? '10 5' : undefined}
                  opacity={isSelected ? 1 : isHovered ? 0.95 : 0.8}
                  markerEnd={`url(#${markerId})`}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 3px rgba(59,130,246,0.5))' : undefined,
                    transition: 'stroke-width 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={() => setHoveredEdge(edge.id)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={(evt) => { evt.stopPropagation(); handleEdgeClick(edge.id, edge.source, edge.target); }}
                />
                {/* Edge label */}
                {showLabel && (
                  <g style={{ pointerEvents: 'none' }}>
                    <text
                      x={edge.labelX}
                      y={edge.labelY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#6b7280"
                      fontSize="11"
                      fontFamily="ui-monospace, monospace"
                    >
                      {edge.frequency.toLocaleString()}
                    </text>
                    {(isHovered || isSelected) && edge.throughputTime && (
                      <text
                        x={edge.labelX}
                        y={edge.labelY + 13}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#9ca3af"
                        fontSize="10"
                        fontFamily="ui-monospace, monospace"
                      >
                        {edge.throughputTime}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* ── Nodes ── */}
          {layout.nodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(evt) => { evt.stopPropagation(); handleNodeClick(node.id); }}
                style={{ cursor: 'pointer' }}
              >
                {/* Card background */}
                <rect
                  width={node.width}
                  height={node.height}
                  rx={10}
                  fill="white"
                  stroke={isSelected ? '#60a5fa' : isHovered ? '#d1d5db' : '#e5e7eb'}
                  strokeWidth={isSelected ? 2 : 1}
                  filter={isHovered && !isSelected ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' : undefined}
                />
                {isSelected && (
                  <rect
                    x={-2}
                    y={-2}
                    width={node.width + 4}
                    height={node.height + 4}
                    rx={12}
                    fill="none"
                    stroke="#bfdbfe"
                    strokeWidth={3}
                  />
                )}

                {/* Circle indicator */}
                {node.isStartEnd ? (
                  <g transform={`translate(22,${node.height / 2})`}>
                    <circle r={14} fill={node.color} />
                    {node.id === PROCESS_START ? (
                      <polygon points="-4,-6 6,0 -4,6" fill="white" />
                    ) : (
                      <>
                        <circle r={6} fill="none" stroke="white" strokeWidth={2} />
                        <circle r={3} fill="white" />
                      </>
                    )}
                  </g>
                ) : (
                  <circle
                    cx={22}
                    cy={node.height / 2}
                    r={14}
                    fill={node.color}
                  />
                )}

                {/* Label text */}
                <text
                  x={44}
                  y={node.height / 2 - 6}
                  fill="#1f2937"
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.id}
                </text>
                {/* Frequency */}
                <text
                  x={44}
                  y={node.height / 2 + 10}
                  fill="#9ca3af"
                  fontSize="12"
                  fontFamily="ui-monospace, monospace"
                >
                  {node.frequency.toLocaleString()}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls — HTML overlay (top-right) */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          className="w-7 h-7 bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50 text-lg leading-none"
          onClick={() => zoomBy(1.3)}
        >
          +
        </button>
        <button
          className="w-7 h-7 bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50 text-lg leading-none"
          onClick={() => zoomBy(1 / 1.3)}
        >
          &minus;
        </button>
        <button
          className="w-7 h-7 bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50 text-xs leading-none"
          onClick={fitView}
          title="Fit to view"
        >
          &#x2922;
        </button>
      </div>
    </div>
  );
}
