/**
 * TypeScript interfaces for Monte Carlo simulation results.
 * Matches the structure produced by legacy/js/worker.js runMonteCarlo().
 */
import type { Stats } from '@/core/math';
import type { SimulationParams } from '@/core/simulation';

export interface MCPatientResult {
  id: string;
  type: 'Patient';
  label: string;
  appointmentTime: number;
  preferredAttending: string;
  preferredClinicalTeam: string;
  caseType: string;
  seenByPreferredAttending: number; // percentage (0-100)
  seenByPreferredClinicalTeam: number; // percentage (0-100)
  totalTimeInClinic: Stats;
  waitingForClinicalTeam: Stats;
  waitingForAttending: Stats;
  timeInState: Record<string, Stats>;
}

export interface MCClinicalTeamResult {
  id: string;
  type: 'ClinicalTeam';
  label: string;
  patientsSeen: Stats;
  waitingForPatient: Stats | undefined;
  waitingForAttending: Stats;
  timeInState: Record<string, Stats>;
}

export interface MCAttendingResult {
  id: string;
  type: 'Attending';
  label: string;
  patientsSeen: Stats;
  waitingForClinicalTeam: Stats | undefined;
  timeInState: Record<string, Stats>;
}

export interface MCWorstCase {
  actors: {
    id: string;
    type: string;
    timeline: { stateCode: number; start: number; end: number | null }[];
    patientsSeen?: { id: string; clinicalTeam: { id: string }; attending: { id: string } }[];
    clinicalTeam?: { id: string };
    attending?: { id: string };
  }[];
}

export interface MonteCarloResults {
  patients: MCPatientResult[];
  clinicalTeams: MCClinicalTeamResult[];
  attendings: MCAttendingResult[];
  times: Stats;
  params: SimulationParams;
  worstCase: MCWorstCase;
}

/** Messages sent TO the worker */
export type WorkerRequest =
  | { action: 'runSingle'; params: SimulationParams }
  | { action: 'runMonteCarlo'; params: SimulationParams; numSamps: number };

/** Messages sent FROM the worker */
export type WorkerResponse =
  | { action: 'runSingle'; sim: { actors: any[]; time: number } }
  | { action: 'runMonteCarlo'; results: MonteCarloResults };
