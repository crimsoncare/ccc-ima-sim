'use strict';

function Actor(type, obj) {
  this.type = type;
  var self = this;
  Object.keys(obj).forEach(function(key) {
    self[key] = obj[key];
  });
  this.currentState = 0; // state code
  this.timeRemaining = 0;
  this.timeline = [ ];
  this.timeInState = { }; // keys are state codes
}

Actor.stateCodes = {
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
};

// reverse lookup
Actor.stateLabels = { };
Object.keys(Actor.stateCodes).forEach(function(key) {
  var value = Actor.stateCodes[key];
  Actor.stateLabels[value] = key;
});

Actor.prototype.setState = function(stateCode, currentTime, duration) {

  if (typeof currentTime == 'undefined') {
    throw 'currentTime undefined';
  }

  duration = (typeof duration !== 'undefined') ? parseFloat(duration) : 0;

  // end previous state by updating the state.end and adding the duration to timeInState
  if (this.currentState !== 0) {
    var prevState = this.timeline[this.timeline.length - 1];
    prevState.end = parseFloat(currentTime);
    if (this.timeInState.hasOwnProperty(prevState.stateCode))
      this.timeInState[prevState.stateCode] += parseFloat(prevState.end) - parseFloat(prevState.start);
    else
      this.timeInState[prevState.stateCode] = parseFloat(prevState.end) - parseFloat(prevState.start);
  }

  // update currentState and add a new state to the timeline
  this.currentState = stateCode;
  if (duration >= 0)
    this.timeline.push({stateCode: stateCode, start: currentTime, end: null});
  this.timeRemaining = duration;
};

Actor.prototype.update = function(sim) {

  var states = Actor.stateCodes;

  if (this.type == 'Patient') {
    switch (this.currentState) {
      case states.PATIENT_BEFORE_ARRIVAL:
        this.setState(states.PATIENT_CHECKING_IN, sim.time, sim.getDuration('pt_checkin'));
        break;
      case states.PATIENT_CHECKING_IN:
        if (parseFloat(this.maxWaitTimeClinicalTeam) > 0 && this.preferredClinicalTeam != 'None')
          this.setState(states.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM, sim.time, this.maxWaitTimeClinicalTeam);
        else
          this.setState(states.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM, sim.time);
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
        this.totalTimeInClinic = sim.time - this.timeline[0].end;
        this.setState(states.PATIENT_FINISHED, sim.time, -1);
        break;
    }
  }

  if (this.type == 'ClinicalTeam') {
    switch (this.currentState) {
      case states.CLINICAL_TEAM_GROUP_HUDDLE:
        this.setState(states.CLINICAL_TEAM_WAITING_FOR_PATIENT, sim.time);
        break;
      case states.PATIENT_CLINICAL_TEAM_MEETING:
        var patient = this.patientsSeen[this.patientsSeen.length - 1]; // last patient seen
        if (patient.maxWaitTimeAttending > 0 && patient.preferredAttending != 'None') {
          this.setState(states.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING, sim.time, patient.maxWaitTimeAttending);
        } else {
          this.setState(states.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING, sim.time);
        }
        break;
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

  if (this.type == 'Attending') {
    switch (this.currentState) {
      case states.PATIENT_ATTENDING_MEETING:
        this.setState(states.ATTENDING_WAITING_FOR_CLINICAL_TEAM, sim.time);
        break;
      case states.CLINICAL_TEAM_ATTENDING_MEETING:
        this.setState(states.ATTENDING_WAITING_FOR_PATIENT_ATTENDING_MEETING, sim.time);
        break;
    }
  }

};