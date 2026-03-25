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

  // Thickness scales with frequency: 2px (rare) → 6px (very common)
  const strokeWidth = Math.max(2, Math.min(6, 2 + (freq / Math.max(maxFreq, 1)) * 4));
  const color = getEdgeColor(freq, maxFreq);

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
          opacity: 0.8,
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
            className="rounded text-[9px] font-mono font-semibold cursor-pointer"
          >
            <span style={{ color }}>{freq.toLocaleString()}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
