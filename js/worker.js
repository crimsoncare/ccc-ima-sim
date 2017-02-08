'use strict';

importScripts('math.js');
importScripts('actor.js');
importScripts('simulation.js');
importScripts('scheduler.js');

onmessage = function(message) {
  if (message.data.action == 'runSingle') {
    postMessage({
      action: message.data.action,
      sim: runSingle(message.data.params)
    });
  }
  if (message.data.action == 'runMonteCarlo') {
    postMessage({
      action: message.data.action,
      results: runMonteCarlo(message.data.params, message.data.numSamps)
    });
  }
};

function runSingle(params) {
  var sim = new Simulation();
  var scheduler = new Scheduler();
  sim.run(params, scheduler);
  return sim;
}

function cloneSimulation(old) {
  // return JSON.parse(JSON.stringify(sim));
  var sim = {
    actors: [ ]
  };
  old.actors.forEach(function(actor) {
    var newActor = {
      id: actor.id,
      type: actor.type,
      timeline: JSON.parse(JSON.stringify(actor.timeline)),
    };
    if (actor.hasOwnProperty('patientsSeen')) {
      newActor.patientsSeen = [ ];
      actor.patientsSeen.forEach(function(patient) {
        var patient = {
          id: patient.id,
          clinicalTeam: {id: patient.clinicalTeam.id},
          attending: {id: patient.attending.id},
        };
        newActor.patientsSeen.push(patient);
      });
    }
    if (actor.hasOwnProperty('clinicalTeam')) {
      newActor.clinicalTeam = {id: actor.clinicalTeam.id};
    }
    if (actor.hasOwnProperty('attending')) {
      newActor.attending = {id: actor.attending.id};
    }
    sim.actors.push(newActor);
  });
  return sim;
}

function runMonteCarlo(params, numSamps) {

  var results = { actors: [ ], times: [ ] };

  var sim = new Simulation();
  var scheduler = new Scheduler();

  var worstCaseTime = 0;
  var worstCase = { };

  for (var i = 0; i < numSamps; i++) {

    sim.run(params, scheduler);

    // create results.actor that can store samples
    if (i == 0) {
      for (var j = 0; j < sim.actors.length; j++) {
        var actor = { timeInState: { } };
        Object.keys(sim.actors[j]).forEach(function(key) {
          if (key !== 'timeInState')
            actor[key] = sim.actors[j][key];
        });
        if (actor.type == 'Patient') {
          actor.seenByPreferredAttending = 0;
          actor.seenByPreferredClinicalTeam = 0;
          actor.totalTimeInClinic = [ ];
          actor.waitingForClinicalTeam = [ ];
          actor.waitingForAttending = [ ];
        }
        if (actor.type == 'ClinicalTeam' || actor.type == 'Attending') {
          actor.patientsSeen = [ ];
          actor.waitingForAttending = [ ];
        }
        results.actors.push(actor);
      }
    }

    // clinic end time and other global simulation info
    results.times.push(sim.time);

    if (sim.time > worstCaseTime) {
      worstCaseTime = sim.time;
      worstCase = cloneSimulation(sim);
    }

    // append to results.actor
    for (var j = 0; j < sim.actors.length; j++) {
      // append timeInState
      for (var stateCode in sim.actors[j].timeInState) {
        var stateLabel = Actor.stateLabels[stateCode];
        if (results.actors[j].timeInState.hasOwnProperty(stateLabel))
          results.actors[j].timeInState[stateLabel].push(sim.actors[j].timeInState[stateCode]);
        else
          results.actors[j].timeInState[stateLabel] = [sim.actors[j].timeInState[stateCode]];
      }
      // increment seenByPreferred count (will divide by numSamps later to get percentage)
      if (sim.actors[j].type == 'Patient') {
        results.actors[j].seenByPreferredAttending += sim.actors[j].seenByPreferredAttending ? 1 : 0;
        results.actors[j].seenByPreferredClinicalTeam += sim.actors[j].seenByPreferredClinicalTeam ? 1 : 0;
        results.actors[j].totalTimeInClinic.push(sim.actors[j].totalTimeInClinic);
        results.actors[j].waitingForClinicalTeam.push(sim.actors[j].waitingForClinicalTeam);
        results.actors[j].waitingForAttending.push(sim.actors[j].waitingForAttending);
      }
      // append number of patients seen
      if (sim.actors[j].type == 'ClinicalTeam' || sim.actors[j].type == 'Attending') {
        results.actors[j].patientsSeen.push(sim.actors[j].patientsSeen.length);
      }
      if (sim.actors[j].type == 'ClinicalTeam') {
        results.actors[j].waitingForAttending.push(sim.actors[j].waitingForAttending);
      }
    }
  }

  // get stats
  for (var j = 0; j < results.actors.length; j++) {
    for (var state in results.actors[j].timeInState) {
      results.actors[j].timeInState[state] = getStats(new Float64Array(results.actors[j].timeInState[state]));
    }
    if (results.actors[j].type == 'Patient') {
      results.actors[j].seenByPreferredAttending /= (numSamps / 100);
      results.actors[j].seenByPreferredClinicalTeam /= (numSamps / 100);
      results.actors[j].totalTimeInClinic = getStats(new Float64Array(results.actors[j].totalTimeInClinic));
      results.actors[j].waitingForClinicalTeam = getStats(new Float64Array(results.actors[j].waitingForClinicalTeam));
      results.actors[j].waitingForAttending = getStats(new Float64Array(results.actors[j].waitingForAttending));
    }
    if (results.actors[j].type == 'ClinicalTeam' || results.actors[j].type == 'Attending') {
      results.actors[j].patientsSeen = getStats(new Float64Array(results.actors[j].patientsSeen));
    }
    if (results.actors[j].type == 'ClinicalTeam') {
      results.actors[j].waitingForAttending = getStats(new Float64Array(results.actors[j].waitingForAttending));
    }
  }

  results.attendings = [ ];
  results.clinicalTeams = [ ];
  results.patients = [ ];
  results.actors.forEach(function(actor) {
    if (actor.type == 'Attending') results.attendings.push(actor);
    if (actor.type == 'ClinicalTeam') results.clinicalTeams.push(actor);
    if (actor.type == 'Patient') results.patients.push(actor);
  });

  results.patients.sort(function(a, b) {
    if (a.appointmentTime < b.appointmentTime) return -1;
    if (a.appointmentTime > b.appointmentTime) return  1;
    return 0;
  });

  var addTimeInState = function(actor, first, second) {
    if (actor.timeInState.hasOwnProperty(first) && actor.timeInState.hasOwnProperty(second)) {
      return getStats(addFloat64Array(
        actor.timeInState[first].samples,
        actor.timeInState[second].samples
      ));
    } else if (actor.timeInState.hasOwnProperty(first)) {
      return actor.timeInState[first];
    } else if (actor.timeInState.hasOwnProperty(second)) {
      return actor.timeInState[second];
    }
    return result;
  };

  // already have seenByPreferredAttending, seenByPreferredClinicalTeam, totalTimeInClinic
  // want to get waitingForClinicalTeam, waitingForAttending
  results.patients.forEach(function(patient) {
    patient.label = 'PT' + patient.id.split('-')[1] + ' ' + Simulation.formatTime(patient.appointmentTime);
  });

  results.clinicalTeams.forEach(function(clinicalTeam) {
    clinicalTeam.label = clinicalTeam.id;
  });

  results.attendings.forEach(function(attending) {
    attending.label = attending.id;
  });

  results.times = getStats(results.times);
  results.params = params;
  results.worstCase = worstCase;

  return results;
}

