/**
 * Controls for activity search.
 */
import { useMiningStore } from '@/store/mining-store';

export function ActivityControls() {
  const { dfg, selectedActivity, activityMetric, setSelectedActivity, setActivityMetric } =
    useMiningStore();

  if (!dfg) return null;

  return (
    <div className="flex flex-wrap gap-4 mb-4 bg-white rounded-lg shadow p-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Activity</label>
        <select
          value={selectedActivity ?? ''}
          onChange={(e) => setSelectedActivity(e.target.value || null)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All activities</option>
          {dfg.nodes.map((n) => (
            <option key={n.activity} value={n.activity}>
              {n.activity}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Metric</label>
        <select
          value={activityMetric}
          onChange={(e) => setActivityMetric(e.target.value as typeof activityMetric)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="flow_through">Cases flow through</option>
          <option value="not_flow_through">Cases don't flow through</option>
          <option value="start_with">Cases start with</option>
          <option value="end_with">Cases end with</option>
        </select>
      </div>
    </div>
  );
}
