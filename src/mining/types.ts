/**
 * Process mining data types.
 */

export interface ProcessEvent {
  caseId: string;
  activity: string;
  timestamp: number;
  stateCode: number;
}

export interface Case {
  id: string;
  events: ProcessEvent[];
  variant: string; // Activity sequence as string key
}

export interface EventLog {
  events: ProcessEvent[];
  cases: Case[];
}

export interface DFGNode {
  activity: string;
  frequency: number;
}

export interface DFGEdge {
  source: string;
  target: string;
  frequency: number;
  throughputTimes: number[];
}

export interface DirectlyFollowsGraph {
  nodes: DFGNode[];
  edges: DFGEdge[];
}

export interface Variant {
  id: string;
  activities: string[];
  frequency: number;
  caseIds: string[];
  percentage: number;
}

export type AggregationMethod = 'median' | 'mean' | 'trimmed_mean' | 'max' | 'min';
export type TimeUnit = 'days' | 'hours' | 'minutes' | 'seconds';
export type ActivityMetric = 'flow_through' | 'not_flow_through' | 'start_with' | 'end_with';
export type KpiType = 'frequency' | 'throughput_time' | 'case_count';
