/**
 * Extract and analyze process variants from event log.
 */
import type { EventLog, Variant, Case } from './types';

export function extractVariants(eventLog: EventLog): Variant[] {
  const variantMap = new Map<string, { activities: string[]; caseIds: string[] }>();

  for (const caseData of eventLog.cases) {
    const key = caseData.variant;
    const existing = variantMap.get(key);
    if (existing) {
      existing.caseIds.push(caseData.id);
    } else {
      variantMap.set(key, {
        activities: caseData.events.map((e) => e.activity),
        caseIds: [caseData.id],
      });
    }
  }

  const totalCases = eventLog.cases.length;
  const variants: Variant[] = [];
  let id = 1;

  for (const [_key, data] of variantMap) {
    variants.push({
      id: `#${id}`,
      activities: data.activities,
      frequency: data.caseIds.length,
      caseIds: data.caseIds,
      percentage: totalCases > 0 ? (data.caseIds.length / totalCases) * 100 : 0,
    });
    id++;
  }

  // Sort by frequency descending
  variants.sort((a, b) => b.frequency - a.frequency);

  // Re-number after sort
  variants.forEach((v, i) => {
    v.id = `#${i + 1}`;
  });

  return variants;
}

/**
 * Get cases covered by a set of variants.
 */
export function getCasesForVariants(variants: Variant[]): Set<string> {
  const caseIds = new Set<string>();
  for (const variant of variants) {
    for (const caseId of variant.caseIds) {
      caseIds.add(caseId);
    }
  }
  return caseIds;
}

/**
 * Sort variants by various criteria.
 */
export type VariantSortBy = 'frequency' | 'activity_count' | 'throughput';

export function sortVariants(
  variants: Variant[],
  sortBy: VariantSortBy = 'frequency',
): Variant[] {
  const sorted = [...variants];
  switch (sortBy) {
    case 'frequency':
      sorted.sort((a, b) => b.frequency - a.frequency);
      break;
    case 'activity_count':
      sorted.sort((a, b) => b.activities.length - a.activities.length);
      break;
    default:
      sorted.sort((a, b) => b.frequency - a.frequency);
  }
  return sorted;
}
