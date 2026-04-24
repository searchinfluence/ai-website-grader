import { describe, expect, it } from 'vitest';
import { analyzePageSeo } from '@/lib/analyzer/page-seo';
import { buildCrawledContent } from '../fixtures/crawled-content';

describe('analyzePageSeo', () => {
  it('returns the pageSEO factor', () => {
    const result = analyzePageSeo(buildCrawledContent());
    expect(result.key).toBe('pageSEO');
    expect(result.label).toBe('Page SEO');
    expect(result.weight).toBeCloseTo(0.20, 5);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('flags too-short title with high priority', () => {
    const result = analyzePageSeo(buildCrawledContent({ title: 'Short' }));
    expect(result.findings.some((f) => /Title length/i.test(f))).toBe(true);
    expect(result.recommendations.some((r) => r.priority === 'high' && r.category === 'title-tag')).toBe(true);
    expect(result.stats.titleLength).toBe(5);
  });

  it('flags too-long title (over 60 chars)', () => {
    const tooLong = 'A'.repeat(80);
    const result = analyzePageSeo(buildCrawledContent({ title: tooLong }));
    expect(result.recommendations.some((r) => r.category === 'title-tag')).toBe(true);
  });

  it('passes a 30-60 char title with no recommendation', () => {
    const result = analyzePageSeo(buildCrawledContent({ title: 'A solid title of about forty chars long.' }));
    expect(result.recommendations.some((r) => r.category === 'title-tag')).toBe(false);
  });

  it('flags too-short and too-long meta descriptions', () => {
    const tooShort = analyzePageSeo(buildCrawledContent({ metaDescription: 'short' }));
    expect(tooShort.recommendations.some((r) => r.category === 'meta-description')).toBe(true);

    const tooLong = analyzePageSeo(buildCrawledContent({ metaDescription: 'x'.repeat(200) }));
    expect(tooLong.recommendations.some((r) => r.category === 'meta-description')).toBe(true);
  });

  it('flags h1 count != 1', () => {
    const zero = analyzePageSeo(buildCrawledContent({
      headings: [{ level: 2, text: 'just h2' }],
    }));
    expect(zero.recommendations.some((r) => r.priority === 'high' && r.category === 'h1')).toBe(true);

    const two = analyzePageSeo(buildCrawledContent({
      headings: [
        { level: 1, text: 'a' },
        { level: 1, text: 'b' },
      ],
    }));
    expect(two.recommendations.some((r) => r.category === 'h1')).toBe(true);
  });

  it('flags deep URL paths', () => {
    const result = analyzePageSeo(buildCrawledContent({
      url: 'https://example.com/a/b/c/d/e/f',
    }));
    expect(result.stats.pathDepth).toBeGreaterThan(3);
    expect(result.recommendations.some((r) => r.category === 'url-structure')).toBe(true);
  });

  it('flags URLs with query strings and non-clean characters', () => {
    const withQuery = analyzePageSeo(buildCrawledContent({
      url: 'https://example.com/path?utm=x',
    }));
    expect(withQuery.stats.hasQuery).toBe(true);
    expect(withQuery.recommendations.some((r) => r.category === 'url-structure')).toBe(true);

    const dirty = analyzePageSeo(buildCrawledContent({
      url: 'https://example.com/Path_With_UPPER',
    }));
    expect(dirty.stats.pathIsClean).toBe(false);
  });

  it('skips URL recommendation for manual-input', () => {
    const result = analyzePageSeo(buildCrawledContent({ url: 'manual-input' }));
    expect(result.stats.pathDepth).toBe(0);
    expect(result.recommendations.some((r) => r.category === 'url-structure')).toBe(false);
  });

  it('flags missing alt and low WebP usage', () => {
    const result = analyzePageSeo(buildCrawledContent({
      images: [
        { src: '/a.png', alt: '' },
        { src: '/b.jpg', alt: 'has alt' },
        { src: '/c.gif', alt: 'has alt' },
      ],
    }));
    expect(result.recommendations.some((r) => r.category === 'image-seo')).toBe(true);
  });

  it('does NOT flag image-seo when all images have alt and WebP coverage is high', () => {
    const result = analyzePageSeo(buildCrawledContent({
      images: [
        { src: '/a.webp', alt: 'a' },
        { src: '/b.webp', alt: 'b' },
      ],
    }));
    expect(result.recommendations.some((r) => r.category === 'image-seo')).toBe(false);
  });
});
