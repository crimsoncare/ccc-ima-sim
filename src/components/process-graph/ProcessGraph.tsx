/**
 * Main Process Graph component using React Flow + ELK.js for layout.
 * Celonis-style multicolor edges based on clinical phase.
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
import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js';
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
  // Registration/intake phase: slate/gray
  'Registration': '#78909c',
  'Vitals & Triage': '#78909c',
  // Waiting: amber
  'Waiting Room': '#f59e0b',
  'Queue Reassignment': '#f59e0b',
  // Clinical Team phase: rich green
  'History Taking': '#2e7d32',
  'Physical Examination': '#2e7d32',
  'Clinical Assessment': '#2e7d32',
  'Care Planning': '#2e7d32',
  'Chart Review': '#2e7d32',
  'Medication Reconciliation': '#388e3c',
  'Progress Assessment': '#388e3c',
  'Chief Complaint': '#43a047',
  'Focused Examination': '#43a047',
  'Treatment Plan': '#43a047',
  // Handoff: teal
  'CT-Attending Handoff': '#00897b',
  'Case Discussion': '#00897b',
  // Attending phase: deep purple
  'Case Presentation': '#5e35b1',
  'Attending Examination': '#5e35b1',
  'Collaborative Planning': '#7e57c2',
  'Case Update': '#7e57c2',
  'Joint Assessment': '#7e57c2',
  'Follow-up Plan': '#7e57c2',
  'Quick Review': '#9575cd',
  'Focused Treatment': '#9575cd',
  // Checkout: slate
  'Discharge Instructions': '#546e7a',
  'Follow-up Scheduling': '#546e7a',
  // Start/End
  'Process Start': '#0091ea',
  'Process End': '#0091ea',
};

function getEdgePhaseColor(sourceActivity: string): string {
  return PHASE_COLORS[sourceActivity] ?? '#e65100'; // orange for optional/labs
}

interface ProcessGraphProps {
  mode?: 'explorer' | 'variant';
}

export function ProcessGraph({ mode = 'explorer' }: ProcessGraphProps) {
  const {
    dfg,
    eventLog,
    variants,
    visibleNodes,
    visibleEdges,
    selectedVariantIds,
    kpiType,
    aggregationMethod,
    timeUnit,
    setSelectedCaseIds,
    setSelectedActivity,
    setSelectedEdge,
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
          visibleNodes.has(e.source) &&
          visibleNodes.has(e.target)
        : true,
    );

    // Dramatically more spacing — Celonis-level breathing room
    const elkGraph: ElkNode = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '80',
        'elk.layered.spacing.nodeNodeBetweenLayers': '120',
        'elk.layered.spacing.edgeNodeBetweenLayers': '50',
        'elk.edgeRouting': 'ORTHOGONAL',
      },
      children: filteredNodes.map((n) => ({
        id: n.activity,
        width: n.activity === PROCESS_START || n.activity === PROCESS_END ? 44 : 170,
        height: n.activity === PROCESS_START || n.activity === PROCESS_END ? 58 : 54,
      })),
      edges: filteredEdges.map((e, i) => ({
        id: `e-${i}`,
        sources: [e.source],
        targets: [e.target],
      })),
    };

    elk
      .layout(elkGraph)
      .then((layoutedGraph) => {
        const newNodes: Node[] = (layoutedGraph.children ?? []).map((elkNode) => {
          const dfgNode = filteredNodes.find((n) => n.activity === elkNode.id)!;
          const throughputStr =
            kpiType === 'throughput_time'
              ? (() => {
                  const edgesForNode = filteredEdges.filter((e) => e.target === dfgNode.activity);
                  if (edgesForNode.length === 0) return undefined;
                  const avgTime =
                    edgesForNode.reduce((sum, e) => sum + computeThroughputTime(e, aggregationMethod), 0) / edgesForNode.length;
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

        const newEdges: Edge[] = filteredEdges.map((e) => {
          // Phase-based color from source activity
          const edgeColor = getEdgePhaseColor(e.source);

          const tTime = computeThroughputTime(e, aggregationMethod);
          const tConverted = convertTimeUnit(tTime, timeUnit);
          const timeLabel = tConverted > 0
            ? `${tConverted.toFixed(1)} ${getTimeUnitLabel(timeUnit)}`
            : undefined;

          return {
            id: `${e.source}->${e.target}`,
            source: e.source,
            target: e.target,
            type: 'process',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: edgeColor,
            },
            data: {
              frequency: e.frequency,
              maxFrequency,
              hideLabel: e.frequency < freqThreshold,
              throughputTime: timeLabel,
              edgeColor,
            },
          };
        });

        setNodes(newNodes);
        setEdges(newEdges);
      })
      .catch(console.error);
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
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.0 }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="top-right" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) =>
            node.id === PROCESS_START || node.id === PROCESS_END
              ? '#0091ea'
              : PHASE_COLORS[node.id] ?? '#e65100'
          }
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}
