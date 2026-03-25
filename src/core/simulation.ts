/**
 * Simulation engine ported from legacy/js/simulation.js
 */
import { rbeta } from './math';
import { Actor, StateCodes, StateLabels, type TimelineEvent } from './actor';
import type { Scheduler } from './scheduler';

export interface Distribution {
  name?: string;
  min: number;
  max: number;
  mean: number;
  stdev: number;
}

export interface PatientConfig {
  id: string;
  preferredAttending: string;
  preferredClinicalTeam: string;
  caseType: string;
  maxWaitTimeAttending: number;
  maxWaitTimeClinicalTeam: number;
  appointmentTime: number;
  [key: string]: any;
}

export interface ActorsConfig {
  attendings: { id: string }[];
  clinicalTeams: { id: string }[];
  patients: PatientConfig[];
}

export interface SimulationParams {
  numAttendings: number;
  numClinicalTeams: number;
  numPatients: number;
  targetTime: number;
  hurryThreshold: number;
  hurryFactor: number;
  actors: ActorsConfig;
  distributions: Record<string, Distribution>;
}

export class Simulation {
  params!: SimulationParams;
  actors: Actor[] = [];
  time: number = 0;
  scheduler!: Scheduler;

  getDuration(distName: string): number {
    const dist = this.params.distributions[distName];
    // Solve for alpha, beta of beta distribution
    const mu = (dist.mean - dist.min) / (dist.max - dist.min);
    const sigma = dist.stdev / (dist.max - dist.min);
    const sigma2 = sigma * sigma;
    const a = (mu * mu - mu * mu * mu - mu * sigma2) / sigma2;
    const b = ((mu - 1) * (mu * mu - mu + sigma2)) / sigma2;
    const duration = rbeta(a, b) * (dist.max - dist.min) + dist.min;
    return duration;
  }

  getActors(
    filter: (actor: Actor) => boolean,
    sortByTime: boolean = false,
  ): Actor[] {
    const list: Actor[] = [];
    for (let i = 0; i < this.actors.length; i++) {
      if (filter(this.actors[i])) {
        list.push(this.actors[i]);
      }
    }
    const time = this.time;
    if (sortByTime) {
      list.sort((a, b) => {
        const aWait =
          a.timeline.length > 0
            ? time - a.timeline[a.timeline.length - 1].start
            : time;
        const bWait =
          b.timeline.length > 0
            ? time - b.timeline[b.timeline.length - 1].start
            : time;
        return aWait < bWait ? 1 : -1;
      });
    }
    return list;
  }

  step(): void {
    // Get minimum step size
    let minStep = 0;
    for (let i = 0; i < this.actors.length; i++) {
      const actor = this.actors[i];
      if (actor.timeRemaining > 0) {
        if (minStep === 0) {
          minStep = actor.timeRemaining;
        } else if (actor.timeRemaining < minStep) {
          minStep = actor.timeRemaining;
        }
      }
    }
    if (minStep === 0) {
      throw new Error('minStep = 0');
    }
    // Advance time
    this.time += minStep;
    for (let i = 0; i < this.actors.length; i++) {
      this.actors[i].timeRemaining -= minStep;
    }
    // Dual-phase update
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].timeRemaining <= 0) {
        this.actors[i].update(this);
      }
    }
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].timeRemaining <= 0) {
        this.actors[i].update(this);
      }
    }
  }

  isDone(): boolean {
    let done = true;
    this.actors.forEach((actor) => {
      if (
        actor.type === 'Patient' &&
        actor.currentState !== StateCodes.PATIENT_FINISHED
      ) {
        done = false;
      }
    });
    return done;
  }

  run(params: SimulationParams, scheduler: Scheduler): void {
    this.params = params;
    this.actors = [];
    this.time = 0;
    this.scheduler = scheduler;
    this.scheduler.init(this);
    while (!this.isDone()) {
      this.scheduler.run();
      this.step();
    }
    this.cleanup();
  }

  cleanup(): void {
    // Remove events that have start but no end
    this.actors.forEach((actor) => {
      if (
        actor.timeline.length > 0 &&
        actor.timeline[actor.timeline.length - 1].end === null
      ) {
        actor.timeline.pop();
      }
    });
    this.actors.forEach((actor) => {
      if (actor.type === 'Patient') {
        actor.waitingForClinicalTeam = 0;
        actor.timeline.forEach((state) => {
          if (
            state.stateCode ===
              StateCodes.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM ||
            state.stateCode ===
              StateCodes.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM
          ) {
            actor.waitingForClinicalTeam! +=
              parseFloat(String(state.end)) - parseFloat(String(state.start));
          }
        });
      } else if (actor.type === 'ClinicalTeam') {
        actor.waitingForAttending = 0;
        actor.timeline.forEach((state) => {
          if (
            state.stateCode ===
              StateCodes.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING ||
            state.stateCode ===
              StateCodes.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING
          ) {
            actor.waitingForAttending! +=
              parseFloat(String(state.end)) - parseFloat(String(state.start));
          }
        });
      }
    });
  }

  static formatTime(time: number): string {
    const pad = (n: number, width: number): string => {
      let s = String(n);
      while (s.length < width) s = '0' + s;
      return s;
    };
    const hours = Math.floor(time / 60);
    const hour = 5 + hours;
    const minutes = time - hours * 60;
    return hour.toString() + ':' + pad(minutes, 2);
  }

  static formatDuration(duration: number): string {
    const pad = (n: number, width: number): string => {
      let s = String(n);
      while (s.length < width) s = '0' + s;
      return s;
    };
    const hours = Math.floor(duration / 60);
    const minutes = duration - hours * 60;
    return hours.toString() + ':' + pad(minutes, 2);
  }
}
