/**
 * Throughput time distribution histogram.
 */
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useMiningStore } from '@/store/mining-store';
import {
  computeThroughputTime,
  convertTimeUnit,
  getTimeUnitLabel,
  createThroughputHistogram,
} from '@/mining/throughput';

export function ThroughputHistogram() {
  const { dfg, selectedEdge, aggregationMethod, timeUnit } = useMiningStore();

  const edgeData = useMemo(() => {
    if (!dfg || !selectedEdge) return null;
    return dfg.edges.find(
      (e) => e.source === selectedEdge.source && e.target === selectedEdge.target,
    );
  }, [dfg, selectedEdge]);

  const histData = useMemo(() => {
    if (!edgeData) return null;
    const values = edgeData.throughputTimes.map((t) => convertTimeUnit(t, timeUnit));
    const histogram = createThroughputHistogram(values, 25);
    const aggregated = convertTimeUnit(
      computeThroughputTime(edgeData, aggregationMethod),
      timeUnit,
    );
    return {
      data: histogram.bins.map((bin, i) => ({
        bin: bin.toFixed(1),
        count: histogram.counts[i],
      })),
      aggregated,
    };
  }, [edgeData, aggregationMethod, timeUnit]);

  if (!selectedEdge) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        Select start and end activities to view throughput time distribution.
      </div>
    );
  }

  if (!edgeData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No direct connection found between {selectedEdge.source} and{' '}
        {selectedEdge.target}.
      </div>
    );
  }

  const unit = getTimeUnitLabel(timeUnit);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2">
        {selectedEdge.source} → {selectedEdge.target}
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        {edgeData.throughputTimes.length} cases |{' '}
        {aggregationMethod}: {histData?.aggregated.toFixed(1)} {unit}
      </p>

      {histData && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={histData.data} margin={{ left: 10, right: 10 }}>
            <XAxis
              dataKey="bin"
              fontSize={10}
              label={{ value: `Time (${unit})`, position: 'bottom', fontSize: 11 }}
            />
            <YAxis fontSize={10} label={{ value: 'Cases', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [Number(value), 'Cases']}
              labelFormatter={(label) => `${label} ${unit}`}
            />
            <Bar dataKey="count" fill="#0091ea" radius={[2, 2, 0, 0]} />
            <ReferenceLine
              x={histData.aggregated.toFixed(1)}
              stroke="#ff6900"
              strokeDasharray="3 3"
              label={{ value: aggregationMethod, fontSize: 10, fill: '#ff6900' }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
