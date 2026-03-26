/**
 * Directly-Follows Graph computation from event log.
 */
import type { EventLog, DirectlyFollowsGraph, DFGNode, DFGEdge, Case } from './types';

export const PROCESS_START = 'Process Start';
export const PROCESS_END = 'Process End';

export function computeDFG(eventLog: EventLog): DirectlyFollowsGraph {
  const nodeFrequencies = new Map<string, number>();
  const edgeMap = new Map<string, { frequency: number; throughputTimes: number[] }>();

  // Process Start and End
  nodeFrequencies.set(PROCESS_START, eventLog.cases.length);
  nodeFrequencies.set(PROCESS_END, eventLog.cases.length);

  for (const caseData of eventLog.cases) {
    const events = caseData.events;
    if (events.length === 0) continue;

    // Start → first activity
    const firstActivity = events[0].activity;
    const startEdgeKey = `${PROCESS_START}->${firstActivity}`;
    addEdge(edgeMap, startEdgeKey, PROCESS_START, firstActivity, 0);

    // Activity → Activity edges
    for (let i = 0; i < events.length; i++) {
      const activity = events[i].activity;
      nodeFrequencies.set(activity, (nodeFrequencies.get(activity) ?? 0) + 1);

      if (i + 1 < events.length) {
        const nextActivity = events[i + 1].activity;
        const edgeKey = `${activity}->${nextActivity}`;
        const throughputTime = events[i + 1].timestamp - events[i].timestamp;
        addEdge(edgeMap, edgeKey, activity, nextActivity, throughputTime);
      }
    }

    // Last activity → End
    const lastActivity = events[events.length - 1].activity;
    const endEdgeKey = `${lastActivity}->${PROCESS_END}`;
    addEdge(edgeMap, endEdgeKey, lastActivity, PROCESS_END, 0);
  }

  const nodes: DFGNode[] = Array.from(nodeFrequencies.entries()).map(
    ([activity, frequency]) => ({ activity, frequency }),
  );

  const edges: DFGEdge[] = Array.from(edgeMap.entries()).map(([key, data]) => {
    const [source, target] = key.split('->');
    return {
      source,
      target,
      frequency: data.frequency,
      throughputTimes: data.throughputTimes,
    };
  });

  return { nodes, edges };
}

function addEdge(
  edgeMap: Map<string, { frequency: number; throughputTimes: number[] }>,
  key: string,
  _source: string,
  _target: string,
  throughputTime: number,
): void {
  const existing = edgeMap.get(key);
  if (existing) {
    existing.frequency++;
    existing.throughputTimes.push(throughputTime);
  } else {
    edgeMap.set(key, { frequency: 1, throughputTimes: [throughputTime] });
  }
}

/**
 * Filter DFG to only include specific cases.
 */
export function computeDFGForCases(
  eventLog: EventLog,
  caseIds: Set<string>,
): DirectlyFollowsGraph {
  const filteredLog: EventLog = {
    events: eventLog.events.filter((e) => caseIds.has(e.caseId)),
    cases: eventLog.cases.filter((c) => caseIds.has(c.id)),
  };
  return computeDFG(filteredLog);
}
