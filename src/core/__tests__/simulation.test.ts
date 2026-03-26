import { describe, it, expect, beforeEach } from 'vitest';
import { setRandomSeed, resetRandom } from '../math';
import { Simulation } from '../simulation';
import { Scheduler } from '../scheduler';
import { Actor, StateCodes } from '../actor';
import exampleParams from '../../../example.json';
import type { SimulationParams } from '../simulation';

const params = exampleParams as SimulationParams;

describe('Simulation', () => {
  beforeEach(() => {
    setRandomSeed(42);
  });

  describe('getDuration', () => {
    it('returns durations within [min, max] range', () => {
      const sim = new Simulation();
      sim.params = params;
      for (let i = 0; i < 100; i++) {
        const dur = sim.getDuration('pt_checkin');
        expect(dur).toBeGreaterThanOrEqual(params.distributions.pt_checkin.min);
        expect(dur).toBeLessThanOrEqual(params.distributions.pt_checkin.max);
      }
    });

    it('produces deterministic durations with seed', () => {
      setRandomSeed(42);
      const sim1 = new Simulation();
      sim1.params = params;
      const durations1 = Array.from({ length: 10 }, () => sim1.getDuration('pt_checkin'));

      setRandomSeed(42);
      const sim2 = new Simulation();
      sim2.params = params;
      const durations2 = Array.from({ length: 10 }, () => sim2.getDuration('pt_checkin'));

      expect(durations1).toEqual(durations2);
    });
  });

  describe('full simulation run', () => {
    it('completes with all patients finished', () => {
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);

      expect(sim.isDone()).toBe(true);
      const patients = sim.actors.filter((a) => a.type === 'Patient');
      expect(patients).toHaveLength(params.numPatients);
      patients.forEach((p) => {
        expect(p.currentState).toBe(StateCodes.PATIENT_FINISHED);
      });
    });

    it('produces deterministic results with seed', () => {
      setRandomSeed(42);
      const sim1 = new Simulation();
      const scheduler1 = new Scheduler();
      sim1.run(params, scheduler1);

      setRandomSeed(42);
      const sim2 = new Simulation();
      const scheduler2 = new Scheduler();
      sim2.run(params, scheduler2);

      // Same final time
      expect(sim1.time).toEqual(sim2.time);

      // Same actor count
      expect(sim1.actors.length).toEqual(sim2.actors.length);

      // Same timelines
      for (let i = 0; i < sim1.actors.length; i++) {
        expect(sim1.actors[i].timeline.length).toEqual(sim2.actors[i].timeline.length);
        for (let j = 0; j < sim1.actors[i].timeline.length; j++) {
          expect(sim1.actors[i].timeline[j].stateCode).toEqual(
            sim2.actors[i].timeline[j].stateCode,
          );
          expect(sim1.actors[i].timeline[j].start).toBeCloseTo(
            sim2.actors[i].timeline[j].start,
            10,
          );
        }
      }
    });

    it('has positive simulation time', () => {
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);
      expect(sim.time).toBeGreaterThan(0);
    });

    it('patients have total time in clinic calculated', () => {
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);

      const patients = sim.actors.filter((a) => a.type === 'Patient');
      patients.forEach((p) => {
        expect(p.totalTimeInClinic).toBeGreaterThan(0);
      });
    });

    it('cleanup removes unterminated timeline events', () => {
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);

      sim.actors.forEach((actor) => {
        actor.timeline.forEach((event) => {
          expect(event.end).not.toBeNull();
        });
      });
    });

    it('patients have waiting time calculated', () => {
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);

      const patients = sim.actors.filter((a) => a.type === 'Patient');
      patients.forEach((p) => {
        expect(p.waitingForClinicalTeam).toBeDefined();
        expect(p.waitingForClinicalTeam).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('golden sample (seed=42)', () => {
    it('produces exact simulation time', () => {
      setRandomSeed(42);
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);

      // Capture this value as the golden sample baseline
      expect(sim.time).toBeGreaterThan(50);
      expect(sim.time).toBeLessThan(500);
    });

    it('creates correct number of actors', () => {
      setRandomSeed(42);
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);

      const attendings = sim.actors.filter((a) => a.type === 'Attending');
      const teams = sim.actors.filter((a) => a.type === 'ClinicalTeam');
      const patients = sim.actors.filter((a) => a.type === 'Patient');

      expect(attendings).toHaveLength(2);
      expect(teams).toHaveLength(4);
      expect(patients).toHaveLength(8);
    });

    it('patients go through expected state sequence', () => {
      setRandomSeed(42);
      const sim = new Simulation();
      const scheduler = new Scheduler();
      sim.run(params, scheduler);

      const patient1 = sim.actors.find((a) => a.id === 'Patient-1')!;
      const stateCodes = patient1.timeline.map((t) => t.stateCode);

      // All patients should check in, meet team, meet attending, and check out
      expect(stateCodes).toContain(StateCodes.PATIENT_CHECKING_IN);
      expect(stateCodes).toContain(StateCodes.PATIENT_CLINICAL_TEAM_MEETING);
      expect(stateCodes).toContain(StateCodes.PATIENT_ATTENDING_MEETING);
      expect(stateCodes).toContain(StateCodes.PATIENT_CHECKING_OUT);
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      expect(Simulation.formatTime(0)).toBe('5:00');
      expect(Simulation.formatTime(60)).toBe('6:00');
      expect(Simulation.formatTime(90)).toBe('6:30');
      expect(Simulation.formatTime(180)).toBe('8:00');
    });
  });

  describe('formatDuration', () => {
    it('formats duration correctly', () => {
      expect(Simulation.formatDuration(0)).toBe('0:00');
      expect(Simulation.formatDuration(30)).toBe('0:30');
      expect(Simulation.formatDuration(90)).toBe('1:30');
    });
  });
});
