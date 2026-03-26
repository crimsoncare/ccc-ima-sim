/**
 * Detail panel that appears when a node or edge is selected in the process graph.
 * Shows activity metrics or edge throughput information.
 */
import { useMiningStore } from '@/store/mining-store';
import { computeThroughputTime, convertTimeUnit, getTimeUnitLabel } from '@/mining/throughput';

export function DetailPanel() {
  const {
    dfg, selectedActivity, selectedEdge,
    aggregationMethod, timeUnit,
    setSelectedActivity, setSelectedEdge,
  } = useMiningStore();

  if (!dfg) return null;

  // Node detail
  if (selectedActivity) {
    const node = dfg.nodes.find(n => n.activity === selectedActivity);
    if (!node) return null;

    const inEdges = dfg.edges.filter(e => e.target === selectedActivity);
    const outEdges = dfg.edges.filter(e => e.source === selectedActivity);
    const totalIn = inEdges.reduce((s, e) => s + e.frequency, 0);
    const totalOut = outEdges.reduce((s, e) => s + e.frequency, 0);

    return (
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColorForActivity(selectedActivity) }} />
            <h4 className="font-bold text-gray-800 text-sm">{selectedActivity}</h4>
          </div>
          <button onClick={() => setSelectedActivity(null)} className="text-gray-400 hover:text-gray-600 text-xs">
            Close
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{node.frequency.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400 uppercase">Cases</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{inEdges.length}</div>
            <div className="text-[10px] text-gray-400 uppercase">Inputs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{outEdges.length}</div>
            <div className="text-[10px] text-gray-400 uppercase">Outputs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {totalIn > 0 ? `${((node.frequency / totalIn) * 100).toFixed(0)}%` : '—'}
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Flow-through</div>
          </div>
        </div>
        {inEdges.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase mb-1">Incoming edges</p>
            <div className="flex flex-wrap gap-1">
              {inEdges.map(e => (
                <span key={e.source} className="text-[10px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">
                  {e.source} ({e.frequency})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edge detail
  if (selectedEdge) {
    const edge = dfg.edges.find(e => e.source === selectedEdge.source && e.target === selectedEdge.target);
    if (!edge) return null;

    const tTime = computeThroughputTime(edge, aggregationMethod);
    const tConverted = convertTimeUnit(tTime, timeUnit);
    const totalFromSource = dfg.edges.filter(e => e.source === edge.source).reduce((s, e) => s + e.frequency, 0);
    const pct = totalFromSource > 0 ? ((edge.frequency / totalFromSource) * 100).toFixed(1) : '—';

    return (
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">
            {edge.source} <span className="text-gray-400 font-normal mx-1">→</span> {edge.target}
          </h4>
          <button onClick={() => setSelectedEdge(null)} className="text-gray-400 hover:text-gray-600 text-xs">
            Close
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{edge.frequency.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400 uppercase">Cases</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {tConverted > 0 ? `${tConverted.toFixed(1)} ${getTimeUnitLabel(timeUnit)}` : '—'}
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Throughput</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{pct}%</div>
            <div className="text-[10px] text-gray-400 uppercase">of source output</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function getColorForActivity(label: string): string {
  if (['Registration', 'Vitals & Triage', 'Discharge Instructions', 'Follow-up Scheduling'].includes(label)) return '#607d8b';
  if (['Waiting Room', 'Queue Reassignment'].includes(label)) return '#ef6c00';
  if (['History Taking', 'Physical Examination', 'Clinical Assessment', 'Care Planning',
       'Chart Review', 'Medication Reconciliation', 'Progress Assessment',
       'Chief Complaint', 'Focused Examination', 'Treatment Plan'].includes(label)) return '#2e7d32';
  if (['CT-Attending Handoff', 'Case Discussion'].includes(label)) return '#00796b';
  if (['Case Presentation', 'Attending Examination', 'Collaborative Planning',
       'Case Update', 'Joint Assessment', 'Follow-up Plan',
       'Quick Review', 'Focused Treatment'].includes(label)) return '#1565c0';
  if (['Process Start', 'Process End'].includes(label)) return '#0091ea';
  return '#e65100';
}
