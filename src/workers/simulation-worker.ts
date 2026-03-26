/**
 * Web Worker for running simulations off the main thread.
 * Ported from legacy/js/worker.js.
 */
import { Simulation, type SimulationParams } from '@/core/simulation';
import { Scheduler } from '@/core/scheduler';
import { StateLabels } from '@/core/actor';
import { getStats } from '@/core/math';
import type { MonteCarloResults, MCWorstCase } from '@/types/monte-carlo';

function runSingle(params: SimulationParams) {
  const sim = new Simulation();
  const scheduler = new Scheduler();
  sim.run(params, scheduler);
  return { actors: sim.actors, time: sim.time };
}

function cloneSimulation(sim: Simulation): MCWorstCase {
  return {
    actors: sim.actors.map((actor) => {
      const entry: MCWorstCase['actors'][number] = {
        id: actor.id,
        type: actor.type,
        timeline: JSON.parse(JSON.stringify(actor.timeline)),
      };
      if (actor.patientsSeen) {
        entry.patientsSeen = actor.patientsSeen.map((p) => ({
          id: p.id,
          clinicalTeam: { id: p.clinicalTeam!.id },
          attending: { id: p.attending!.id },
        }));
      }
      if (actor.clinicalTeam) entry.clinicalTeam = { id: actor.clinicalTeam.id };
      if (actor.attending) entry.attending = { id: actor.attending.id };
      return entry;
    }),
  };
}

interface AccumActor {
  id: string;
  type: string;
  appointmentTime?: number;
  preferredAttending?: string;
  preferredClinicalTeam?: string;
  caseType?: string;
  timeInState: Record<string, number[]>;
  // Patient accumulators
  seenByPreferredAttending?: number;
  seenByPreferredClinicalTeam?: number;
  totalTimeInClinic?: number[];
  waitingForClinicalTeam?: number[];
  waitingForAttending?: number[];
  // Provider accumulators
  patientsSeen?: number[];
}

function runMonteCarlo(params: SimulationParams, numSamps: number): MonteCarloResults {
  const accum: AccumActor[] = [];
  const times: number[] = [];

  const sim = new Simulation();
  const scheduler = new Scheduler();

  let worstCaseTime = 0;
  let worstCase: MCWorstCase = { actors: [] };

  for (let i = 0; i < numSamps; i++) {
    sim.run(params, scheduler);

    // Initialize accumulators on first run
    if (i === 0) {
      for (const actor of sim.actors) {
        const a: AccumActor = {
          id: actor.id,
          type: actor.type,
          timeInState: {},
        };
        if (actor.type === 'Patient') {
          a.appointmentTime = actor.appointmentTime;
          a.preferredAttending = actor.preferredAttending;
          a.preferredClinicalTeam = actor.preferredClinicalTeam;
          a.caseType = actor.caseType;
          a.seenByPreferredAttending = 0;
          a.seenByPreferredClinicalTeam = 0;
          a.totalTimeInClinic = [];
          a.waitingForClinicalTeam = [];
          a.waitingForAttending = [];
        }
        if (actor.type === 'ClinicalTeam' || actor.type === 'Attending') {
          a.patientsSeen = [];
          a.waitingForAttending = [];
        }
        accum.push(a);
      }
    }

    times.push(sim.time);

    if (sim.time > worstCaseTime) {
      worstCaseTime = sim.time;
      worstCase = cloneSimulation(sim);
    }

    // Accumulate per-actor stats
    for (let j = 0; j < sim.actors.length; j++) {
      const actor = sim.actors[j];
      const acc = accum[j];

      // timeInState: convert numeric codes to labels
      for (const stateCode in actor.timeInState) {
        const label = StateLabels[Number(stateCode)];
        if (acc.timeInState[label]) {
          acc.timeInState[label].push(actor.timeInState[Number(stateCode)]);
        } else {
          acc.timeInState[label] = [actor.timeInState[Number(stateCode)]];
        }
      }

      if (actor.type === 'Patient') {
        acc.seenByPreferredAttending! += actor.seenByPreferredAttending ? 1 : 0;
        acc.seenByPreferredClinicalTeam! += actor.seenByPreferredClinicalTeam ? 1 : 0;
        acc.totalTimeInClinic!.push(actor.totalTimeInClinic!);
        acc.waitingForClinicalTeam!.push(actor.waitingForClinicalTeam!);
        acc.waitingForAttending!.push(actor.waitingForAttending!);
      }

      if (actor.type === 'ClinicalTeam' || actor.type === 'Attending') {
        acc.patientsSeen!.push(actor.patientsSeen!.length);
      }

      if (actor.type === 'ClinicalTeam') {
        acc.waitingForAttending!.push(actor.waitingForAttending as unknown as number);
      }
    }
  }

  // Compute stats and build typed results
  const patients: MonteCarloResults['patients'] = [];
  const clinicalTeams: MonteCarloResults['clinicalTeams'] = [];
  const attendings: MonteCarloResults['attendings'] = [];

  for (const acc of accum) {
    // Convert timeInState arrays to Stats
    const timeInState: Record<string, ReturnType<typeof getStats>> = {};
    for (const state in acc.timeInState) {
      timeInState[state] = getStats(new Float64Array(acc.timeInState[state]));
    }

    if (acc.type === 'Patient') {
      patients.push({
        id: acc.id,
        type: 'Patient',
        label: 'PT' + acc.id.split('-')[1] + ' ' + Simulation.formatTime(acc.appointmentTime!),
        appointmentTime: acc.appointmentTime!,
        preferredAttending: acc.preferredAttending!,
        preferredClinicalTeam: acc.preferredClinicalTeam!,
        caseType: acc.caseType!,
        seenByPreferredAttending: acc.seenByPreferredAttending! / (numSamps / 100),
        seenByPreferredClinicalTeam: acc.seenByPreferredClinicalTeam! / (numSamps / 100),
        totalTimeInClinic: getStats(new Float64Array(acc.totalTimeInClinic!)),
        waitingForClinicalTeam: getStats(new Float64Array(acc.waitingForClinicalTeam!)),
        waitingForAttending: getStats(new Float64Array(acc.waitingForAttending!)),
        timeInState,
      });
    } else if (acc.type === 'ClinicalTeam') {
      clinicalTeams.push({
        id: acc.id,
        type: 'ClinicalTeam',
        label: acc.id,
        patientsSeen: getStats(new Float64Array(acc.patientsSeen!)),
        waitingForPatient: timeInState['CLINICAL_TEAM_WAITING_FOR_PATIENT'],
        waitingForAttending: getStats(new Float64Array(acc.waitingForAttending!)),
        timeInState,
      });
    } else if (acc.type === 'Attending') {
      attendings.push({
        id: acc.id,
        type: 'Attending',
        label: acc.id,
        patientsSeen: getStats(new Float64Array(acc.patientsSeen!)),
        waitingForClinicalTeam: timeInState['ATTENDING_WAITING_FOR_CLINICAL_TEAM'],
        timeInState,
      });
    }
  }

  // Sort patients by appointment time
  patients.sort((a, b) => a.appointmentTime - b.appointmentTime);

  return {
    patients,
    clinicalTeams,
    attendings,
    times: getStats(new Float64Array(times)),
    params,
    worstCase,
  };
}

// Worker message handler
self.onmessage = (e: MessageEvent) => {
  const { action } = e.data;
  if (action === 'runSingle') {
    self.postMessage({ action, sim: runSingle(e.data.params) });
  } else if (action === 'runMonteCarlo') {
    self.postMessage({ action, results: runMonteCarlo(e.data.params, e.data.numSamps) });
  }
};
