'use strict';

function Scheduler() {

}

Scheduler.prototype.init = function(sim) {

  this.sim = sim;
  var params = this.sim.params;

  this.sim.params.targetTime = 180;
  this.sim.params.hurryThreshold = 30;
  this.sim.params.hurryFactor = 0.5;

  var actors = this.sim.params.actors;

  sim.actors = [ ];

  actors.attendings.forEach(function(attending) {
    var attending = new Actor('Attending', attending);
    attending.patientsSeen = [ ];
    attending.preferredPatients = [ ];
    attending.setState(Actor.stateCodes.ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM, 0);
    sim.actors.push(attending);
  });

  actors.clinicalTeams.forEach(function(clinicalTeam) {
    var clinicalTeam = new Actor('ClinicalTeam', clinicalTeam);
    clinicalTeam.patientsSeen = [ ];
    clinicalTeam.preferredPatients = [ ];
    clinicalTeam.setState(Actor.stateCodes.CLINICAL_TEAM_GROUP_HUDDLE, 0, 15);
    sim.actors.push(clinicalTeam);
  });

  actors.patients.forEach(function(patient) {
    var patient = new Actor('Patient', patient);
    patient.clinicalTeam = '';
    patient.attending = '';
    patient.seenByPreferredClinicalTeam = false;
    patient.seenByPreferredAttending = false;
    var duration = sim.getDuration('pt_arrival_delay') + parseFloat(patient.appointmentTime);
    duration = Math.max(0.001, duration);
    patient.setState(Actor.stateCodes.PATIENT_BEFORE_ARRIVAL, 0, duration);
    sim.actors.push(patient);
  });

  // create fast lookups for preferred Attendings and ClinicalTeams
  // (instead of "slow" string comparisons)
  var indexOfId = function(arr, id) {
    for (var i = 0; i < arr.length; i++)
      if (arr[i].id == id) return i;
    return -1;
  };
  sim.actors.forEach(function(actor, i) {
    if (actor.type == 'Patient') {
      actor.preferredAttendingIdx = actor.preferredAttending == 'None' ? -1 : indexOfId(sim.actors, actor.preferredAttending);
      actor.preferredClinicalTeamIdx = actor.preferredClinicalTeam == 'None' ? -1 : indexOfId(sim.actors, actor.preferredClinicalTeam);
      if (actor.preferredClinicalTeamIdx != -1) {
        var preferredClinicalTeam = sim.actors[actor.preferredClinicalTeamIdx];
        preferredClinicalTeam.preferredPatients.push(actor);
      }
      if (actor.preferredAttendingIdx != -1) {
        var preferredAttending = sim.actors[actor.preferredAttendingIdx];
        preferredAttending.preferredPatients.push(actor);
      }
    }
  });

};


Scheduler.prototype.createPatientClinicalTeamMeeting = function(patient, clinicalTeam) {
  var sim = this.sim;
  var distName = 'pt_ct_meeting_' + patient.caseType;
  var duration = sim.getDuration(distName);
  if (duration > sim.params.hurryThreshold)
    duration = (duration - sim.params.hurryThreshold) * sim.params.hurryFactor + sim.params.hurryThreshold;
  var stateCode = Actor.stateCodes.PATIENT_CLINICAL_TEAM_MEETING;
  patient.setState(stateCode, sim.time, duration);
  patient.clinicalTeam = clinicalTeam;
  patient.seenByPreferredClinicalTeam = (patient.clinicalTeam.id == patient.preferredClinicalTeam);
  clinicalTeam.setState(stateCode, sim.time, duration);
  clinicalTeam.patientsSeen.push(patient);
};

Scheduler.prototype.createClinicalTeamAttendingMeeting = function(clinicalTeam, attending) {
  var sim = this.sim;
  var duration = sim.getDuration('ct_atp_meeting');
  var stateCode = Actor.stateCodes.CLINICAL_TEAM_ATTENDING_MEETING;
  clinicalTeam.setState(stateCode, sim.time, duration);
  clinicalTeam.attending = attending;
  attending.setState(stateCode, sim.time, duration);
};

Scheduler.prototype.createPatientAttendingMeeting = function(patient, clinicalTeam, attending) {
  var sim = this.sim;
  var distName = 'pt_ct_atp_meeting_' + patient.caseType;
  var duration = sim.getDuration(distName);
  var target = sim.params.targetTime - sim.params.distributions['pt_checkout'].mean;
  if (sim.time + duration > target)
    duration = (duration - sim.params.distributions[distName].min) * sim.params.hurryFactor + sim.params.distributions[distName].min;
  var stateCode = Actor.stateCodes.PATIENT_ATTENDING_MEETING;
  patient.setState(stateCode, sim.time, duration);
  patient.attending = attending;
  patient.seenByPreferredAttending = (patient.attending.id == patient.preferredAttending);
  clinicalTeam.setState(stateCode, sim.time, duration);
  attending.setState(stateCode, sim.time, duration);
  attending.patientsSeen.push(patient);
};

// SORT BY timeUntilNextPreferredPatient DESC, patientsSeen ASC
Scheduler.prototype.sortosaurus = function(a, b) {
  if (a.timeUntilNextPreferredPatient < b.timeUntilNextPreferredPatient) {
    return 1; // sort largest-to-smallest
  } else if (a.timeUntilNextPreferredPatient > b.timeUntilNextPreferredPatient) {
    return -1;
  } else {
    return a.patientsSeen.length < b.patientsSeen.length ? -1 : 1; // smallest-to-largest
  }
};

