/**
 * Custom React Flow node styled like Celonis activity nodes.
 * Circular node with activity name and KPI value.
 */
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { PROCESS_START, PROCESS_END } from '@/mining/dfg';

export interface ActivityNodeData {
  label: string;
  frequency: number;
  kpiValue?: string;
  isStartEnd?: boolean;
  [key: string]: unknown;
}

export const ActivityNode = memo(function ActivityNode({
  data,
}: NodeProps) {
  const nodeData = data as unknown as ActivityNodeData;
  const isStartEnd = nodeData.label === PROCESS_START || nodeData.label === PROCESS_END;
  const isStart = nodeData.label === PROCESS_START;
  const isEnd = nodeData.label === PROCESS_END;

  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" />

      {/* Activity circle — Celonis-style with name inside */}
      <div
        className={`
          flex items-center justify-center rounded-full shadow-lg
          transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer
          border-3
          ${isStartEnd
            ? 'w-12 h-12 bg-[#0091ea] border-[#0077c2]'
            : 'w-[72px] h-[72px] bg-[#ff8c00] border-[#e67e00]'
          }
        `}
        title={`${nodeData.label}\n${nodeData.frequency} cases`}
      >
        {isStart && (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="white">
            <polygon points="4,2 14,8 4,14" />
          </svg>
        )}
        {isEnd && (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="white">
            <circle cx="8" cy="8" r="6" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="8" cy="8" r="3" fill="white" />
          </svg>
        )}
      </div>

      {/* Activity label — visible, not truncated */}
      <div className="mt-1.5 text-center max-w-[160px]">
        <div className="text-[11px] font-bold text-gray-800 leading-tight whitespace-nowrap">
          {nodeData.label}
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          {typeof nodeData.frequency === 'number' ? nodeData.frequency.toLocaleString() : ''}
        </div>
        {nodeData.kpiValue && (
          <div className="text-[10px] text-[#0091ea] font-mono font-semibold">{nodeData.kpiValue}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" />
    </div>
  );
});
