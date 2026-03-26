/**
 * Custom React Flow edge using ELK's actual orthogonal bend points.
 *
 * Labels are HIDDEN by default and shown on HOVER — matching Celonis's
 * clean visual where edges speak through thickness and color, not text.
 * Only high-frequency edges show a subtle frequency count by default.
 */
import { memo, useState } from 'react';
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
  selected,
}: EdgeProps) {
  const d = data as ProcessEdgeData | undefined;
  const freq = d?.frequency ?? 0;
  const maxFreq = d?.maxFrequency ?? 100;
  const ratio = maxFreq > 0 ? Math.min(freq / maxFreq, 1) : 0.5;
  const [hovered, setHovered] = useState(false);

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

  const strokeWidth = Math.max(2, Math.min(8, 2 + ratio * 6));
  const color = d?.edgeColor ?? '#5c6bc0';
  const isDashed = ratio < 0.15;
  const throughputTime = d?.throughputTime as string | undefined;

  // Only show labels when: hovered, selected, or top-frequency edge
  const isTopEdge = ratio > 0.6 && !d?.hideLabel;
  const showLabel = hovered || selected || isTopEdge;

  return (
    <>
      {/* Invisible wider hit area for hover */}
      <path
        d={edgePath}
        style={{
          stroke: 'transparent',
          strokeWidth: Math.max(20, strokeWidth + 12),
          fill: 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: color,
          strokeWidth: hovered ? strokeWidth + 1.5 : strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: isDashed ? '10 5' : undefined,
          opacity: selected ? 1 : hovered ? 0.95 : 0.8,
          filter: selected ? 'drop-shadow(0 0 3px rgba(59,130,246,0.5))' : undefined,
          transition: 'stroke-width 0.15s, opacity 0.15s',
        }}
        markerEnd={markerEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className={`text-center transition-opacity duration-150 ${
              hovered || selected ? 'opacity-100' : 'opacity-70'
            }`}
          >
            {/* Single clean label: frequency only (time on hover) */}
            <span className="text-[9px] font-mono text-gray-500 leading-none">
              {freq.toLocaleString()}
            </span>
            {(hovered || selected) && throughputTime && (
              <div className="text-[9px] text-gray-400 leading-none mt-0.5 whitespace-nowrap">
                {throughputTime}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
