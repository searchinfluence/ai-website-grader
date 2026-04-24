import { describe, expect, it } from 'vitest';
import { SCORING_FACTORS } from '@/lib/scoring/config';

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
