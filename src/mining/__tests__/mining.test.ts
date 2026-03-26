import { describe, it, expect, beforeEach } from 'vitest';
import { setRandomSeed } from '@/core/math';
import { Simulation } from '@/core/simulation';
import { Scheduler } from '@/core/scheduler';
import { extractEventLog } from '../event-log';
import { computeDFG, PROCESS_START, PROCESS_END } from '../dfg';
import { extractVariants } from '../variants';
import { computeHappyPath, getHappyPathElements } from '../happy-path';
import { computeThroughputTime, convertTimeUnit, createThroughputHistogram } from '../throughput';
import { computeActivityStats } from '../activity-stats';
import exampleParams from '../../../example.json';
import type { SimulationParams } from '@/core/simulation';

const params = exampleParams as SimulationParams;

function runSimulation() {
  setRandomSeed(42);
  const sim = new Simulation();
  const scheduler = new Scheduler();
  sim.run(params, scheduler);
  return sim;
}

describe('Event Log Extraction', () => {
  it('extracts correct number of cases (one per patient)', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    expect(log.cases).toHaveLength(8);
  });

  it('each case has events', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    log.cases.forEach((c) => {
      expect(c.events.length).toBeGreaterThan(0);
    });
  });

  it('events have monotonically increasing timestamps', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    log.cases.forEach((c) => {
      for (let i = 1; i < c.events.length; i++) {
        expect(c.events[i].timestamp).toBeGreaterThanOrEqual(c.events[i - 1].timestamp);
      }
    });
  });

  it('variant strings are non-empty', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    log.cases.forEach((c) => {
      expect(c.variant.length).toBeGreaterThan(0);
    });
  });

  it('filtering waiting states produces fewer events', () => {
    const sim = runSimulation();
    const logFull = extractEventLog(sim, { includeWaitingStates: true });
    const logFiltered = extractEventLog(sim, { includeWaitingStates: false });

    const fullCount = logFull.events.length;
    const filteredCount = logFiltered.events.length;
    expect(filteredCount).toBeLessThanOrEqual(fullCount);
  });
});

describe('Directly-Follows Graph', () => {
  it('has Process Start and Process End nodes', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);

    const nodeNames = dfg.nodes.map((n) => n.activity);
    expect(nodeNames).toContain(PROCESS_START);
    expect(nodeNames).toContain(PROCESS_END);
  });

  it('has edges with positive frequencies', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);

    expect(dfg.edges.length).toBeGreaterThan(0);
    dfg.edges.forEach((e) => {
      expect(e.frequency).toBeGreaterThan(0);
    });
  });

  it('Process Start has outgoing edges to first activities', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);

    const startEdges = dfg.edges.filter((e) => e.source === PROCESS_START);
    expect(startEdges.length).toBeGreaterThan(0);
    // Total frequency from start should equal number of cases
    const totalStart = startEdges.reduce((sum, e) => sum + e.frequency, 0);
    expect(totalStart).toBe(8);
  });

  it('Process End has incoming edges from last activities', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);

    const endEdges = dfg.edges.filter((e) => e.target === PROCESS_END);
    expect(endEdges.length).toBeGreaterThan(0);
    const totalEnd = endEdges.reduce((sum, e) => sum + e.frequency, 0);
    expect(totalEnd).toBe(8);
  });

  it('edges have throughput times', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);

    const nonTerminalEdges = dfg.edges.filter(
      (e) => e.source !== PROCESS_START && e.target !== PROCESS_END,
    );
    nonTerminalEdges.forEach((e) => {
      expect(e.throughputTimes.length).toBe(e.frequency);
    });
  });
});

describe('Variant Extraction', () => {
  it('extracts at least one variant', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const variants = extractVariants(log);
    expect(variants.length).toBeGreaterThan(0);
  });

  it('total cases across variants equals total cases', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const variants = extractVariants(log);

    const totalFreq = variants.reduce((sum, v) => sum + v.frequency, 0);
    expect(totalFreq).toBe(8);
  });

  it('variants are sorted by frequency descending', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const variants = extractVariants(log);

    for (let i = 1; i < variants.length; i++) {
      expect(variants[i].frequency).toBeLessThanOrEqual(variants[i - 1].frequency);
    }
  });

  it('percentages sum to ~100%', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const variants = extractVariants(log);

    const totalPct = variants.reduce((sum, v) => sum + v.percentage, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });
});

describe('Happy Path', () => {
  it('finds a happy path', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const hp = computeHappyPath(log);

    expect(hp).not.toBeNull();
    expect(hp!.activities.length).toBeGreaterThan(0);
    expect(hp!.frequency).toBeGreaterThan(0);
  });

  it('happy path activities include core activities', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const hp = computeHappyPath(log);

    // Should include check in and check out at minimum
    expect(hp!.activities).toContain('Check In');
    expect(hp!.activities).toContain('Check Out');
  });

  it('getHappyPathElements returns activities and edges', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const hp = computeHappyPath(log);

    const elements = getHappyPathElements(hp!);
    expect(elements.activities.size).toBeGreaterThan(0);
    expect(elements.edges.size).toBeGreaterThan(0);
    expect(elements.activities.has(PROCESS_START)).toBe(true);
    expect(elements.activities.has(PROCESS_END)).toBe(true);
  });
});

describe('Throughput Time', () => {
  it('computes median throughput time', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);

    const edges = dfg.edges.filter((e) => e.throughputTimes.length > 0);
    expect(edges.length).toBeGreaterThan(0);

    edges.forEach((e) => {
      const median = computeThroughputTime(e, 'median');
      expect(median).toBeGreaterThanOrEqual(0);
    });
  });

  it('converts time units correctly', () => {
    expect(convertTimeUnit(60, 'hours')).toBe(1);
    expect(convertTimeUnit(1440, 'days')).toBe(1);
    expect(convertTimeUnit(1, 'seconds')).toBe(60);
    expect(convertTimeUnit(5, 'minutes')).toBe(5);
  });

  it('creates histogram bins', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const hist = createThroughputHistogram(values, 5);
    expect(hist.bins).toHaveLength(5);
    expect(hist.counts).toHaveLength(5);
    expect(hist.counts.reduce((a, b) => a + b, 0)).toBe(10);
  });
});

describe('Activity Stats', () => {
  it('computes flow_through for all activities', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const stats = computeActivityStats(log, 'flow_through');

    expect(stats.length).toBeGreaterThan(0);
    stats.forEach((s) => {
      expect(s.count).toBeGreaterThanOrEqual(0);
      expect(s.count).toBeLessThanOrEqual(s.totalCases);
      expect(s.percentage).toBeGreaterThanOrEqual(0);
      expect(s.percentage).toBeLessThanOrEqual(100);
    });
  });

  it('Check In flows through all cases', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const stats = computeActivityStats(log, 'flow_through');

    const checkInStat = stats.find((s) => s.activity === 'Check In');
    expect(checkInStat).toBeDefined();
    expect(checkInStat!.count).toBe(8); // All 8 patients check in
    expect(checkInStat!.percentage).toBe(100);
  });

  it('start_with counts correctly', () => {
    const sim = runSimulation();
    const log = extractEventLog(sim);
    const stats = computeActivityStats(log, 'start_with');

    const totalStartWith = stats.reduce((sum, s) => sum + s.count, 0);
    expect(totalStartWith).toBe(8); // Each case starts with exactly one activity
  });
});
