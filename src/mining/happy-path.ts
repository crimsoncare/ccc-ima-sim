/**
 * Happy path algorithm.
 * Finds the most frequent variant connecting the most frequent
 * start and end activities.
 */
import type { EventLog, Variant } from './types';
import { extractVariants } from './variants';
import { PROCESS_START, PROCESS_END } from './dfg';

export interface HappyPath {
  activities: string[];
  caseIds: string[];
  frequency: number;
  percentage: number;
}

export function computeHappyPath(eventLog: EventLog): HappyPath | null {
  if (eventLog.cases.length === 0) return null;

  // Find most frequent start and end activities
  const startCounts = new Map<string, number>();
  const endCounts = new Map<string, number>();

  for (const caseData of eventLog.cases) {
    if (caseData.events.length === 0) continue;
    const firstActivity = caseData.events[0].activity;
    const lastActivity = caseData.events[caseData.events.length - 1].activity;
    startCounts.set(firstActivity, (startCounts.get(firstActivity) ?? 0) + 1);
    endCounts.set(lastActivity, (endCounts.get(lastActivity) ?? 0) + 1);
  }

  const mostFrequentStart = getMaxEntry(startCounts);
  const mostFrequentEnd = getMaxEntry(endCounts);

  if (!mostFrequentStart || !mostFrequentEnd) return null;

  // Find the most frequent variant that starts with mostFrequentStart
  // and ends with mostFrequentEnd
  const variants = extractVariants(eventLog);

  const matchingVariants = variants.filter((v) => {
    if (v.activities.length === 0) return false;
    return (
      v.activities[0] === mostFrequentStart &&
      v.activities[v.activities.length - 1] === mostFrequentEnd
    );
  });

  if (matchingVariants.length === 0) {
    // Fall back to the most frequent variant overall
    return variants.length > 0
      ? {
          activities: variants[0].activities,
          caseIds: variants[0].caseIds,
          frequency: variants[0].frequency,
          percentage: variants[0].percentage,
        }
      : null;
  }

  // Pick the most frequent matching variant
  const best = matchingVariants[0]; // Already sorted by frequency
  return {
    activities: best.activities,
    caseIds: best.caseIds,
    frequency: best.frequency,
    percentage: best.percentage,
  };
}

function getMaxEntry(map: Map<string, number>): string | null {
  let maxKey: string | null = null;
  let maxVal = -1;
  for (const [key, val] of map) {
    if (val > maxVal) {
      maxVal = val;
      maxKey = key;
    }
  }
  return maxKey;
}

/**
 * Get set of activities and edges in the happy path for filtering the DFG.
 */
export function getHappyPathElements(happyPath: HappyPath): {
  activities: Set<string>;
  edges: Set<string>;
} {
  const activities = new Set<string>();
  const edges = new Set<string>();

  activities.add(PROCESS_START);
  activities.add(PROCESS_END);

  for (const activity of happyPath.activities) {
    activities.add(activity);
  }

  if (happyPath.activities.length > 0) {
    edges.add(`${PROCESS_START}->${happyPath.activities[0]}`);
    edges.add(
      `${happyPath.activities[happyPath.activities.length - 1]}->${PROCESS_END}`,
    );
    for (let i = 0; i < happyPath.activities.length - 1; i++) {
      edges.add(`${happyPath.activities[i]}->${happyPath.activities[i + 1]}`);
    }
  }

  return { activities, edges };
}
