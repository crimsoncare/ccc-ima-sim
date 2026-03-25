/**
 * List of process variants with color-coded activity sequences.
 */
import { useState } from 'react';
import { useMiningStore } from '@/store/mining-store';

function getActivityColor(activity: string): string {
  // Registration / waiting phase
  if (['Registration', 'Vitals & Triage', 'Waiting Room', 'Queue Reassignment'].includes(activity)) return '#6b7280';
  // Clinical team phase
  if (['History Taking', 'Physical Examination', 'Clinical Assessment', 'Care Planning',
       'Chart Review', 'Medication Reconciliation', 'Progress Assessment',
       'Chief Complaint', 'Focused Examination', 'Treatment Plan'].includes(activity)) return '#339966';
  // Handoff
  if (['CT-Attending Handoff', 'Case Discussion'].includes(activity)) return '#2d8989';
  // Attending phase
  if (['Case Presentation', 'Attending Examination', 'Collaborative Planning',
       'Case Update', 'Joint Assessment', 'Follow-up Plan',
       'Quick Review', 'Focused Treatment'].includes(activity)) return '#336699';
  // Checkout
  if (['Discharge Instructions', 'Follow-up Scheduling'].includes(activity)) return '#6b7280';
  // Optional/special
  return '#d97706';
}

export function VariantList() {
  const { variants, selectedVariantIds, toggleVariant, setSelectedVariantIds } =
    useMiningStore();

  const [visibleCount, setVisibleCount] = useState(5);

  if (!variants || variants.length === 0) return null;

  const selectedCount = variants.filter((v) => selectedVariantIds.has(v.id)).length;
  const totalCases = variants.reduce((sum, v) => sum + v.frequency, 0);
  const maxFrequency = variants[0]?.frequency ?? 1;

  return (
    <div className="p-3">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Variants</h3>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
          Each variant represents a unique patient journey through the clinic. The most common variants cover the majority of cases.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            const top = variants.slice(0, Math.max(1, selectedCount - 1));
            setSelectedVariantIds(new Set(top.map((v) => v.id)));
          }}
          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
        >
          Less
        </button>
        <button
          onClick={() => setSelectedVariantIds(new Set(variants.map((v) => v.id)))}
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

      {/* Variant cards — progressive disclosure */}
      <div className="space-y-2">
        {variants.slice(0, visibleCount).map((variant) => {
          const selected = selectedVariantIds.has(variant.id);
          const barWidth = (variant.frequency / maxFrequency) * 100;
          return (
            <div
              key={variant.id}
              onClick={() => toggleVariant(variant.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                selected ? 'border-[#0091ea] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Top row: variant id + stats */}
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-gray-800">{variant.id}</span>
                <span className="text-[11px] text-gray-500">
                  {variant.frequency} cases · {variant.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Frequency bar */}
              <div className="h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: selected ? '#0091ea' : '#94a3b8',
                  }}
                />
              </div>

              {/* Activity pills with arrows */}
              <div className="flex flex-wrap items-center gap-y-1">
                {variant.activities.map((activity, i) => (
                  <span key={i} className="flex items-center">
                    <span
                      className="text-white px-1.5 py-0.5 rounded text-[10px] leading-tight whitespace-nowrap"
                      style={{ backgroundColor: getActivityColor(activity) }}
                    >
                      {activity}
                    </span>
                    {i < variant.activities.length - 1 && (
                      <span className="text-gray-300 mx-0.5 text-[10px]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / show less */}
      {variants.length > 5 && (
        <div className="flex justify-center gap-2 mt-3">
          {visibleCount < variants.length && (
            <button
              onClick={() => setVisibleCount(Math.min(variants.length, visibleCount + 5))}
              className="text-xs text-[#0091ea] hover:underline"
            >
              Show more ({variants.length - visibleCount} remaining)
            </button>
          )}
          {visibleCount > 5 && (
            <button
              onClick={() => setVisibleCount(5)}
              className="text-xs text-gray-400 hover:underline"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
