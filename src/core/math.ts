/**
 * Mathematical functions ported from legacy/js/math.js
 * Includes seedable PRNG, beta/gamma distributions, and statistics.
 */

// Seedable PRNG using mulberry32 algorithm
let _randomFn: () => number = Math.random;

export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function setRandomSeed(seed: number): void {
  _randomFn = mulberry32(seed);
}

export function resetRandom(): void {
  _randomFn = Math.random;
}

export function random(): number {
  return _randomFn();
}

/**
 * Sample from Beta(alpha, beta) distribution.
 * Uses the ratio of two Gamma variates.
 */
export function rbeta(alpha: number, beta: number): number {
  const alphaGamma = rgamma(alpha, 1);
  return alphaGamma / (alphaGamma + rgamma(beta, 1));
}

/**
 * Sample from Gamma(alpha, beta) distribution.
 * Uses R.C.H. Cheng (1977) for alpha > 1,
 * exponential inverse for alpha = 1,
 * Kennedy & Gentle for 0 < alpha < 1.
 */
export function rgamma(alpha: number, beta: number): number {
  if (!(alpha > 0 && beta > 0)) {
    throw new Error('alpha > 0 && beta > 0');
  }

  if (alpha > 1) {
    const ainv = Math.sqrt(2.0 * alpha - 1.0);
    const bbb = alpha - Math.log(4.0);
    const ccc = alpha + ainv;

    while (true) {
      const u1 = random();
      if (!(1e-7 < u1 && u1 < 0.9999999)) {
        continue;
      }
      const u2 = 1.0 - random();
      const v = Math.log(u1 / (1.0 - u1)) / ainv;
      const x = alpha * Math.exp(v);
      const z = u1 * u1 * u2;
      const r = bbb + ccc * v - x;
      if (r + 1 + Math.log(4.5) - 4.5 * z >= 0.0 || r >= Math.log(z)) {
        return x * beta;
      }
    }
  } else if (alpha === 1.0) {
    let u = random();
    while (u <= 1e-7) {
      u = random();
    }
    return -Math.log(u) * beta;
  } else {
    // 0 < alpha < 1
    let x: number;
    while (true) {
      const u3 = random();
      const b = (Math.E + alpha) / Math.E;
      const p = b * u3;
      if (p <= 1.0) {
        x = Math.pow(p, 1.0 / alpha);
      } else {
        x = -Math.log((b - p) / alpha);
      }
      const u4 = random();
      if (p > 1.0) {
        if (u4 <= Math.pow(x, alpha - 1.0)) {
          break;
        }
      } else if (u4 <= Math.exp(-x)) {
        break;
      }
    }
    return x * beta;
  }
}

export function getMean(array: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum / array.length;
}

export function getVariance(array: ArrayLike<number>): number {
  const mean = getMean(array);
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += Math.pow(array[i] - mean, 2);
  }
  return sum / (array.length - 1);
}

export function getStdev(array: ArrayLike<number>): number {
  return Math.sqrt(getVariance(array));
}

export interface Stats {
  samples: Float64Array;
  mean: number;
  stdev: number;
  min: number;
  max: number;
  pct05: number;
  pct25: number;
  pct50: number;
  pct75: number;
  pct95: number;
}

export function getStats(samples: Float64Array): Stats {
  const getPercentile = (array: Float64Array, percentile: number): number => {
    return array[Math.floor(percentile * array.length)];
  };
  const sorted = new Float64Array(samples.length);
  for (let i = 0; i < sorted.length; i++) {
    sorted[i] = samples[i];
  }
  sorted.sort();
  return {
    samples,
    mean: getMean(samples),
    stdev: getStdev(samples),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    pct05: getPercentile(sorted, 0.05),
    pct25: getPercentile(sorted, 0.25),
    pct50: getPercentile(sorted, 0.5),
    pct75: getPercentile(sorted, 0.75),
    pct95: getPercentile(sorted, 0.95),
  };
}

export function addFloat64Array(a: Float64Array, b: Float64Array): Float64Array {
  const sum = new Float64Array(a.length);
  for (let i = 0; i < sum.length; i++) {
    sum[i] = a[i] + b[i];
  }
  return sum;
}
