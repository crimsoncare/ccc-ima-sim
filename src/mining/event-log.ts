/**
 * Transform simulation actor timelines into a standard process mining event log.
 */
import type { Actor } from '@/core/actor';
import { StateCodes, StateLabels } from '@/core/actor';
import type { Simulation } from '@/core/simulation';
import type { ProcessEvent, Case, EventLog } from './types';

// Map state codes to human-readable activity names
const ACTIVITY_NAMES: Record<number, string> = {
  [StateCodes.PATIENT_CHECKING_IN]: 'Check In',
  [StateCodes.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM]: 'Wait for Preferred CT',
  [StateCodes.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM]: 'Wait for Clinical Team',
  [StateCodes.PATIENT_CLINICAL_TEAM_MEETING]: 'Clinical Team Meeting',
  [StateCodes.PATIENT_WAITING_FOR_ATTENDING]: 'Wait for Attending',
  [StateCodes.PATIENT_ATTENDING_MEETING]: 'Attending Meeting',
  [StateCodes.PATIENT_CHECKING_OUT]: 'Check Out',
};

// States that represent actual activities (not waiting/idle)
const ACTIVITY_STATES = new Set([
  StateCodes.PATIENT_CHECKING_IN,
  StateCodes.PATIENT_CLINICAL_TEAM_MEETING,
  StateCodes.PATIENT_ATTENDING_MEETING,
  StateCodes.PATIENT_CHECKING_OUT,
]);

// All patient states excluding before-arrival and finished
const ALL_PATIENT_STATES = new Set(Object.keys(ACTIVITY_NAMES).map(Number));

export interface EventLogOptions {
  includeWaitingStates?: boolean;
}

export function getActivityName(stateCode: number): string {
  return ACTIVITY_NAMES[stateCode] ?? StateLabels[stateCode] ?? `State ${stateCode}`;
}

export function extractEventLog(
  sim: { actors: Actor[]; time: number },
  options: EventLogOptions = {},
): EventLog {
  const { includeWaitingStates = true } = options;
  const allowedStates = includeWaitingStates ? ALL_PATIENT_STATES : ACTIVITY_STATES;

  const events: ProcessEvent[] = [];
  const cases: Case[] = [];

  const patients = sim.actors.filter((a) => a.type === 'Patient');

  for (const patient of patients) {
    const caseEvents: ProcessEvent[] = [];

    for (const event of patient.timeline) {
      if (!allowedStates.has(event.stateCode)) continue;
      if (event.end === null) continue;

      const processEvent: ProcessEvent = {
        caseId: patient.id,
        activity: getActivityName(event.stateCode),
        timestamp: event.start,
        stateCode: event.stateCode,
      };
      caseEvents.push(processEvent);
      events.push(processEvent);
    }

    const variant = caseEvents.map((e) => e.activity).join(' -> ');
    cases.push({
      id: patient.id,
      events: caseEvents,
      variant,
    });
  }

  // Sort events by timestamp
  events.sort((a, b) => a.timestamp - b.timestamp);

  return { events, cases };
}
