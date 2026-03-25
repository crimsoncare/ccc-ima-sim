/**
 * Custom React Flow edge using ELK's actual orthogonal bend points.
 *
 * Instead of React Flow's getSmoothStepPath (which ignores ELK's routing),
 * we use the pre-computed SVG path from ELK's ElkEdgeSection data,
 * with rounded corners at bend points for a polished subway-map feel.
 */
import { memo } from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';

export interface ProcessEdgeData {
  frequency: number;
  maxFrequency?: number;
  hideLabel?: boolean;
  throughputTime?: string;
  edgeColor?: string;
  // ELK-computed path and label position
  elkPath?: string;
  elkLabelX?: number;
  elkLabelY?: number;
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
  const d = data as ProcessEdgeData | undefined;
  const freq = d?.frequency ?? 0;
  const maxFreq = d?.maxFrequency ?? 100;
  const ratio = maxFreq > 0 ? Math.min(freq / maxFreq, 1) : 0.5;

  // Use ELK's pre-computed path if available, else fall back to React Flow
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (d?.elkPath) {
    edgePath = d.elkPath;
    labelX = d.elkLabelX ?? 0;
    labelY = d.elkLabelY ?? 0;
  } else {
    const [fp, fx, fy] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      borderRadius: 12,
    });
    edgePath = fp;
    labelX = fx;
    labelY = fy;
  }

  // Celonis thickness: 2px (rare) → 8px (very common)
  const strokeWidth = Math.max(2, Math.min(8, 2 + ratio * 6));
  const color = d?.edgeColor ?? '#5c6bc0';
  const isDashed = ratio < 0.15;
  const throughputTime = d?.throughputTime as string | undefined;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: color,
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: isDashed ? '10 5' : undefined,
          opacity: 0.85,
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex flex-col items-center gap-0.5"
        >
          {!d?.hideLabel && (
            <span className="text-[10px] font-mono text-gray-400 leading-none">
              {freq.toLocaleString()}
            </span>
          )}
          {throughputTime && (
            <span className="text-[10px] italic text-gray-400 leading-none whitespace-nowrap">
              {throughputTime}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
