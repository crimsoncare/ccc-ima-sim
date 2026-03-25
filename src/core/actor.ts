/**
 * Actor class ported from legacy/js/actor.js
 * Represents patients, clinical teams, and attendings.
 */

export type ActorType = 'Patient' | 'ClinicalTeam' | 'Attending';

export const StateCodes = {
  PATIENT_BEFORE_ARRIVAL: 101,
  PATIENT_CHECKING_IN: 102,
  PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM: 103,
  PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM: 104,
  PATIENT_CLINICAL_TEAM_MEETING: 105,
  PATIENT_WAITING_FOR_ATTENDING: 107,
  PATIENT_ATTENDING_MEETING: 108,
  PATIENT_CHECKING_OUT: 109,
  PATIENT_FINISHED: 110,

  CLINICAL_TEAM_GROUP_HUDDLE: 201,
  CLINICAL_TEAM_WAITING_FOR_PATIENT: 202,
  CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING: 203,
  CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING: 204,
  CLINICAL_TEAM_ATTENDING_MEETING: 205,
  CLINICAL_TEAM_WAITING_FOR_PATIENT_ATTENDING_MEETING: 206,

  ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM: 301,
  ATTENDING_WAITING_FOR_CLINICAL_TEAM: 302,
  ATTENDING_WAITING_FOR_PATIENT_ATTENDING_MEETING: 303,
} as const;

export type StateCode = (typeof StateCodes)[keyof typeof StateCodes];

// Reverse lookup: code → label
export const StateLabels: Record<number, string> = {};
for (const [key, value] of Object.entries(StateCodes)) {
  StateLabels[value] = key;
}

export interface TimelineEvent {
  stateCode: number;
  start: number;
  end: number | null;
}

export interface ActorConfig {
  id: string;
  [key: string]: any;
}

export class Actor {
  type: ActorType;
  id: string;
  currentState: number = 0;
  timeRemaining: number = 0;
  timeline: TimelineEvent[] = [];
  timeInState: Record<number, number> = {};

  // Patient-specific
  preferredAttending?: string;
  preferredClinicalTeam?: string;
  caseType?: string;
  maxWaitTimeAttending?: number;
  maxWaitTimeClinicalTeam?: number;
  appointmentTime?: number;
  clinicalTeam?: Actor;
  attending?: Actor;
  seenByPreferredClinicalTeam?: boolean;
  seenByPreferredAttending?: boolean;
  totalTimeInClinic?: number;
  waitingForClinicalTeam?: number;
  waitingForAttending?: number;
  preferredAttendingIdx?: number;
  preferredClinicalTeamIdx?: number;

  // Provider-specific
  patientsSeen?: Actor[];
  preferredPatients?: Actor[];
  timeUntilNextPreferredPatient?: number;

  constructor(type: ActorType, obj: ActorConfig) {
    this.type = type;
    this.id = obj.id;
    for (const key of Object.keys(obj)) {
      (this as Record<string, unknown>)[key] = obj[key];
    }
    this.currentState = 0;
    this.timeRemaining = 0;
    this.timeline = [];
    this.timeInState = {};
  }

  setState(stateCode: number, currentTime: number, duration?: number): void {
    if (typeof currentTime === 'undefined') {
      throw new Error('currentTime undefined');
    }

    const dur = typeof duration !== 'undefined' ? parseFloat(String(duration)) : 0;

    // End previous state
    if (this.currentState !== 0) {
      const prevState = this.timeline[this.timeline.length - 1];
      prevState.end = parseFloat(String(currentTime));
      if (this.timeInState.hasOwnProperty(prevState.stateCode)) {
        this.timeInState[prevState.stateCode] +=
          parseFloat(String(prevState.end)) - parseFloat(String(prevState.start));
      } else {
        this.timeInState[prevState.stateCode] =
          parseFloat(String(prevState.end)) - parseFloat(String(prevState.start));
      }
    }

    // Update current state
    this.currentState = stateCode;
    if (dur >= 0) {
      this.timeline.push({ stateCode, start: currentTime, end: null });
    }
    this.timeRemaining = dur;
  }

  update(sim: { time: number; getDuration: (name: string) => number }): void {
    const states = StateCodes;

    if (this.type === 'Patient') {
      switch (this.currentState) {
        case states.PATIENT_BEFORE_ARRIVAL:
          this.setState(states.PATIENT_CHECKING_IN, sim.time, sim.getDuration('pt_checkin'));
          break;
        case states.PATIENT_CHECKING_IN:
          if (
            parseFloat(String(this.maxWaitTimeClinicalTeam)) > 0 &&
            this.preferredClinicalTeam !== 'None'
          ) {
            this.setState(
              states.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM,
              sim.time,
              this.maxWaitTimeClinicalTeam,
            );
          } else {
            this.setState(states.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM, sim.time);
          }
          break;
        case states.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM:
          this.setState(states.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM, sim.time);
          break;
        case states.PATIENT_CLINICAL_TEAM_MEETING:
          this.setState(states.PATIENT_WAITING_FOR_ATTENDING, sim.time);
          break;
        case states.PATIENT_ATTENDING_MEETING:
          this.setState(states.PATIENT_CHECKING_OUT, sim.time, sim.getDuration('pt_checkout'));
          break;
        case states.PATIENT_CHECKING_OUT:
          this.totalTimeInClinic = sim.time - this.timeline[0].end!;
          this.setState(states.PATIENT_FINISHED, sim.time, -1);
          break;
      }
    }

    if (this.type === 'ClinicalTeam') {
      switch (this.currentState) {
        case states.CLINICAL_TEAM_GROUP_HUDDLE:
          this.setState(states.CLINICAL_TEAM_WAITING_FOR_PATIENT, sim.time);
          break;
        case states.PATIENT_CLINICAL_TEAM_MEETING: {
          const patient = this.patientsSeen![this.patientsSeen!.length - 1];
          if (
            (patient.maxWaitTimeAttending ?? 0) > 0 &&
            patient.preferredAttending !== 'None'
          ) {
            this.setState(
              states.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING,
              sim.time,
              patient.maxWaitTimeAttending,
            );
          } else {
            this.setState(states.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING, sim.time);
          }
          break;
        }
        case states.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING:
          this.setState(states.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING, sim.time);
          break;
        case states.CLINICAL_TEAM_ATTENDING_MEETING:
          this.setState(states.CLINICAL_TEAM_WAITING_FOR_PATIENT_ATTENDING_MEETING, sim.time);
          break;
        case states.PATIENT_ATTENDING_MEETING:
          this.setState(states.CLINICAL_TEAM_WAITING_FOR_PATIENT, sim.time);
          break;
      }
    }

    if (this.type === 'Attending') {
      switch (this.currentState) {
        case states.PATIENT_ATTENDING_MEETING:
          this.setState(states.ATTENDING_WAITING_FOR_CLINICAL_TEAM, sim.time);
          break;
        case states.CLINICAL_TEAM_ATTENDING_MEETING:
          this.setState(states.ATTENDING_WAITING_FOR_PATIENT_ATTENDING_MEETING, sim.time);
          break;
      }
    }
  }
}
