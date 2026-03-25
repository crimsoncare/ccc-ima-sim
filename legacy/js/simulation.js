'use strict';

function Simulation() {

}

Simulation.prototype.getDuration = function(distName) {
  var dist = this.params.distributions[distName];
  // solve for alpha, beta of beta distribution
  var mu = (dist.mean - dist.min) / (dist.max - dist.min);
  var sigma = dist.stdev / (dist.max - dist.min);
  var sigma2 = sigma * sigma;
  var a = (mu * mu - mu * mu * mu - mu * sigma2) / sigma2;
  var b = (mu - 1) * (mu * mu - mu + sigma2) / sigma2;
  var duration = rbeta(a, b) * (dist.max - dist.min) + dist.min;
  return duration;
};

Simulation.prototype.getActors = function(filter, sortByTime) {
  sortByTime = (typeof sortByTime !== 'undefined') ? sortByTime : false;
  var list = [ ];
  for (var i = 0; i < this.actors.length; i++)
    if (filter(this.actors[i]))
      list.push(this.actors[i]);
  var time = this.time;
  if (sortByTime) {
    list.sort(function(a, b) {
      var a_wait = a.timeline.length > 0 ? time - a.timeline[a.timeline.length-1].start : time;
      var b_wait = b.timeline.length > 0 ? time - b.timeline[b.timeline.length-1].start : time;
      return (a_wait < b_wait) ? 1 : -1; // sort largest-to-smallest
    });
  }
  return list;
};

Simulation.prototype.step = function() {
  // get minimum step size
  var minStep = 0;
  for (var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    if (actor.timeRemaining > 0) {
      if (minStep == 0)
        minStep = actor.timeRemaining;
      else if (actor.timeRemaining < minStep)
        minStep = actor.timeRemaining;
    }
  };
  if (minStep == 0) {
    throw 'minStep = 0'; // this is bad, since simulation cannot continue...
  }
  // advance time
  this.time += minStep;
  for (var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    actor.timeRemaining -= minStep;
  };
  // since we need two calls to actor.update() to generate start and end of event
  var self = this;
  for (var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    if (actor.timeRemaining <= 0)
      actor.update(self);
  };
  for (var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    if (actor.timeRemaining <= 0)
      actor.update(self);
  };
};

Simulation.prototype.print = function() {
  var self = this;
  this.actors.forEach(function(actor) {
    console.log(self.time + ' ' + actor.id + ': ' + Actor.stateLabels[actor.currentState] + ' Time remaining: ' + actor.timeRemaining);
  });
  console.log("\n");
};

Simulation.prototype.isDone = function() {
  var done = true;
  this.actors.forEach(function(actor) {
    if (actor.type == 'Patient' && actor.currentState !== Actor.stateCodes.PATIENT_FINISHED)
      done = false;
  });
  return done;
};

Simulation.prototype.run = function(params, scheduler) {
  this.params = params;
  this.actors = [ ];
  this.time = 0;
  this.scheduler = scheduler;
  this.scheduler.init(this);
  while (!this.isDone()) {
    this.scheduler.run();
    this.step();
  }
  this.cleanup();
};

Simulation.prototype.cleanup = function() {
  // remove events that have start but no end
  this.actors.forEach(function(actor) {
    if (actor.timeline[actor.timeline.length-1].end == null)
      actor.timeline.pop();
  });
  this.actors.forEach(function(actor) {
    if (actor.type == 'Patient') {
      actor.waitingForClinicalTeam = 0;
      actor.timeline.forEach(function(state) {
        if (state.stateCode == Actor.stateCodes.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM ||
          state.stateCode == Actor.stateCodes.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM)
          actor.waitingForClinicalTeam += parseFloat(state.end) - parseFloat(state.start);
      });
    } else if (actor.type == 'ClinicalTeam') {
      actor.waitingForAttending = 0;
      actor.timeline.forEach(function(state) {
        if (state.stateCode == Actor.stateCodes.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING ||
          state.stateCode == Actor.stateCodes.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING)
          actor.waitingForAttending += parseFloat(state.end) - parseFloat(state.start);
      });
    }
  });
};

Simulation.formatTime = function(time) {
  var pad = function(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }
  var hours = Math.floor(time / 60);
  var hour = 5 + hours;
  var minutes = time - hours * 60;
  return hour.toString() + ':' + pad(minutes, 2);
};

Simulation.formatDuration = function(duration) {
  var pad = function(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }
  var hours = Math.floor(duration / 60);
  var minutes = duration - hours * 60;
  return hours.toString() + ':' + pad(minutes, 2);
};