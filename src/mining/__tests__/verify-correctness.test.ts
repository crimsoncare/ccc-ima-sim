import { describe, it, expect } from 'vitest';
import { setRandomSeed } from '@/core/math';
import { Simulation } from '@/core/simulation';
import { Scheduler } from '@/core/scheduler';
import { extractEventLog } from '../event-log';
import { computeDFG, PROCESS_START, PROCESS_END } from '../dfg';
import { extractVariants } from '../variants';
import { computeHappyPath } from '../happy-path';
import exampleParams from '../../../example.json';
import type { SimulationParams } from '@/core/simulation';

function runSim() {
  setRandomSeed(42);
  const sim = new Simulation();
  const scheduler = new Scheduler();
  sim.run(exampleParams as SimulationParams, scheduler);
  return sim;
}

describe('Process Mining Correctness Verification', () => {
  it('event log activities match expected clinical workflow', () => {
    const sim = runSim();
    const log = extractEventLog(sim);
    
    // Every patient should have Check In and Check Out
    for (const c of log.cases) {
      const acts = c.events.map(e => e.activity);
      expect(acts[0]).toBe('Check In');
      expect(acts[acts.length - 1]).toBe('Check Out');
      // Should contain CT meeting and Attending meeting
      expect(acts).toContain('Clinical Team Meeting');
      expect(acts).toContain('Attending Meeting');
    }
  });

  it('DFG is consistent (edge frequencies sum correctly)', () => {
    const sim = runSim();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);
    
    // Edges from Process Start should sum to number of cases
    const startEdges = dfg.edges.filter(e => e.source === PROCESS_START);
    const startTotal = startEdges.reduce((s, e) => s + e.frequency, 0);
    expect(startTotal).toBe(8);
    
    // Edges to Process End should sum to number of cases
    const endEdges = dfg.edges.filter(e => e.target === PROCESS_END);
    const endTotal = endEdges.reduce((s, e) => s + e.frequency, 0);
    expect(endTotal).toBe(8);
    
    // For each non-start/end node, inflow should equal outflow
    for (const node of dfg.nodes) {
      if (node.activity === PROCESS_START || node.activity === PROCESS_END) continue;
      const inflow = dfg.edges.filter(e => e.target === node.activity).reduce((s, e) => s + e.frequency, 0);
      const outflow = dfg.edges.filter(e => e.source === node.activity).reduce((s, e) => s + e.frequency, 0);
      expect(inflow).toBe(outflow);
    }
  });

  it('variants cover all cases and happy path is most frequent', () => {
    const sim = runSim();
    const log = extractEventLog(sim);
    const variants = extractVariants(log);
    const hp = computeHappyPath(log);
    
    const totalCases = variants.reduce((s, v) => s + v.frequency, 0);
    expect(totalCases).toBe(8);
    
    // Happy path should be the most frequent variant
    expect(hp).not.toBeNull();
    expect(hp!.frequency).toBe(variants[0].frequency);
  });

  it('prints actual process data for visual inspection', () => {
    const sim = runSim();
    const log = extractEventLog(sim);
    const dfg = computeDFG(log);
    const variants = extractVariants(log);
    
    console.log('\n=== CASES ===');
    for (const c of log.cases) {
      console.log(`${c.id}: ${c.events.map(e => e.activity).join(' → ')}`);
    }
    console.log('\n=== DFG EDGES ===');
    for (const e of dfg.edges.sort((a,b) => b.frequency - a.frequency)) {
      console.log(`${e.source} → ${e.target} (${e.frequency}x)`);
    }
    console.log('\n=== VARIANTS ===');
    for (const v of variants) {
      console.log(`${v.id}: ${v.activities.join(' → ')} (${v.frequency} cases)`);
    }
  });
});
