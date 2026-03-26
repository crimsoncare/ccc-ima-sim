/**
 * Main Process Graph component using React Flow + ELK.js for layout.
 *
 * KEY IMPROVEMENT: Uses ELK's actual edge bend points (ElkEdgeSection)
 * instead of React Flow's getSmoothStepPath. This gives us proper
 * orthogonal routing with separated parallel tracks — the defining
 * visual feature of Celonis's process graphs.
 */
import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK, { type ElkNode, type ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { ActivityNode, type ActivityNodeData } from './ActivityNode';
import { ProcessEdge } from './ProcessEdge';
import { useMiningStore } from '@/store/mining-store';
import { PROCESS_START, PROCESS_END, computeDFGForCases } from '@/mining/dfg';
import { computeThroughputTime, convertTimeUnit, getTimeUnitLabel } from '@/mining/throughput';
import { getCasesForVariants } from '@/mining/variants';

const elk = new ELK();

const nodeTypes = { activity: ActivityNode };
const edgeTypes = { process: ProcessEdge };

// Phase-based edge colors — creates Celonis multicolor effect
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

function getEdgePhaseColor(sourceActivity: string): string {
  return PHASE_COLORS[sourceActivity] ?? '#e65100';
}

/**
 * Convert ELK bend points to SVG path with rounded corners at bends.
 * This gives the polished subway-map feel.
 */
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

interface ProcessGraphProps {
  mode?: 'explorer' | 'variant';
}

export function ProcessGraph({ mode = 'explorer' }: ProcessGraphProps) {
  const {
    dfg, eventLog, variants,
    visibleNodes, visibleEdges, selectedVariantIds,
    kpiType, aggregationMethod, timeUnit,
    setSelectedCaseIds, setSelectedActivity, setSelectedEdge,
  } = useMiningStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const activeDFG = useMemo(() => {
    if (!dfg || !eventLog || !variants) return dfg;
    if (mode === 'variant' && selectedVariantIds.size < (variants?.length ?? 0)) {
      const selectedVars = variants.filter((v) => selectedVariantIds.has(v.id));
      const caseIds = getCasesForVariants(selectedVars);
      return computeDFGForCases(eventLog, caseIds);
    }
    return dfg;
  }, [dfg, eventLog, variants, mode, selectedVariantIds]);

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

        // Generous spacing for Celonis-level breathing room
        'elk.spacing.nodeNode': '80',
        'elk.layered.spacing.nodeNodeBetweenLayers': '120',

        // KEY: Separate parallel edge tracks (subway lines)
        'elk.layered.spacing.edgeEdgeBetweenLayers': '25',
        'elk.layered.spacing.edgeNodeBetweenLayers': '40',

        // Straighten edges and use better node placement
        'elk.layered.nodePlacement.favorStraightEdges': 'true',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',

        // Better crossing minimization
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',

        // Keep parallel edges separate (not merged)
        'elk.layered.mergeEdges': 'false',

        // Deterministic edge attachment
        'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
      },
      children: filteredNodes.map((n) => ({
        id: n.activity,
        width: n.activity === PROCESS_START || n.activity === PROCESS_END ? 160 : 220,
        height: n.activity === PROCESS_START || n.activity === PROCESS_END ? 44 : 46,
      })),
      edges: filteredEdges.map((e, i) => ({
        id: `e-${i}`,
        sources: [e.source],
        targets: [e.target],
      })),
    };

    elk.layout(elkGraph).then((layoutedGraph) => {
      const newNodes: Node[] = (layoutedGraph.children ?? []).map((elkNode) => {
        const dfgNode = filteredNodes.find((n) => n.activity === elkNode.id)!;
        const throughputStr =
          kpiType === 'throughput_time'
            ? (() => {
                const edgesForNode = filteredEdges.filter((e) => e.target === dfgNode.activity);
                if (edgesForNode.length === 0) return undefined;
                const avgTime =
                  edgesForNode.reduce((sum, e) => sum + computeThroughputTime(e, aggregationMethod), 0)
                  / edgesForNode.length;
                return `${convertTimeUnit(avgTime, timeUnit).toFixed(1)}${getTimeUnitLabel(timeUnit)}`;
              })()
            : undefined;

        return {
          id: elkNode.id,
          type: 'activity',
          position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
          data: {
            label: elkNode.id,
            frequency: dfgNode.frequency,
            kpiValue: throughputStr,
          } satisfies ActivityNodeData,
        };
      });

      const freqThreshold = filteredEdges.length > 10
        ? filteredEdges.map(e => e.frequency).sort((a, b) => a - b)[Math.floor(filteredEdges.length * 0.3)]
        : 0;
      const maxFrequency = Math.max(...filteredEdges.map(e => e.frequency), 1);

      // Extract ELK's edge sections (the actual routed paths)
      const elkEdges = (layoutedGraph.edges ?? []) as ElkExtendedEdge[];

      const newEdges: Edge[] = filteredEdges.map((e, i) => {
        const edgeColor = getEdgePhaseColor(e.source);

        const tTime = computeThroughputTime(e, aggregationMethod);
        const tConverted = convertTimeUnit(tTime, timeUnit);
        const timeLabel = tConverted > 0
          ? `${tConverted.toFixed(1)} ${getTimeUnitLabel(timeUnit)}`
          : undefined;

        // Get ELK's computed edge path with bend points
        const elkEdge = elkEdges[i];
        const sections = elkEdge?.sections ?? [];
        let elkPath: string | undefined;
        let elkLabelX = 0;
        let elkLabelY = 0;

        if (sections.length > 0) {
          const pathPoints = sections.flatMap(section => [
            section.startPoint,
            ...(section.bendPoints ?? []),
            section.endPoint,
          ]);

          elkPath = elkPointsToRoundedPath(pathPoints);

          // Label position at midpoint of path
          const midIdx = Math.floor(pathPoints.length / 2);
          const midPt = pathPoints[midIdx];
          if (midPt) {
            elkLabelX = midPt.x;
            elkLabelY = midPt.y;
          }
        }

        return {
          id: `${e.source}->${e.target}`,
          source: e.source,
          target: e.target,
          type: 'process',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 7,
            height: 7,
            color: edgeColor,
          },
          data: {
            frequency: e.frequency,
            maxFrequency,
            hideLabel: e.frequency < freqThreshold,
            throughputTime: timeLabel,
            edgeColor,
            elkPath,
            elkLabelX,
            elkLabelY,
          },
        };
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }).catch(console.error);
  }, [activeDFG, visibleNodes, visibleEdges, mode, kpiType, aggregationMethod, timeUnit]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => setSelectedActivity(node.id),
    [setSelectedActivity],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) =>
      setSelectedEdge({ source: edge.source, target: edge.target }),
    [setSelectedEdge],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.0 }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="top-right" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => PHASE_COLORS[node.id] ?? '#e65100'}
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}
