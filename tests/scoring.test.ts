import { describe, expect, it } from 'vitest';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import { clamp, toStatus } from '@/lib/analyzer/shared';

describe('SCORING_FACTORS', () => {
  it('factor weights sum to 1.0', () => {
    const total = SCORING_FACTORS.reduce((sum, f) => sum + f.weight, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it('has exactly the four V3 factors', () => {
    const keys = SCORING_FACTORS.map((f) => f.key).sort();
    expect(keys).toEqual(['contentStructure', 'pageSEO', 'structuredData', 'technicalHealth']);
  });

  it('every factor has a non-empty label and description', () => {
    for (const f of SCORING_FACTORS) {
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.description.length).toBeGreaterThan(0);
    }
  });
});

describe('clamp', () => {
  it('returns the value when in range', () => {
    expect(clamp(50)).toBe(50);
  });

  it('rounds to an integer', () => {
    expect(clamp(67.6)).toBe(68);
    expect(clamp(67.4)).toBe(67);
  });

  it('clamps below the minimum', () => {
    expect(clamp(-20)).toBe(0);
  });

  it('clamps above the maximum', () => {
    expect(clamp(150)).toBe(100);
  });

  it('respects custom bounds', () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(25, 10, 20)).toBe(20);
  });
});

describe('toStatus', () => {
  it('maps score bands per V3 thresholds', () => {
    expect(toStatus(95)).toBe('excellent');
    expect(toStatus(85)).toBe('excellent');
    expect(toStatus(84)).toBe('good');
    expect(toStatus(70)).toBe('good');
    expect(toStatus(69)).toBe('needs-improvement');
    expect(toStatus(50)).toBe('needs-improvement');
    expect(toStatus(49)).toBe('poor');
    expect(toStatus(30)).toBe('poor');
    expect(toStatus(29)).toBe('critical');
    expect(toStatus(0)).toBe('critical');
  });
});
