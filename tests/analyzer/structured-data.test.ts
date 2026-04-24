import { describe, expect, it } from 'vitest';
import { analyzeStructuredData } from '@/lib/analyzer/structured-data';
import { buildCrawledContent } from '../fixtures/crawled-content';

describe('analyzeStructuredData', () => {
  it('returns the structuredData factor', () => {
    const result = analyzeStructuredData(buildCrawledContent());
    expect(result.key).toBe('structuredData');
    expect(result.label).toBe('Structured Data');
    expect(result.weight).toBeCloseTo(0.25, 5);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('flags missing JSON-LD with a high-priority recommendation', () => {
    const result = analyzeStructuredData(buildCrawledContent({
      schemaMarkup: [],
      html: '<html><body>plain</body></html>',
    }));
    expect(result.findings.some((f) => /JSON-LD/i.test(f))).toBe(true);
    expect(result.recommendations.some((r) => r.priority === 'high' && r.category === 'schema')).toBe(true);
    expect(result.stats.jsonLdCount).toBe(0);
  });

  it('flags missing FAQPage when JSON-LD exists but no FAQ schema', () => {
    const result = analyzeStructuredData(buildCrawledContent());
    expect(result.recommendations.some((r) => r.category === 'schema-faq')).toBe(true);
  });

  it('does NOT flag FAQPage when FAQPage schema is present', () => {
    const result = analyzeStructuredData(buildCrawledContent({
      schemaMarkup: [JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage' })],
    }));
    expect(result.recommendations.some((r) => r.category === 'schema-faq')).toBe(false);
  });

  it('flags missing Open Graph and Twitter cards', () => {
    const result = analyzeStructuredData(buildCrawledContent({
      html: '<html><head></head><body></body></html>',
    }));
    expect(result.stats.hasOpenGraph).toBe(false);
    expect(result.stats.hasTwitter).toBe(false);
    expect(result.recommendations.some((r) => r.category === 'social-meta')).toBe(true);
  });

  it('detects og: and twitter: meta tags from html (single quotes too)', () => {
    const result = analyzeStructuredData(buildCrawledContent({
      html: `<html><head><meta property='og:title' content='Hi'/><meta name='twitter:card' content='summary'/></head><body></body></html>`,
    }));
    expect(result.stats.hasOpenGraph).toBe(true);
    expect(result.stats.hasTwitter).toBe(true);
    expect(result.recommendations.some((r) => r.category === 'social-meta')).toBe(false);
  });

  it('flags invalid JSON-LD blocks', () => {
    const result = analyzeStructuredData(buildCrawledContent({
      schemaMarkup: [JSON.stringify({ '@type': 'Organization' }), 'not-json'],
    }));
    expect(result.recommendations.some((r) => r.priority === 'high' && r.category === 'schema-validation')).toBe(true);
  });

  it('rewards rich snippet eligibility (FAQ + HowTo + Article + Product)', () => {
    const result = analyzeStructuredData(buildCrawledContent({
      schemaMarkup: [
        JSON.stringify({ '@type': 'FAQPage' }),
        JSON.stringify({ '@type': 'HowTo' }),
        JSON.stringify({ '@type': 'Article' }),
        JSON.stringify({ '@type': 'Product' }),
        JSON.stringify({ '@type': 'Organization' }),
      ],
      html: `<head><meta property="og:title" content="hi"/><meta name="twitter:card" content="summary"/></head>`,
    }));
    expect(result.stats.richSnippetEligible).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('handles manual-input without throwing on URL parsing', () => {
    const result = analyzeStructuredData(buildCrawledContent({
      url: 'manual-input',
      schemaMarkup: [],
    }));
    expect(result.recommendations[0].text).toMatch(/this content input/);
  });
});
