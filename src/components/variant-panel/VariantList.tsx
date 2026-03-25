/**
 * List of process variants with activity sequences.
 */
import { useMiningStore } from '@/store/mining-store';

export function VariantList() {
  const { variants, selectedVariantIds, toggleVariant, setSelectedVariantIds } =
    useMiningStore();

  if (!variants || variants.length === 0) return null;

  const selectedCount = variants.filter((v) => selectedVariantIds.has(v.id)).length;
  const totalCasesCovered = variants
    .filter((v) => selectedVariantIds.has(v.id))
    .reduce((sum, v) => sum + v.frequency, 0);
  const totalCases = variants.reduce((sum, v) => sum + v.frequency, 0);
  const coveragePercent = totalCases > 0 ? ((totalCasesCovered / totalCases) * 100).toFixed(0) : '0';

  return (
    <div className="p-3">
      {/* Controls */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            // Show fewer: keep only top N
            const top = variants.slice(0, Math.max(1, selectedCount - 1));
            setSelectedVariantIds(new Set(top.map((v) => v.id)));
          }}
          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
        >
          Less
        </button>
        <button
          onClick={() => {
            setSelectedVariantIds(new Set(variants.map((v) => v.id)));
          }}
          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
        >
          ⟲
        </button>
        <button
          onClick={() => {
            const next = Math.min(variants.length, selectedCount + 1);
            const top = variants.slice(0, next);
            setSelectedVariantIds(new Set(top.map((v) => v.id)));
          }}
          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
        >
          More
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs text-gray-500 mb-3 bg-gray-50 rounded p-2">
        <div>
          <span className="font-semibold text-gray-700">{selectedCount}</span>{' '}
          of {variants.length} variants
        </div>
        <div>
          <span className="font-semibold text-gray-700">{coveragePercent}%</span>{' '}
          of cases covered
        </div>
      </div>

      {/* Variant list */}
      <div className="space-y-2">
        {variants.map((variant) => (
          <div
            key={variant.id}
            onClick={() => toggleVariant(variant.id)}
            className={`
              p-2 rounded border cursor-pointer transition-colors text-xs
              ${selectedVariantIds.has(variant.id)
                ? 'border-[#0091ea] bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{variant.id}</span>
              <span className="text-gray-500">
                {variant.frequency} cases ({variant.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {variant.activities.map((activity, i) => (
                <span key={i} className="flex items-center gap-0.5">
                  <span className="bg-[#ff8c00] text-white px-1 py-0.5 rounded text-[9px]">
                    {activity}
                  </span>
                  {i < variant.activities.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
