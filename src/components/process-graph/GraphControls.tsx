/**
 * Celonis-style right sidebar controls for the process graph.
 * Shows Activities/Connections sliders and KPI selector.
 */
import { useMemo } from 'react';
import { useMiningStore } from '@/store/mining-store';
import { PROCESS_START, PROCESS_END } from '@/mining/dfg';

export function GraphControls() {
  const {
    dfg,
    visibleNodes,
    visibleEdges,
    kpiType,
    aggregationMethod,
    timeUnit,
    toggleNode,
    addAllNodes,
    setKpiType,
    setAggregationMethod,
    setTimeUnit,
  } = useMiningStore();

  const totalActivities = useMemo(() => {
    if (!dfg) return 0;
    return dfg.nodes.filter(n => n.activity !== PROCESS_START && n.activity !== PROCESS_END).length;
  }, [dfg]);

  const totalConnections = useMemo(() => {
    if (!dfg) return 0;
    return dfg.edges.length;
  }, [dfg]);

  const visibleActivityCount = useMemo(() => {
    return visibleNodes.size - (visibleNodes.has(PROCESS_START) ? 1 : 0) - (visibleNodes.has(PROCESS_END) ? 1 : 0);
  }, [visibleNodes]);

  const activityPct = totalActivities > 0 ? Math.round((visibleActivityCount / totalActivities) * 100) : 100;
  const connectionPct = totalConnections > 0 ? Math.round((visibleEdges.size / totalConnections) * 100) : 100;

  const hiddenNodes = useMemo(() => {
    if (!dfg) return [];
    return dfg.nodes.filter(
      n => !visibleNodes.has(n.activity) &&
      n.activity !== PROCESS_START &&
      n.activity !== PROCESS_END,
    );
  }, [dfg, visibleNodes]);

  if (!dfg) return null;

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Activities */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0091ea] inline-block" />
            Activities
          </span>
        </div>
        {/* Donut-style percentage */}
        <div className="flex items-center justify-center mb-2">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke="#0091ea" strokeWidth="3"
                strokeDasharray={`${activityPct * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#0091ea]">
              {activityPct}%
            </span>
          </div>
        </div>
        <div className="text-center text-gray-400 mb-2">{visibleActivityCount} of {totalActivities} activities</div>
        <div className="flex items-center justify-between gap-1">
          {hiddenNodes.length < totalActivities && (
            <button
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => {
                // Remove lowest-frequency visible node
                const sorted = dfg.nodes
                  .filter(n => visibleNodes.has(n.activity) && n.activity !== PROCESS_START && n.activity !== PROCESS_END)
                  .sort((a, b) => a.frequency - b.frequency);
                if (sorted.length > 0) toggleNode(sorted[0].activity);
              }}
            >
              Less −
            </button>
          )}
          {hiddenNodes.length > 0 && (
            <button
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => {
                // Add highest-frequency hidden node
                const sorted = hiddenNodes.sort((a, b) => b.frequency - a.frequency);
                if (sorted.length > 0) toggleNode(sorted[0].activity);
              }}
            >
              More +
            </button>
          )}
        </div>
        {hiddenNodes.length > 0 && (
          <button
            onClick={addAllNodes}
            className="mt-1 w-full text-center text-[#0091ea] hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Connections */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#0091ea] inline-block" />
            Connections
          </span>
        </div>
        <div className="flex items-center justify-center mb-2">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke="#0091ea" strokeWidth="3"
                strokeDasharray={`${connectionPct * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#0091ea]">
              {connectionPct}%
            </span>
          </div>
        </div>
        <div className="text-center text-gray-400 mb-1">{visibleEdges.size} of {totalConnections} connections</div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* KPI Selector */}
      <div>
        <label className="font-semibold text-gray-700 block mb-1.5">Edge Metric</label>
        <select
          value={kpiType}
          onChange={(e) => setKpiType(e.target.value as typeof kpiType)}
          className="border border-gray-300 rounded px-2 py-1.5 text-xs w-full"
        >
          <option value="frequency">Frequency</option>
          <option value="throughput_time">Throughput Time</option>
        </select>

        {kpiType === 'throughput_time' && (
          <div className="mt-2 flex gap-1">
            <select
              value={aggregationMethod}
              onChange={(e) => setAggregationMethod(e.target.value as typeof aggregationMethod)}
              className="border border-gray-300 rounded px-1 py-1 text-xs flex-1"
            >
              <option value="median">Median</option>
              <option value="mean">Average</option>
              <option value="trimmed_mean">Trimmed</option>
              <option value="max">Max</option>
              <option value="min">Min</option>
            </select>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value as typeof timeUnit)}
              className="border border-gray-300 rounded px-1 py-1 text-xs"
            >
              <option value="minutes">min</option>
              <option value="hours">hr</option>
              <option value="seconds">sec</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