Scheduler.prototype.run = function() {

  var sim = this.sim;
  var self = this;

  var patients                                  = [ ];
  var patientsWaitingForPreferredClinicalTeam   = [ ];
  var patientsWaitingForAnyClinicalTeam         = [ ];
  var patientsWaitingForAttending               = [ ];
  var clinicalTeams                             = [ ];
  var clinicalTeamsWaitingForPreferredAttending = [ ];
  var clinicalTeamsWaitingForAnyAttending       = [ ];
  var attendings                                = [ ];

  for (var i = 0; i < sim.actors.length; i++) {
    var actor = sim.actors[i];
    if (actor.type == 'Patient') {
      patients.push(actor);
      if (actor.currentState == Actor.stateCodes.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM) {
        patientsWaitingForPreferredClinicalTeam.push(actor);
      } else if (actor.currentState == Actor.stateCodes.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM) {
        patientsWaitingForAnyClinicalTeam.push(actor);
      } else if (actor.currentState == Actor.stateCodes.PATIENT_WAITING_FOR_ATTENDING) {
        patientsWaitingForAttending.push(actor);
      }
    } else if (actor.type == 'ClinicalTeam') {
      clinicalTeams.push(actor);
      if (actor.currentState == Actor.stateCodes.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING) {
        clinicalTeamsWaitingForPreferredAttending.push(actor);
      } else if (actor.currentState == Actor.stateCodes.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING) {
        clinicalTeamsWaitingForAnyAttending.push(actor);
      }
    } else if (actor.type == 'Attending') {
      attendings.push(actor);
    }
  }

  patientsWaitingForAnyClinicalTeam.forEach(function(patient) {
    var clinicalTeamsWaitingForPatient = [ ];
    clinicalTeams.forEach(function(clinicalTeam) {
      if (clinicalTeam.currentState == Actor.stateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT) {
        clinicalTeam.timeUntilNextPreferredPatient = 1000; // big
        clinicalTeam.preferredPatients.forEach(function(preferredPatient) {
          var ETA = sim.time - preferredPatient.appointmentTime;
          if (ETA > 0 && ETA < clinicalTeam.timeUntilNextPreferredPatient)
            clinicalTeam.timeUntilNextPreferredPatient = ETA;
        });
        clinicalTeamsWaitingForPatient.push(clinicalTeam);
      }
    });
    if (clinicalTeamsWaitingForPatient.length > 0) {
      if (clinicalTeamsWaitingForPatient.length > 1)
        clinicalTeamsWaitingForPatient.sort(self.sortosaurus);
      self.createPatientClinicalTeamMeeting(patient, clinicalTeamsWaitingForPatient[0]);
    }
  });

  patientsWaitingForPreferredClinicalTeam.forEach(function(patient) {
    var preferredClinicalTeam = sim.actors[patient.preferredClinicalTeamIdx];
    if (preferredClinicalTeam.currentState == Actor.stateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT)
      self.createPatientClinicalTeamMeeting(patient, preferredClinicalTeam);
  });

  clinicalTeamsWaitingForAnyAttending.forEach(function(clinicalTeam) {
    var attendingsWaitingForClinicalTeam = [ ];
    attendings.forEach(function(attending) {
      if (attending.currentState == Actor.stateCodes.ATTENDING_WAITING_FOR_CLINICAL_TEAM ||
          attending.currentState == Actor.stateCodes.ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM) {
        attending.timeUntilNextPreferredPatient = 1000; // big
        attending.preferredPatients.forEach(function(preferredPatient) {
          var ETA = sim.time - preferredPatient.appointmentTime;
          if (ETA > 0 && ETA < attending.timeUntilNextPreferredPatient)
            attending.timeUntilNextPreferredPatient = ETA;
        });
        attendingsWaitingForClinicalTeam.push(attending);
      }
    });
    if (attendingsWaitingForClinicalTeam.length > 0) {
      if (attendingsWaitingForClinicalTeam.length > 1)
        attendingsWaitingForClinicalTeam.sort(self.sortosaurus);
      self.createClinicalTeamAttendingMeeting(clinicalTeam, attendingsWaitingForClinicalTeam[0]);
    }
  });

  clinicalTeamsWaitingForPreferredAttending.forEach(function(clinicalTeam) {
    var patient = clinicalTeam.patientsSeen[clinicalTeam.patientsSeen.length - 1]; // last element
    var preferredAttending = sim.actors[patient.preferredAttendingIdx];
    if (preferredAttending.currentState == Actor.stateCodes.ATTENDING_WAITING_FOR_CLINICAL_TEAM ||
        preferredAttending.currentState == Actor.stateCodes.ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM)
      self.createClinicalTeamAttendingMeeting(clinicalTeam, preferredAttending);
  });

  patientsWaitingForAttending.forEach(function(patient) {
    var clinicalTeam = patient.clinicalTeam;
    if (clinicalTeam.currentState == Actor.stateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT_ATTENDING_MEETING) {
      var attending = clinicalTeam.attending;
      if (attending.currentState == Actor.stateCodes.ATTENDING_WAITING_FOR_PATIENT_ATTENDING_MEETING) {
        self.createPatientAttendingMeeting(patient, clinicalTeam, attending);
      }
    }
  });
};