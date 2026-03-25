/**
 * Custom React Flow node — Celonis-style rectangular activity box
 * with label INSIDE, frequency badge, and phase-based coloring.
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
  return '#e65100'; // optional/special
}

export const ActivityNode = memo(function ActivityNode({ data }: NodeProps) {
  const d = data as unknown as ActivityNodeData;
  const isStart = d.label === PROCESS_START;
  const isEnd = d.label === PROCESS_END;
  const isStartEnd = isStart || isEnd;
  const color = isStartEnd ? '#0091ea' : getNodeColor(d.label);

  if (isStartEnd) {
    return (
      <div className="flex flex-col items-center">
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" />
        <div
          className="flex items-center justify-center rounded-full shadow-md"
          style={{ width: 36, height: 36, backgroundColor: color }}
        >
          {isStart ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white"><polygon points="5,2 14,8 5,14" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white"><circle cx="8" cy="8" r="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="8" cy="8" r="2.5" fill="white"/></svg>
          )}
        </div>
        <div className="text-[9px] text-gray-400 mt-0.5 font-medium">{d.label}</div>
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" />
      {/* Rectangular activity box with label inside */}
      <div
        className="rounded-lg shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.04] flex flex-col items-center justify-center px-4 py-2.5"
        style={{ backgroundColor: color, minWidth: 160 }}
        title={`${d.label}\n${d.frequency} cases`}
      >
        <div className="text-[13px] font-bold text-white text-center leading-tight whitespace-nowrap">
          {d.label}
        </div>
        <div className="text-[11px] text-white/80 font-mono mt-0.5">
          {d.frequency.toLocaleString()}
        </div>
      </div>
      {d.kpiValue && (
        <div className="text-[9px] font-mono mt-0.5" style={{ color }}>{d.kpiValue}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" />
    </div>
  );
});
