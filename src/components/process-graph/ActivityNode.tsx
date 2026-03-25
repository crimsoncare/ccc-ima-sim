/**
 * Custom React Flow node — Celonis Process Explorer style.
 * Filled circle with activity name to the right and frequency below.
 * Matches 01-celonis-process-graph.jpg exactly.
 */
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { PROCESS_START, PROCESS_END } from '@/mining/dfg';

export interface ActivityNodeData {
  label: string;
  frequency: number;
  kpiValue?: string;
  [key: string]: unknown;
}

function getNodeColor(label: string): string {
  if (['Registration', 'Vitals & Triage', 'Discharge Instructions', 'Follow-up Scheduling'].includes(label)) return '#607d8b';
  if (['Waiting Room', 'Queue Reassignment'].includes(label)) return '#ef6c00';
  if (['History Taking', 'Physical Examination', 'Clinical Assessment', 'Care Planning',
       'Chart Review', 'Medication Reconciliation', 'Progress Assessment',
       'Chief Complaint', 'Focused Examination', 'Treatment Plan'].includes(label)) return '#2e7d32';
  if (['CT-Attending Handoff', 'Case Discussion'].includes(label)) return '#00796b';
  if (['Case Presentation', 'Attending Examination', 'Collaborative Planning',
       'Case Update', 'Joint Assessment', 'Follow-up Plan',
       'Quick Review', 'Focused Treatment'].includes(label)) return '#1565c0';
  return '#e65100';
}

export const ActivityNode = memo(function ActivityNode({ data, selected }: NodeProps) {
  const d = data as unknown as ActivityNodeData;
  const isStart = d.label === PROCESS_START;
  const isEnd = d.label === PROCESS_END;
  const isStartEnd = isStart || isEnd;
  const color = isStartEnd ? '#0091ea' : getNodeColor(d.label);

  // Start/End: special icon circles with label to the right
  if (isStartEnd) {
    return (
      <div className="flex items-center gap-2">
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" />
        <div
          className="flex items-center justify-center rounded-full shadow-sm shrink-0"
          style={{ width: 28, height: 28, backgroundColor: color }}
        >
          {isStart ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white"><polygon points="5,2 14,8 5,14" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white"><circle cx="8" cy="8" r="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="8" cy="8" r="2.5" fill="white"/></svg>
          )}
        </div>
        <div>
          <div className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">{d.label}</div>
          <div className="text-[10px] text-gray-400 font-mono">{d.frequency.toLocaleString()}</div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" />
      </div>
    );
  }

  // Activity nodes: Celonis-style filled circle + right-aligned label
  return (
    <div className="flex items-center gap-2.5 cursor-pointer group" title={`${d.label}\n${d.frequency} cases`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" />
      {/* Filled circle with selection ring */}
      <div
        className={`rounded-full shrink-0 shadow-sm transition-all group-hover:scale-110 ${selected ? 'ring-3 ring-blue-400 ring-offset-2' : ''}`}
        style={{ width: 22, height: 22, backgroundColor: color }}
      />
      {/* Label + frequency to the right */}
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-gray-800 whitespace-nowrap leading-tight">
          {d.label}
        </div>
        <div className="text-[10px] text-gray-400 font-mono leading-tight">
          {d.frequency.toLocaleString()}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" />
    </div>
  );
});
