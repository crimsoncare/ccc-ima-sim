/**
 * Custom React Flow edge styled like Celonis edges.
 * Dashed bezier edge with frequency label.
 */
import { memo } from 'react';
import {
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';

export interface ProcessEdgeData {
  frequency: number;
  hideLabel?: boolean;
  throughputTime?: string;
  [key: string]: unknown;
}

export const ProcessEdge = memo(function ProcessEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const edgeData = data as ProcessEdgeData | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const frequency = edgeData?.frequency ?? 0;
  // Stroke width scales logarithmically with frequency for better visual spread
  const strokeWidth = frequency > 0 ? Math.max(1.5, Math.min(5, 1.5 + Math.log2(frequency))) : 1.5;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: '#0091ea',
          strokeWidth,
          strokeDasharray: frequency < 5 ? '5 5' : undefined,
        }}
        markerEnd={markerEnd}
      />
      {!edgeData?.hideLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-white/90 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-mono shadow-sm border border-gray-100 cursor-pointer hover:bg-blue-50"
          >
            {frequency.toLocaleString()}
            {edgeData?.throughputTime && (
              <span className="ml-1 text-[#0091ea]">{edgeData.throughputTime}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
