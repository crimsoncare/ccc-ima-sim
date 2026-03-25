/**
 * Controls for throughput time analysis.
 */
import { useMiningStore } from '@/store/mining-store';

export function ThroughputControls() {
  const {
    dfg,
    aggregationMethod,
    timeUnit,
    selectedEdge,
    setAggregationMethod,
    setTimeUnit,
    setSelectedEdge,
  } = useMiningStore();

  if (!dfg) return null;

  const activities = dfg.nodes.map((n) => n.activity);

  return (
    <div className="flex flex-wrap gap-4 mb-4 bg-white rounded-lg shadow p-4">
      {/* Start/End Activity Selection */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Start Activity</label>
        <select
          value={selectedEdge?.source ?? ''}
          onChange={(e) => {
            const source = e.target.value;
            setSelectedEdge(
              source ? { source, target: selectedEdge?.target ?? '' } : null,
            );
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Select...</option>
          {activities.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">End Activity</label>
        <select
          value={selectedEdge?.target ?? ''}
          onChange={(e) => {
            const target = e.target.value;
            setSelectedEdge(
              target ? { source: selectedEdge?.source ?? '', target } : null,
            );
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Select...</option>
          {activities.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Aggregation Method */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Calculation</label>
        <select
          value={aggregationMethod}
          onChange={(e) => setAggregationMethod(e.target.value as typeof aggregationMethod)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="median">Median</option>
          <option value="mean">Average</option>
          <option value="trimmed_mean">Trimmed Mean</option>
          <option value="max">Maximum</option>
          <option value="min">Minimum</option>
        </select>
      </div>

      {/* Time Unit */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Unit</label>
        <select
          value={timeUnit}
          onChange={(e) => setTimeUnit(e.target.value as typeof timeUnit)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="seconds">Seconds</option>
          <option value="days">Days</option>
        </select>
      </div>
    </div>
  );
}
