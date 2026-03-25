/**
 * Golden Sample Test
 *
 * This test captures the EXACT output of a deterministic simulation run
 * using seed=42 with example.json parameters. It serves as the baseline
 * to guarantee that the TypeScript port faithfully reproduces the ES5 behavior.
 *
 * TDD Process:
 * 1. RED: Write this test with expected values from the ES5 code
 * 2. GREEN: Port the ES5 code to TypeScript, making tests pass
 * 3. REFACTOR: Clean up TypeScript code while keeping tests green
 *
 * If these tests break, it means the simulation logic has diverged from
 * the original ES5 implementation.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { setRandomSeed } from '../math';
import { Simulation } from '../simulation';
import { Scheduler } from '../scheduler';
import { StateCodes } from '../actor';
import exampleParams from '../../../example.json';
import type { SimulationParams } from '../simulation';

const params = exampleParams as SimulationParams;

// Run the simulation once and capture results for all tests
let sim: Simulation;

beforeAll(() => {
  setRandomSeed(42);
  sim = new Simulation();
  const scheduler = new Scheduler();
  sim.run(params, scheduler);
});

describe('Golden Sample: Deterministic Simulation (seed=42)', () => {
  it('produces exact simulation end time', () => {
    // Capture the exact end time as the golden sample value
    // This value must remain constant across refactors
    expect(sim.time).toMatchInlineSnapshot(`181.53144207364102`);
  });

  it('creates exactly 14 actors (2 attendings + 4 teams + 8 patients)', () => {
    expect(sim.actors.length).toBe(14);
    expect(sim.actors.filter((a) => a.type === 'Attending').length).toBe(2);
    expect(sim.actors.filter((a) => a.type === 'ClinicalTeam').length).toBe(4);
    expect(sim.actors.filter((a) => a.type === 'Patient').length).toBe(8);
  });

  it('all patients reach FINISHED state', () => {
    const patients = sim.actors.filter((a) => a.type === 'Patient');
    patients.forEach((p) => {
      expect(p.currentState).toBe(StateCodes.PATIENT_FINISHED);
    });
  });

  it('patient timelines have exact state sequences', () => {
    const patient1 = sim.actors.find((a) => a.id === 'Patient-1')!;
    const stateSeq = patient1.timeline.map((t) => t.stateCode);

    // Patient-1 has preferred team and attending, so should try preferred first
    expect(stateSeq).toMatchInlineSnapshot(`
      [
        101,
        102,
        103,
        105,
        107,
        108,
        109,
      ]
    `);
  });

  it('patient 1 timeline start times are exact', () => {
    const patient1 = sim.actors.find((a) => a.id === 'Patient-1')!;
    const starts = patient1.timeline.map((t) => +t.start.toFixed(6));
    expect(starts).toMatchInlineSnapshot(`
      [
        0,
        0.09578,
        6.942818,
        15,
        46.615321,
        56.15241,
        64.315245,
      ]
    `);
  });

  it('patient total time in clinic values are exact', () => {
    const patients = sim.actors.filter((a) => a.type === 'Patient');
    const times = patients.map((p) => +p.totalTimeInClinic!.toFixed(4));
    expect(times).toMatchInlineSnapshot(`
      [
        71.8799,
        51.5851,
        68.1703,
        60.7081,
        103.8876,
        74.2378,
        100.5207,
        91.9326,
      ]
    `);
  });

  it('patient waiting for clinical team values are exact', () => {
    const patients = sim.actors.filter((a) => a.type === 'Patient');
    const waits = patients.map((p) => +p.waitingForClinicalTeam!.toFixed(4));
    expect(waits).toMatchInlineSnapshot(`
      [
        8.0572,
        8.5649,
        0,
        0,
        3.5164,
        0,
        19.6693,
        18.0747,
      ]
    `);
  });

  it('clinical team patients seen counts are exact', () => {
    const teams = sim.actors.filter((a) => a.type === 'ClinicalTeam');
    const counts = teams.map((t) => t.patientsSeen!.length);
    expect(counts).toMatchInlineSnapshot(`
      [
        2,
        2,
        2,
        2,
      ]
    `);
  });

  it('attending patients seen counts are exact', () => {
    const attendings = sim.actors.filter((a) => a.type === 'Attending');
    const counts = attendings.map((a) => a.patientsSeen!.length);
    expect(counts).toMatchInlineSnapshot(`
      [
        4,
        4,
      ]
    `);
  });

  it('preferred provider matching results are exact', () => {
    const patients = sim.actors.filter((a) => a.type === 'Patient');
    const preferred = patients.map((p) => ({
      id: p.id,
      preferredCT: p.seenByPreferredClinicalTeam,
      preferredAtt: p.seenByPreferredAttending,
    }));
    expect(preferred).toMatchInlineSnapshot(`
      [
        {
          "id": "Patient-1",
          "preferredAtt": true,
          "preferredCT": true,
        },
        {
          "id": "Patient-2",
          "preferredAtt": true,
          "preferredCT": true,
        },
        {
          "id": "Patient-3",
          "preferredAtt": true,
          "preferredCT": true,
        },
        {
          "id": "Patient-4",
          "preferredAtt": true,
          "preferredCT": true,
        },
        {
          "id": "Patient-5",
          "preferredAtt": true,
          "preferredCT": true,
        },
        {
          "id": "Patient-6",
          "preferredAtt": true,
          "preferredCT": true,
        },
        {
          "id": "Patient-7",
          "preferredAtt": true,
          "preferredCT": true,
        },
        {
          "id": "Patient-8",
          "preferredAtt": true,
          "preferredCT": true,
        },
      ]
    `);
  });
});
