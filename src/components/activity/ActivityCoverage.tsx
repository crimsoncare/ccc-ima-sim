/**
 * Activity coverage bar chart.
 */
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useMiningStore } from '@/store/mining-store';
import { computeActivityStats } from '@/mining/activity-stats';

export function ActivityCoverage() {
  const { eventLog, activityMetric, selectedActivity } = useMiningStore();

  const stats = useMemo(() => {
    if (!eventLog) return [];
    return computeActivityStats(eventLog, activityMetric);
  }, [eventLog, activityMetric]);

  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
        No activity data available.
      </div>
    );
  }

  const data = stats.map((s) => ({
    activity: s.activity,
    percentage: s.percentage,
    count: s.count,
    total: s.totalCases,
    selected: selectedActivity === null || selectedActivity === s.activity,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-3">Activity Coverage</h3>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 35)}>
        <BarChart data={data} layout="vertical" margin={{ left: 100, right: 20 }}>
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            fontSize={10}
          />
          <YAxis
            type="category"
            dataKey="activity"
            width={90}
            fontSize={10}
          />
          <Tooltip
            formatter={(value) => [
              `${Number(value).toFixed(1)}%`,
              'Coverage',
            ]}
          />
          <Bar dataKey="percentage" radius={[0, 2, 2, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.selected ? '#0091ea' : '#e0e0e0'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
