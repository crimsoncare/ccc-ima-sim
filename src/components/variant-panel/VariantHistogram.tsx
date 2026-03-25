/**
 * Variant distribution bar chart (horizontal bars like Celonis).
 * Shows percentage coverage with throughput time annotations.
 */
import { useMiningStore } from '@/store/mining-store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export function VariantHistogram() {
  const { variants, selectedVariantIds, toggleVariant } = useMiningStore();

  if (!variants || variants.length === 0) return null;

  const data = variants.slice(0, 15).map((v) => ({
    name: v.id,
    percentage: v.percentage,
    frequency: v.frequency,
    selected: selectedVariantIds.has(v.id),
  }));

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">Variant Distribution</h3>
      <p className="text-[11px] text-gray-500 mb-3">
        Click a bar to toggle graph highlighting
      </p>
      <ResponsiveContainer width="100%" height={Math.max(250, data.length * 28)}>
        <BarChart data={data} layout="vertical" margin={{ left: 5, right: 40, top: 0, bottom: 0 }}>
          <XAxis
            type="number"
            domain={[0, 'auto']}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            fontSize={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={35}
            fontSize={11}
            fontWeight={600}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Coverage']}
            labelFormatter={(label) => `Variant ${label}`}
          />
          <Bar
            dataKey="percentage"
            radius={[0, 3, 3, 0]}
            cursor="pointer"
            onClick={(data: unknown) => toggleVariant((data as { name: string }).name)}
            barSize={18}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.selected ? '#0091ea' : '#d1d5db'}
              />
            ))}
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={(v) => `${Number(v).toFixed(1)}%`}
              style={{ fontSize: 10, fill: '#6b7280' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
