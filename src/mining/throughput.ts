/**
 * Throughput time calculations between activities.
 */
import type { DirectlyFollowsGraph, DFGEdge, AggregationMethod, TimeUnit } from './types';

export interface ThroughputResult {
  source: string;
  target: string;
  values: number[];
  aggregated: number;
  method: AggregationMethod;
  unit: TimeUnit;
}

export function computeThroughputTime(
  edge: DFGEdge,
  method: AggregationMethod = 'median',
): number {
  const values = edge.throughputTimes;
  if (values.length === 0) return 0;

  switch (method) {
    case 'mean':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'median':
      return getMedian(values);
    case 'trimmed_mean':
      return getTrimmedMean(values, 0.1); // Trim 10% from each end
    case 'max': {
      let max = -Infinity;
      for (const v of values) if (v > max) max = v;
      return max;
    }
    case 'min': {
      let min = Infinity;
      for (const v of values) if (v < min) min = v;
      return min;
    }
    default:
      return getMedian(values);
  }
}

export function convertTimeUnit(
  minutes: number,
  unit: TimeUnit,
): number {
  switch (unit) {
    case 'days':
      return minutes / (60 * 24);
    case 'hours':
      return minutes / 60;
    case 'minutes':
      return minutes;
    case 'seconds':
      return minutes * 60;
    default:
      return minutes;
  }
}

export function getTimeUnitLabel(unit: TimeUnit): string {
  switch (unit) {
    case 'days': return 'd';
    case 'hours': return 'h';
    case 'minutes': return 'min';
    case 'seconds': return 's';
  }
}

function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getTrimmedMean(values: number[], trimFraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * trimFraction);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  if (trimmed.length === 0) return getMedian(values);
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

/**
 * Compute throughput times for all edges in a DFG.
 */
export function computeAllThroughputTimes(
  dfg: DirectlyFollowsGraph,
  method: AggregationMethod = 'median',
  unit: TimeUnit = 'minutes',
): ThroughputResult[] {
  return dfg.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    values: edge.throughputTimes,
    aggregated: convertTimeUnit(computeThroughputTime(edge, method), unit),
    method,
    unit,
  }));
}

/**
 * Create histogram bins for throughput time distribution.
 */
export function createThroughputHistogram(
  values: number[],
  numBins: number = 20,
): { bins: number[]; counts: number[] } {
  if (values.length === 0) return { bins: [], counts: [] };

  let min = Infinity, max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const width = max === min ? 1 : (max - min) / numBins;

  const bins: number[] = [];
  const counts: number[] = [];

  for (let i = 0; i < numBins; i++) {
    bins.push(min + i * width);
    counts.push(0);
  }

  for (const val of values) {
    const idx = Math.min(
      Math.floor((val - min) / width),
      numBins - 1,
    );
    counts[idx]++;
  }

  return { bins, counts };
}
