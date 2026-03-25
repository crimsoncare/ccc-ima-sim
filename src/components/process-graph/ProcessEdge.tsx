/**
 * Custom React Flow edge — Celonis-style with orthogonal routing,
 * thickness proportional to frequency, dashed lines for rare paths,
 * and throughput time labels on every edge.
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
  [key: string]: unknown;
}

// Frequency → color (cyan for rare → deep indigo for common, matching classic Celonis)
function getEdgeColor(freq: number, maxFreq: number): string {
  const ratio = maxFreq > 0 ? Math.min(freq / maxFreq, 1) : 0.5;
  if (ratio > 0.7) return '#1a237e'; // deep indigo — high-frequency
  if (ratio > 0.4) return '#1565c0'; // medium blue
  if (ratio > 0.15) return '#42a5f5'; // light blue
  return '#80deea'; // cyan — rare paths (Celonis classic)
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
    borderRadius: 8,
  });

  // Thickness: 2px (rare) → 8px (very common)
  const strokeWidth = Math.max(2, Math.min(8, 2 + ratio * 6));
  const color = getEdgeColor(freq, maxFreq);
  const throughputTime = d?.throughputTime as string | undefined;

  // Dashed for low-frequency edges (Celonis classic pattern)
  const isDashed = ratio < 0.2;

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
          strokeDasharray: isDashed ? '8 4' : undefined,
          opacity: 0.9,
        }}
        markerEnd={markerEnd}
      />
      {/* Always show throughput time; only hide frequency count on low-freq edges */}
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
            <span className="text-[10px] font-mono font-bold leading-none" style={{ color }}>
              {freq.toLocaleString()}
            </span>
          )}
          {throughputTime && (
            <span className="text-[10px] font-mono text-gray-500 leading-none whitespace-nowrap">
              ⏱ {throughputTime}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
