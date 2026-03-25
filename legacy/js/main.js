'use strict';

function Simulation() {

}

Simulation.prototype.get_duration = function(name) {
  var dist = this.params.distributions[name];
  // solve for alpha, beta of beta distribution
  var mu = (dist.mean - dist.min) / (dist.max - dist.min);
  var sigma = Math.sqrt(dist.stdev) / (dist.max - dist.min);
  var sigma2 = sigma * sigma;
  var a = (mu * mu - mu * mu * mu - mu * sigma2) / sigma2;
  var b = (mu - 1) * (mu * mu - mu + sigma2) / sigma2;
  return rbeta(a, b) * (dist.max - dist.min) + dist.min;
};

Simulation.prototype.get_actors = function(filter, sort_by_time) {
  sort_by_time = (typeof sort_by_time !== 'undefined') ? sort_by_time : false;
  var list = [ ];
  this.actors.forEach = function(actor) {
    if (filter(actor))
      list.push(actor);
  };
  if (sort_by_time) {
    list.sort(function(a, b) {
      var a_wait = a.timeline.length > 0 ? this.time - a.timeline[a.timeline.length-1].start : this.time;
      var b_wait = b.timeline.length > 0 ? this.time - b.timeline[b.timeline.length-1].start : this.time;
      return (a_wait < b_wait) ? 1 : -1; // sort largest-to-smallest
    });
  }
  return list;
};

Simulation.prototype.step = function() {
  // get minimum step size
  var min_step = this.actors[0].time_remaining;
  this.actors.forEach(function(actor) {
    if (actor.time_remaining < min_step)
      min_step = actor.time_remaining;
  });
  // advance time
  this.time += min_step;
  this.actors.forEach(function(actor) {
    actor.time_remaining -= min_step;
  });
  // since we need two calls to actor.update() to generate start and end of event
  this.actors.forEach(function(actor) {
    if (actor.time_remaining <= 0)
      actor.update(this);
  });
  this.actors.forEach(function(actor) {
    if (actor.time_remaining <= 0)
      actor.update(this);
  });

};

Simulation.prototype.is_done = function() {
  return false;
};

Simulation.prototype.run = function(params) {
  this.params = params;
  this.actors = [ ];
  this.time = 0;
  this.scheduler = new Scheduler(this);
  this.scheduler.init();
  while (!this.is_done()) {
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
};