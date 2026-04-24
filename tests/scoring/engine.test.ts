import { describe, expect, it } from 'vitest';
import { scoreWebsiteV3 } from '@/lib/scoring/engine';
import { buildCrawledContent } from '../fixtures/crawled-content';

describe('scoreWebsiteV3', () => {
  it('returns the analyzeWebsiteFactors shape with overallScore in [0, 100]', () => {
    const result = scoreWebsiteV3(buildCrawledContent());
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(Object.keys(result.factors).sort()).toEqual([
      'contentStructure',
      'pageSEO',
      'structuredData',
      'technicalHealth',
    ]);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});
