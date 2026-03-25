/**
 * Custom React Flow edge — Celonis Studio-style with orthogonal routing,
 * thickness proportional to frequency, and color intensity scaling.
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

// Frequency → color intensity (light blue → deep blue/purple)
function getEdgeColor(freq: number, maxFreq: number): string {
  const ratio = maxFreq > 0 ? Math.min(freq / maxFreq, 1) : 0.5;
  if (ratio > 0.7) return '#1a237e'; // deep indigo for high-frequency
  if (ratio > 0.4) return '#1565c0'; // medium blue
  if (ratio > 0.15) return '#42a5f5'; // light blue
  return '#90caf9'; // very light blue for rare paths
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

  // SmoothStep = orthogonal routing (subway-map style like Celonis Studio)
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  });

  // Thickness scales with frequency: 3px (rare) → 8px (very common) — Celonis-thick
  const strokeWidth = Math.max(3, Math.min(8, 3 + (freq / Math.max(maxFreq, 1)) * 5));
  const color = getEdgeColor(freq, maxFreq);
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
          opacity: 0.92,
        }}
        markerEnd={markerEnd}
      />
      {!d?.hideLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="rounded cursor-pointer flex flex-col items-center"
          >
            <span className="text-[10px] font-mono font-bold" style={{ color }}>{freq.toLocaleString()}</span>
            {throughputTime && (
              <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-px rounded-full shadow-sm">
                {throughputTime}
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
