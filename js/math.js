'use strict';

function rbeta(alpha, beta) {
  var alpha_gamma = rgamma(alpha, 1);
  return alpha_gamma / (alpha_gamma + rgamma(beta, 1));
}

function rgamma(alpha, beta) {
  if (!(alpha > 0 && beta > 0))
    throw 'alpha > 0 && beta > 0';
  // does not check that alpha > 0 && beta > 0
  if (alpha > 1) {
    // Uses R.C.H. Cheng, "The generation of Gamma variables with non-integral
    // shape parameters", Applied Statistics, (1977), 26, No. 1, p71-74
    var ainv = Math.sqrt(2.0 * alpha - 1.0);
    var bbb = alpha - Math.log(4.0);
    var ccc = alpha + ainv;

    while (true) {
      var u1 = Math.random();
      if (!((1e-7 < u1) && (u1 < 0.9999999))) {
        continue;
      }
      var u2 = 1.0 - Math.random();
      var v = Math.log(u1/(1.0-u1))/ainv;
      var x = alpha*Math.exp(v);
      var z = u1*u1*u2;
      var r = bbb+ccc*v-x;
      if (r + 1 + Math.log(4.5) - 4.5 * z >= 0.0 || r >= Math.log(z)) {
        return x * beta;
      }
    }
  }
  else if (alpha == 1.0) {
    var u = Math.random();
    while (u <= 1e-7) {
      u = Math.random();
    }
    return -Math.log(u) * beta;
  }
  else { // 0 < alpha < 1
    // Uses ALGORITHM GS of Statistical Computing - Kennedy & Gentle
    while (true) {
      var u3 = Math.random();
      var b = (Math.E + alpha)/Math.E;
      var p = b*u3;
      if (p <= 1.0) {
        x = Math.pow(p, (1.0/alpha));
      }
      else {
        x = -Math.log((b-p)/alpha);
      }
      var u4 = Math.random();
      if (p > 1.0) {
        if (u4 <= Math.pow(x, (alpha - 1.0))) {
          break;
        }
      }
      else if (u4 <= Math.exp(-x)) {
        break;
      }
    }
    return x * beta;
  }
}

function getMean(array) {
  var sum = 0;
  for (var i = 0; i < array.length; i++)
    sum += array[i];
  return sum / array.length;
}

function getVariance(array) {
  var mean = getMean(array);
  var sum = 0;
  for (var i = 0; i < array.length; i++)
    sum += Math.pow(array[i] - mean, 2);
  return sum / (array.length - 1);
}

function getStdev(array) {
  return Math.sqrt(getVariance(array));
}

function getStats(samples) {
  var getPercentile = function(array, percentile) {
    return array[Math.floor(percentile * array.length)];
  };
  var sorted = new Float64Array(samples.length);
  for (var i = 0; i < sorted.length; i++)
    sorted[i] = samples[i];
  sorted.sort();
  return {
    samples: samples,
    mean: getMean(samples),
    stdev: getStdev(samples),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    pct05: getPercentile(sorted, 0.05),
    pct25: getPercentile(sorted, 0.25),
    pct50: getPercentile(sorted, 0.50),
    pct75: getPercentile(sorted, 0.75),
    pct95: getPercentile(sorted, 0.95),
  };
}

function addFloat64Array(a, b) {
  var sum = new Float64Array(a.length);
  for (var i = 0; i < sum.length; i++)
    sum[i] = a[i] + b[i];
  return sum;
}