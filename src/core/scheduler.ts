/**
 * Scheduler ported from legacy/js/scheduler.js
 * Implements 5-phase matching algorithm for patient-provider assignments.
 */
import { Actor, StateCodes } from './actor';
import type { Simulation } from './simulation';

export class Scheduler {
  sim!: Simulation;

  init(sim: Simulation): void {
    this.sim = sim;
    const params = sim.params;
    const actors = params.actors;

    sim.actors = [];

    actors.attendings.forEach((attending) => {
      const actor = new Actor('Attending', attending);
      actor.patientsSeen = [];
      actor.preferredPatients = [];
      actor.setState(StateCodes.ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM, 0);
      sim.actors.push(actor);
    });

    actors.clinicalTeams.forEach((clinicalTeam) => {
      const actor = new Actor('ClinicalTeam', clinicalTeam);
      actor.patientsSeen = [];
      actor.preferredPatients = [];
      actor.setState(StateCodes.CLINICAL_TEAM_GROUP_HUDDLE, 0, 15);
      sim.actors.push(actor);
    });

    actors.patients.forEach((patient) => {
      const actor = new Actor('Patient', patient);
      actor.clinicalTeam = undefined;
      actor.attending = undefined;
      actor.seenByPreferredClinicalTeam = false;
      actor.seenByPreferredAttending = false;
      const duration =
        sim.getDuration('pt_arrival_delay') +
        parseFloat(String(actor.appointmentTime));
      const safeDuration = Math.max(0.001, duration);
      actor.setState(StateCodes.PATIENT_BEFORE_ARRIVAL, 0, safeDuration);
      sim.actors.push(actor);
    });

    // Create fast lookups for preferred providers
    const indexOfId = (arr: Actor[], id: string): number => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) return i;
      }
      return -1;
    };

    sim.actors.forEach((actor) => {
      if (actor.type === 'Patient') {
        actor.preferredAttendingIdx =
          actor.preferredAttending === 'None'
            ? -1
            : indexOfId(sim.actors, actor.preferredAttending!);
        actor.preferredClinicalTeamIdx =
          actor.preferredClinicalTeam === 'None'
            ? -1
            : indexOfId(sim.actors, actor.preferredClinicalTeam!);
        if (actor.preferredClinicalTeamIdx !== -1) {
          const preferred = sim.actors[actor.preferredClinicalTeamIdx];
          preferred.preferredPatients!.push(actor);
        }
        if (actor.preferredAttendingIdx !== -1) {
          const preferred = sim.actors[actor.preferredAttendingIdx];
          preferred.preferredPatients!.push(actor);
        }
      }
    });
  }

  createPatientClinicalTeamMeeting(patient: Actor, clinicalTeam: Actor): void {
    const sim = this.sim;
    const distName = 'pt_ct_meeting_' + patient.caseType;
    let duration = sim.getDuration(distName);
    if (duration > sim.params.hurryThreshold) {
      duration =
        (duration - sim.params.hurryThreshold) * sim.params.hurryFactor +
        sim.params.hurryThreshold;
    }
    const stateCode = StateCodes.PATIENT_CLINICAL_TEAM_MEETING;
    patient.setState(stateCode, sim.time, duration);
    patient.clinicalTeam = clinicalTeam;
    patient.seenByPreferredClinicalTeam =
      clinicalTeam.id === patient.preferredClinicalTeam;
    clinicalTeam.setState(stateCode, sim.time, duration);
    clinicalTeam.patientsSeen!.push(patient);
  }

  createClinicalTeamAttendingMeeting(
    clinicalTeam: Actor,
    attending: Actor,
  ): void {
    const sim = this.sim;
    const duration = sim.getDuration('ct_atp_meeting');
    const stateCode = StateCodes.CLINICAL_TEAM_ATTENDING_MEETING;
    clinicalTeam.setState(stateCode, sim.time, duration);
    (clinicalTeam as any).attending = attending;
    attending.setState(stateCode, sim.time, duration);
  }

  createPatientAttendingMeeting(
    patient: Actor,
    clinicalTeam: Actor,
    attending: Actor,
  ): void {
    const sim = this.sim;
    const distName = 'pt_ct_atp_meeting_' + patient.caseType;
    let duration = sim.getDuration(distName);
    const target =
      sim.params.targetTime - sim.params.distributions['pt_checkout'].mean;
    if (sim.time + duration > target) {
      duration =
        (duration - sim.params.distributions[distName].min) *
          sim.params.hurryFactor +
        sim.params.distributions[distName].min;
    }
    const stateCode = StateCodes.PATIENT_ATTENDING_MEETING;
    patient.setState(stateCode, sim.time, duration);
    patient.attending = attending;
    patient.seenByPreferredAttending =
      attending.id === patient.preferredAttending;
    clinicalTeam.setState(stateCode, sim.time, duration);
    attending.setState(stateCode, sim.time, duration);
    attending.patientsSeen!.push(patient);
  }

  // Sort by timeUntilNextPreferredPatient DESC, patientsSeen ASC
  sortosaurus(a: Actor, b: Actor): number {
    if (a.timeUntilNextPreferredPatient! < b.timeUntilNextPreferredPatient!) {
      return 1;
    } else if (
      a.timeUntilNextPreferredPatient! > b.timeUntilNextPreferredPatient!
    ) {
      return -1;
    } else {
      return a.patientsSeen!.length < b.patientsSeen!.length ? -1 : 1;
    }
  }

  run(): void {
    const sim = this.sim;

    const patientsWaitingForPreferredClinicalTeam: Actor[] = [];
    const patientsWaitingForAnyClinicalTeam: Actor[] = [];
    const patientsWaitingForAttending: Actor[] = [];
    const clinicalTeams: Actor[] = [];
    const clinicalTeamsWaitingForPreferredAttending: Actor[] = [];
    const clinicalTeamsWaitingForAnyAttending: Actor[] = [];
    const attendings: Actor[] = [];

    for (let i = 0; i < sim.actors.length; i++) {
      const actor = sim.actors[i];
      if (actor.type === 'Patient') {
        if (
          actor.currentState ===
          StateCodes.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM
        ) {
          patientsWaitingForPreferredClinicalTeam.push(actor);
        } else if (
          actor.currentState ===
          StateCodes.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM
        ) {
          patientsWaitingForAnyClinicalTeam.push(actor);
        } else if (
          actor.currentState === StateCodes.PATIENT_WAITING_FOR_ATTENDING
        ) {
          patientsWaitingForAttending.push(actor);
        }
      } else if (actor.type === 'ClinicalTeam') {
        clinicalTeams.push(actor);
        if (
          actor.currentState ===
          StateCodes.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING
        ) {
          clinicalTeamsWaitingForPreferredAttending.push(actor);
        } else if (
          actor.currentState ===
          StateCodes.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING
        ) {
          clinicalTeamsWaitingForAnyAttending.push(actor);
        }
      } else if (actor.type === 'Attending') {
        attendings.push(actor);
      }
    }

    // Phase 1: Patients waiting for ANY clinical team
    patientsWaitingForAnyClinicalTeam.forEach((patient) => {
      const clinicalTeamsWaitingForPatient: Actor[] = [];
      clinicalTeams.forEach((clinicalTeam) => {
        if (
          clinicalTeam.currentState ===
          StateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT
        ) {
          clinicalTeam.timeUntilNextPreferredPatient = 1000;
          clinicalTeam.preferredPatients!.forEach((preferredPatient) => {
            const ETA = sim.time - preferredPatient.appointmentTime!;
            if (ETA > 0 && ETA < clinicalTeam.timeUntilNextPreferredPatient!) {
              clinicalTeam.timeUntilNextPreferredPatient = ETA;
            }
          });
          clinicalTeamsWaitingForPatient.push(clinicalTeam);
        }
      });
      if (clinicalTeamsWaitingForPatient.length > 0) {
        if (clinicalTeamsWaitingForPatient.length > 1) {
          clinicalTeamsWaitingForPatient.sort(this.sortosaurus);
        }
        this.createPatientClinicalTeamMeeting(
          patient,
          clinicalTeamsWaitingForPatient[0],
        );
      }
    });

    // Phase 2: Patients waiting for PREFERRED clinical team
    patientsWaitingForPreferredClinicalTeam.forEach((patient) => {
      const preferredClinicalTeam =
        sim.actors[patient.preferredClinicalTeamIdx!];
      if (
        preferredClinicalTeam.currentState ===
        StateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT
      ) {
        this.createPatientClinicalTeamMeeting(patient, preferredClinicalTeam);
      }
    });

    // Phase 3: Clinical teams waiting for ANY attending
    clinicalTeamsWaitingForAnyAttending.forEach((clinicalTeam) => {
      const attendingsWaitingForClinicalTeam: Actor[] = [];
      attendings.forEach((attending) => {
        if (
          attending.currentState ===
            StateCodes.ATTENDING_WAITING_FOR_CLINICAL_TEAM ||
          attending.currentState ===
            StateCodes.ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM
        ) {
          attending.timeUntilNextPreferredPatient = 1000;
          attending.preferredPatients!.forEach((preferredPatient) => {
            const ETA = sim.time - preferredPatient.appointmentTime!;
            if (ETA > 0 && ETA < attending.timeUntilNextPreferredPatient!) {
              attending.timeUntilNextPreferredPatient = ETA;
            }
          });
          attendingsWaitingForClinicalTeam.push(attending);
        }
      });
      if (attendingsWaitingForClinicalTeam.length > 0) {
        if (attendingsWaitingForClinicalTeam.length > 1) {
          attendingsWaitingForClinicalTeam.sort(this.sortosaurus);
        }
        this.createClinicalTeamAttendingMeeting(
          clinicalTeam,
          attendingsWaitingForClinicalTeam[0],
        );
      }
    });

    // Phase 4: Clinical teams waiting for PREFERRED attending
    clinicalTeamsWaitingForPreferredAttending.forEach((clinicalTeam) => {
      const patient =
        clinicalTeam.patientsSeen![clinicalTeam.patientsSeen!.length - 1];
      const preferredAttending = sim.actors[patient.preferredAttendingIdx!];
      if (
        preferredAttending.currentState ===
          StateCodes.ATTENDING_WAITING_FOR_CLINICAL_TEAM ||
        preferredAttending.currentState ===
          StateCodes.ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM
      ) {
        this.createClinicalTeamAttendingMeeting(
          clinicalTeam,
          preferredAttending,
        );
      }
    });

    // Phase 5: Patients waiting for attending (3-way meeting)
    patientsWaitingForAttending.forEach((patient) => {
      const clinicalTeam = patient.clinicalTeam!;
      if (
        clinicalTeam.currentState ===
        StateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT_ATTENDING_MEETING
      ) {
        const attending = (clinicalTeam as any).attending as Actor;
        if (
          attending.currentState ===
          StateCodes.ATTENDING_WAITING_FOR_PATIENT_ATTENDING_MEETING
        ) {
          this.createPatientAttendingMeeting(patient, clinicalTeam, attending);
        }
      }
    });
  }
}
