/**
 * Graph controls: add/remove nodes, KPI selector, animation controls.
 */
import { useMiningStore } from '@/store/mining-store';
import { PROCESS_START, PROCESS_END } from '@/mining/dfg';

export function GraphControls() {
  const {
    dfg,
    visibleNodes,
    kpiType,
    aggregationMethod,
    timeUnit,
    isAnimating,
    animationSpeed,
    toggleNode,
    addAllNodes,
    setKpiType,
    setAggregationMethod,
    setTimeUnit,
    setIsAnimating,
    setAnimationSpeed,
  } = useMiningStore();

  if (!dfg) return null;

  const hiddenNodes = dfg.nodes.filter(
    (n) => !visibleNodes.has(n.activity) &&
    n.activity !== PROCESS_START &&
    n.activity !== PROCESS_END,
  );

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      {/* KPI Selector */}
      <div className="bg-white rounded-lg shadow-md p-2 text-xs">
        <label className="text-gray-500 block mb-1">KPI</label>
        <select
          value={kpiType}
          onChange={(e) => setKpiType(e.target.value as typeof kpiType)}
          className="border rounded px-2 py-1 text-xs w-full"
        >
          <option value="frequency">Frequency</option>
          <option value="throughput_time">Throughput Time</option>
        </select>

        {kpiType === 'throughput_time' && (
          <div className="mt-1 flex gap-1">
            <select
              value={aggregationMethod}
              onChange={(e) => setAggregationMethod(e.target.value as typeof aggregationMethod)}
              className="border rounded px-1 py-0.5 text-xs flex-1"
            >
              <option value="median">Median</option>
              <option value="mean">Average</option>
              <option value="trimmed_mean">Trimmed Mean</option>
              <option value="max">Maximum</option>
              <option value="min">Minimum</option>
            </select>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value as typeof timeUnit)}
              className="border rounded px-1 py-0.5 text-xs"
            >
              <option value="minutes">min</option>
              <option value="hours">hr</option>
              <option value="seconds">sec</option>
            </select>
          </div>
        )}
      </div>

      {/* Add/Remove Activities */}
      {hiddenNodes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-2 text-xs">
          <label className="text-gray-500 block mb-1">Add Activity</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                toggleNode(e.target.value);
                e.target.value = '';
              }
            }}
            className="border rounded px-2 py-1 text-xs w-full"
            defaultValue=""
          >
            <option value="" disabled>
              Select...
            </option>
            {hiddenNodes.map((n) => (
              <option key={n.activity} value={n.activity}>
                {n.activity} ({n.frequency})
              </option>
            ))}
          </select>
          <button
            onClick={addAllNodes}
            className="mt-1 text-[#0091ea] hover:underline text-xs"
          >
            Show all activities
          </button>
        </div>
      )}

      {/* Animation Controls */}
      <div className="bg-white rounded-lg shadow-md p-2 text-xs">
        <label className="text-gray-500 block mb-1">Animation</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-2 py-1 rounded text-white text-xs ${
              isAnimating ? 'bg-red-500' : 'bg-[#0091ea]'
            }`}
          >
            {isAnimating ? '■ Stop' : '▶ Play'}
          </button>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-16"
          />
          <span className="text-gray-400">{animationSpeed.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
}
