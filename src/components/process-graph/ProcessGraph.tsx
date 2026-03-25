/**
 * Main Process Graph component using React Flow + ELK.js for layout.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
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

  // Compute graph to display based on mode
  const activeDFG = useMemo(() => {
    if (!dfg || !eventLog || !variants) return dfg;

    if (mode === 'variant' && selectedVariantIds.size < (variants?.length ?? 0)) {
      const selectedVars = variants.filter((v) => selectedVariantIds.has(v.id));
      const caseIds = getCasesForVariants(selectedVars);
      return computeDFGForCases(eventLog, caseIds);
    }

    return dfg;
  }, [dfg, eventLog, variants, mode, selectedVariantIds]);

  // Layout with ELK.js
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

    const elkGraph: ElkNode = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '80',
        'elk.layered.spacing.nodeNodeBetweenLayers': '100',
        'elk.layered.spacing.edgeNodeBetweenLayers': '50',
        'elk.edgeRouting': 'SPLINES',
      },
      children: filteredNodes.map((n) => ({
        id: n.activity,
        width: n.activity === PROCESS_START || n.activity === PROCESS_END ? 60 : 170,
        height: n.activity === PROCESS_START || n.activity === PROCESS_END ? 80 : 110,
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
                  const edgesForNode = filteredEdges.filter(
                    (e) => e.target === dfgNode.activity,
                  );
                  if (edgesForNode.length === 0) return undefined;
                  const avgTime =
                    edgesForNode.reduce(
                      (sum, e) => sum + computeThroughputTime(e, aggregationMethod),
                      0,
                    ) / edgesForNode.length;
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

        const newEdges: Edge[] = filteredEdges.map((e, i) => ({
          id: `${e.source}->${e.target}`,
          source: e.source,
          target: e.target,
          type: 'process',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12,
            height: 12,
            color: '#0091ea',
          },
          data: {
            frequency: e.frequency,
            throughputTime:
              kpiType === 'throughput_time'
                ? `${convertTimeUnit(computeThroughputTime(e, aggregationMethod), timeUnit).toFixed(1)}${getTimeUnitLabel(timeUnit)}`
                : undefined,
          },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      })
      .catch(console.error);
  }, [activeDFG, visibleNodes, visibleEdges, mode, kpiType, aggregationMethod, timeUnit]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedActivity(node.id);
    },
    [setSelectedActivity],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge({ source: edge.source, target: edge.target });
    },
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
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="top-right" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) =>
            node.id === PROCESS_START || node.id === PROCESS_END
              ? '#0091ea'
              : '#ff8c00'
          }
          position="bottom-right"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
