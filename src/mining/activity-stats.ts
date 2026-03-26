/**
 * Activity statistics: coverage and metrics.
 */
import type { EventLog, ActivityMetric } from './types';

export interface ActivityStat {
  activity: string;
  count: number;
  totalCases: number;
  percentage: number;
}

/**
 * Compute activity metrics.
 */
export function computeActivityStats(
  eventLog: EventLog,
  metric: ActivityMetric = 'flow_through',
): ActivityStat[] {
  const totalCases = eventLog.cases.length;
  const activitySet = new Set<string>();

  // Collect all activities
  for (const c of eventLog.cases) {
    for (const e of c.events) {
      activitySet.add(e.activity);
    }
  }

  const stats: ActivityStat[] = [];

  for (const activity of activitySet) {
    let count = 0;

    for (const caseData of eventLog.cases) {
      const caseActivities = caseData.events.map((e) => e.activity);
      const hasActivity = caseActivities.includes(activity);
      const startsWithActivity =
        caseActivities.length > 0 && caseActivities[0] === activity;
      const endsWithActivity =
        caseActivities.length > 0 &&
        caseActivities[caseActivities.length - 1] === activity;

      switch (metric) {
        case 'flow_through':
          if (hasActivity) count++;
          break;
        case 'not_flow_through':
          if (!hasActivity) count++;
          break;
        case 'start_with':
          if (startsWithActivity) count++;
          break;
        case 'end_with':
          if (endsWithActivity) count++;
          break;
      }
    }

    stats.push({
      activity,
      count,
      totalCases,
      percentage: totalCases > 0 ? (count / totalCases) * 100 : 0,
    });
  }

  // Sort by count descending
  stats.sort((a, b) => b.count - a.count);
  return stats;
}

/**
 * Get case IDs matching an activity metric.
 */
export function getCasesForActivity(
  eventLog: EventLog,
  activity: string,
  metric: ActivityMetric,
): Set<string> {
  const caseIds = new Set<string>();

  for (const caseData of eventLog.cases) {
    const caseActivities = caseData.events.map((e) => e.activity);
    const hasActivity = caseActivities.includes(activity);

    let match = false;
    switch (metric) {
      case 'flow_through':
        match = hasActivity;
        break;
      case 'not_flow_through':
        match = !hasActivity;
        break;
      case 'start_with':
        match = caseActivities.length > 0 && caseActivities[0] === activity;
        break;
      case 'end_with':
        match =
          caseActivities.length > 0 &&
          caseActivities[caseActivities.length - 1] === activity;
        break;
    }

    if (match) {
      caseIds.add(caseData.id);
    }
  }

  return caseIds;
}
