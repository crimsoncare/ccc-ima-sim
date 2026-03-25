/**
 * Variant distribution bar chart (horizontal bars like Celonis).
 */
import { useMiningStore } from '@/store/mining-store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function VariantHistogram() {
  const { variants, selectedVariantIds, toggleVariant } = useMiningStore();

  if (!variants || variants.length === 0) return null;

  const data = variants.slice(0, 20).map((v) => ({
    name: v.id,
    percentage: v.percentage,
    frequency: v.frequency,
    selected: selectedVariantIds.has(v.id),
  }));

  return (
    <div className="p-3">
      <div className="text-xs text-gray-500 mb-2">Most common variant</div>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 28)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
          <XAxis
            type="number"
            domain={[0, 'auto']}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            fontSize={10}
          />
          <YAxis type="category" dataKey="name" width={40} fontSize={10} />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Coverage']}
            labelFormatter={(label) => `Variant ${label}`}
          />
          <Bar
            dataKey="percentage"
            radius={[0, 2, 2, 0]}
            cursor="pointer"
            onClick={(data: any) => toggleVariant(data.name as string)}
          >
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
