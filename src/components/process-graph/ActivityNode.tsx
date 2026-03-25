/**
 * Custom React Flow node styled like Celonis activity nodes.
 * Color-coded by process phase for visual distinction.
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

// Phase-based color mapping for activity nodes
function getNodeStyle(label: string): { bg: string; border: string; text: string } {
  if (label === PROCESS_START || label === PROCESS_END)
    return { bg: '#0091ea', border: '#0077c2', text: 'white' };
  // Registration/intake phase
  if (['Registration', 'Vitals & Triage'].includes(label))
    return { bg: '#607d8b', border: '#455a64', text: 'white' }; // blue-gray
  // Waiting/queue
  if (['Waiting Room', 'Queue Reassignment'].includes(label))
    return { bg: '#ff9800', border: '#e65100', text: 'white' }; // orange
  // Clinical team phase
  if (['History Taking', 'Physical Examination', 'Clinical Assessment', 'Care Planning',
       'Chart Review', 'Medication Reconciliation', 'Progress Assessment',
       'Chief Complaint', 'Focused Examination', 'Treatment Plan'].includes(label))
    return { bg: '#4caf50', border: '#2e7d32', text: 'white' }; // green
  // Handoff
  if (['CT-Attending Handoff', 'Case Discussion'].includes(label))
    return { bg: '#00897b', border: '#00695c', text: 'white' }; // teal
  // Attending phase
  if (['Case Presentation', 'Attending Examination', 'Collaborative Planning',
       'Case Update', 'Joint Assessment', 'Follow-up Plan',
       'Quick Review', 'Focused Treatment'].includes(label))
    return { bg: '#1976d2', border: '#0d47a1', text: 'white' }; // blue
  // Checkout/discharge
  if (['Discharge Instructions', 'Follow-up Scheduling'].includes(label))
    return { bg: '#607d8b', border: '#455a64', text: 'white' }; // blue-gray
  // Optional/special (labs, imaging, referrals, rework)
  return { bg: '#f57c00', border: '#e65100', text: 'white' }; // amber
}

export const ActivityNode = memo(function ActivityNode({ data }: NodeProps) {
  const d = data as unknown as ActivityNodeData;
  const isStart = d.label === PROCESS_START;
  const isEnd = d.label === PROCESS_END;
  const isStartEnd = isStart || isEnd;
  const style = getNodeStyle(d.label);

  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" />

      <div
        className="flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer"
        style={{
          width: isStartEnd ? 44 : 64,
          height: isStartEnd ? 44 : 64,
          backgroundColor: style.bg,
          border: `3px solid ${style.border}`,
        }}
        title={`${d.label}\n${d.frequency} cases`}
      >
        {isStart && (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
            <polygon points="4,2 14,8 4,14" />
          </svg>
        )}
        {isEnd && (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
            <circle cx="8" cy="8" r="6" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="8" cy="8" r="3" fill="white" />
          </svg>
        )}
      </div>

      <div className="mt-1 text-center" style={{ maxWidth: 140 }}>
        <div className="text-[10px] font-bold text-gray-800 leading-tight whitespace-nowrap">
          {d.label}
        </div>
        <div className="text-[9px] text-gray-500 font-mono">
          {typeof d.frequency === 'number' ? d.frequency.toLocaleString() : ''}
        </div>
        {d.kpiValue && (
          <div className="text-[9px] font-mono font-semibold" style={{ color: style.bg }}>{d.kpiValue}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" />
    </div>
  );
});
