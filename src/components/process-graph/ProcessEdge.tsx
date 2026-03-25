/**
 * Custom React Flow edge — Celonis-style multicolor edges.
 * Color is determined by the clinical phase of the SOURCE activity,
 * creating distinct visual flows like Celonis's purple/teal/cyan/orange paths.
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
  edgeColor?: string; // Phase-based color from ProcessGraph
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

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 12,
  });

  // Bold thickness: 4px (rare) → 12px (very common) — Celonis-heavy
  const strokeWidth = Math.max(4, Math.min(12, 4 + ratio * 8));

  // Phase-based color from data, fallback to indigo
  const color = d?.edgeColor ?? '#5c6bc0';

  // Dashed for low-frequency edges
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
            <span className="text-[11px] font-mono font-bold leading-none" style={{ color }}>
              {freq.toLocaleString()}
            </span>
          )}
          {throughputTime && (
            <span className="text-xs font-semibold text-gray-600 bg-white/95 px-1.5 py-0.5 rounded shadow-sm leading-none whitespace-nowrap">
              {throughputTime}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
