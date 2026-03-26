import { describe, it, expect, beforeEach } from 'vitest';
import {
  setRandomSeed,
  resetRandom,
  random,
  rbeta,
  rgamma,
  getMean,
  getVariance,
  getStdev,
  getStats,
  addFloat64Array,
} from '../math';

describe('Seedable PRNG', () => {
  beforeEach(() => resetRandom());

  it('produces deterministic values with seed', () => {
    setRandomSeed(42);
    const values1 = Array.from({ length: 10 }, () => random());

    setRandomSeed(42);
    const values2 = Array.from({ length: 10 }, () => random());

    expect(values1).toEqual(values2);
  });

  it('produces different values with different seeds', () => {
    setRandomSeed(42);
    const a = random();
    setRandomSeed(99);
    const b = random();
    expect(a).not.toEqual(b);
  });

  it('produces values in [0, 1)', () => {
    setRandomSeed(42);
    for (let i = 0; i < 1000; i++) {
      const v = random();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('rbeta', () => {
  beforeEach(() => setRandomSeed(42));

  it('produces values in [0, 1]', () => {
    for (let i = 0; i < 100; i++) {
      const v = rbeta(2, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('produces deterministic values with seed', () => {
    setRandomSeed(42);
    const a = rbeta(2, 5);
    setRandomSeed(42);
    const b = rbeta(2, 5);
    expect(a).toEqual(b);
  });

  it('has correct mean approximation (alpha / (alpha + beta))', () => {
    setRandomSeed(42);
    const samples = Array.from({ length: 5000 }, () => rbeta(2, 5));
    const mean = getMean(samples);
    expect(mean).toBeCloseTo(2 / 7, 1); // ~0.286
  });
});

describe('rgamma', () => {
  beforeEach(() => setRandomSeed(42));

  it('throws for non-positive parameters', () => {
    expect(() => rgamma(0, 1)).toThrow();
    expect(() => rgamma(1, 0)).toThrow();
    expect(() => rgamma(-1, 1)).toThrow();
  });

  it('produces positive values', () => {
    for (let i = 0; i < 100; i++) {
      expect(rgamma(2, 1)).toBeGreaterThan(0);
    }
  });

  it('handles alpha = 1 (exponential distribution)', () => {
    setRandomSeed(42);
    const samples = Array.from({ length: 5000 }, () => rgamma(1, 1));
    const mean = getMean(samples);
    expect(mean).toBeCloseTo(1, 0); // Exponential(1) has mean 1
  });

  it('handles alpha < 1', () => {
    setRandomSeed(42);
    const samples = Array.from({ length: 5000 }, () => rgamma(0.5, 1));
    const mean = getMean(samples);
    expect(mean).toBeCloseTo(0.5, 0);
  });

  it('handles alpha > 1', () => {
    setRandomSeed(42);
    const samples = Array.from({ length: 5000 }, () => rgamma(3, 2));
    const mean = getMean(samples);
    expect(mean).toBeCloseTo(6, 0); // Gamma(3,2) has mean 6
  });
});

describe('Statistics', () => {
  it('getMean returns correct average', () => {
    expect(getMean([1, 2, 3, 4, 5])).toBe(3);
    expect(getMean([10])).toBe(10);
  });

  it('getVariance returns correct sample variance', () => {
    // Sample variance with n-1 denominator: sum((x-mean)^2) / (n-1)
    // mean = 5, sum of squared deviations = 32, n-1 = 7, variance = 32/7 ≈ 4.571
    const variance = getVariance([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(variance).toBeCloseTo(4.571, 2);
  });

  it('getStdev returns correct standard deviation', () => {
    const stdev = getStdev([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stdev).toBeCloseTo(2, 0);
  });

  it('getStats returns all percentiles', () => {
    const data = new Float64Array(Array.from({ length: 100 }, (_, i) => i));
    const stats = getStats(data);
    expect(stats.mean).toBeCloseTo(49.5, 0);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(99);
    expect(stats.pct05).toBeCloseTo(5, 0);
    expect(stats.pct25).toBeCloseTo(25, 0);
    expect(stats.pct50).toBeCloseTo(50, 0);
    expect(stats.pct75).toBeCloseTo(75, 0);
    expect(stats.pct95).toBeCloseTo(95, 0);
  });

  it('addFloat64Array adds element-wise', () => {
    const a = new Float64Array([1, 2, 3]);
    const b = new Float64Array([4, 5, 6]);
    const result = addFloat64Array(a, b);
    expect(Array.from(result)).toEqual([5, 7, 9]);
  });
});
