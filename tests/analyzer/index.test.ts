import { describe, expect, it } from 'vitest';
import { analyzeWebsiteFactors } from '@/lib/analyzer';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import { buildCrawledContent } from '../fixtures/crawled-content';

describe('analyzeWebsiteFactors', () => {
  it('runs all four analyzers and returns their results keyed by factor', () => {
    const out = analyzeWebsiteFactors(buildCrawledContent());
    expect(Object.keys(out.factors).sort()).toEqual([
      'contentStructure',
      'pageSEO',
      'structuredData',
      'technicalHealth',
    ]);
    expect(out.factors.contentStructure.key).toBe('contentStructure');
    expect(out.factors.structuredData.key).toBe('structuredData');
    expect(out.factors.technicalHealth.key).toBe('technicalHealth');
    expect(out.factors.pageSEO.key).toBe('pageSEO');
  });

  it('returns overallScore as the weighted sum, clamped 0-100', () => {
    const out = analyzeWebsiteFactors(buildCrawledContent());
    const factorValues = Object.values(out.factors);
    const expected = factorValues.reduce((sum, f) => sum + f.score * f.weight, 0);
    expect(out.overallScore).toBe(Math.round(expected));
    expect(out.overallScore).toBeGreaterThanOrEqual(0);
    expect(out.overallScore).toBeLessThanOrEqual(100);
  });

  it('factor weights match the SCORING_FACTORS config', () => {
    const out = analyzeWebsiteFactors(buildCrawledContent());
    for (const cfg of SCORING_FACTORS) {
      expect(out.factors[cfg.key].weight).toBeCloseTo(cfg.weight, 5);
    }
  });

  it('produces a recommendations list (deduped, prioritized) with up to 12 items', () => {
    const out = analyzeWebsiteFactors(buildCrawledContent());
    expect(Array.isArray(out.recommendations)).toBe(true);
    expect(out.recommendations.length).toBeLessThanOrEqual(12);
  });

  it('exposes rawStats with an ISO timestamp and per-factor stats', () => {
    const out = analyzeWebsiteFactors(buildCrawledContent());
    expect(out.rawStats.factorCount).toBe(4);
    expect(typeof out.rawStats.generatedAt).toBe('string');
    expect(() => new Date(out.rawStats.generatedAt as string).toISOString()).not.toThrow();
    expect(Array.isArray(out.rawStats.factorStats)).toBe(true);
  });

  it('a deliberately broken page scores lower than a healthy one', () => {
    const broken = analyzeWebsiteFactors(buildCrawledContent({
      url: 'http://example.com',
      title: 'Hi',
      metaDescription: '',
      headings: [],
      paragraphs: [],
      wordCount: 50,
      images: Array.from({ length: 8 }, (_, i) => ({ src: `/img${i}.png`, alt: '' })),
      links: [],
      schemaMarkup: [],
      html: '<html><head></head><body><p>tiny</p></body></html>',
      mobileInfo: {
        hasViewportMeta: false,
        hasTouchableElements: false,
        usesResponsiveImages: false,
        mobileOptimizedCSS: false,
      },
      robotsInfo: undefined,
      loadTime: 8000,
    }));
    const healthy = analyzeWebsiteFactors(buildCrawledContent());
    expect(broken.overallScore).toBeLessThan(healthy.overallScore);
  });
});
