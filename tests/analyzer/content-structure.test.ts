import { describe, expect, it } from 'vitest';
import { analyzeContentStructure } from '@/lib/analyzer/content-structure';
import { buildCrawledContent } from '../fixtures/crawled-content';

describe('analyzeContentStructure', () => {
  it('returns the contentStructure factor key, label, and weight', () => {
    const result = analyzeContentStructure(buildCrawledContent());
    expect(result.key).toBe('contentStructure');
    expect(result.label).toBe('Content Structure');
    expect(result.weight).toBeCloseTo(0.35, 5);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('flags missing H1 with a high-priority recommendation', () => {
    const result = analyzeContentStructure(buildCrawledContent({
      headings: [{ level: 2, text: 'Missing H1' }],
    }));
    expect(result.stats.h1Count).toBe(0);
    expect(result.findings.some((f) => /H1 tag/i.test(f))).toBe(true);
    expect(result.recommendations.some((r) => r.priority === 'high' && r.category === 'content-structure')).toBe(true);
  });

  it('flags multiple H1s', () => {
    const result = analyzeContentStructure(buildCrawledContent({
      headings: [
        { level: 1, text: 'First' },
        { level: 1, text: 'Second' },
      ],
    }));
    expect(result.stats.h1Count).toBe(2);
  });

  it('counts heading-level skips', () => {
    const result = analyzeContentStructure(buildCrawledContent({
      headings: [
        { level: 1, text: 'H1' },
        { level: 4, text: 'jumped to H4' },
      ],
    }));
    expect(result.stats.headingJumps).toBe(1);
  });

  it('flags thin content under 600 words and uses high priority under 400', () => {
    const thin = analyzeContentStructure(buildCrawledContent({ wordCount: 300, paragraphs: ['short'] }));
    expect(thin.findings.some((f) => /thin/i.test(f))).toBe(true);
    expect(thin.recommendations.some((r) => r.priority === 'high' && r.category === 'content-depth')).toBe(true);

    const medium = analyzeContentStructure(buildCrawledContent({ wordCount: 500, paragraphs: ['p1', 'p2'] }));
    expect(medium.recommendations.some((r) => r.priority === 'medium' && r.category === 'content-depth')).toBe(true);
  });

  it('flags low internal linking', () => {
    const result = analyzeContentStructure(buildCrawledContent({
      links: [
        { href: 'https://external.example.com/a', text: 'Ext A', internal: false },
        { href: 'https://external.example.com/b', text: 'Ext B', internal: false },
      ],
    }));
    expect(result.stats.internalLinks).toBe(0);
    expect(result.recommendations.some((r) => r.category === 'internal-linking')).toBe(true);
  });

  it('flags weak Q&A structure when fewer than 3 question headings', () => {
    const result = analyzeContentStructure(buildCrawledContent({
      headings: [
        { level: 1, text: 'Title' },
        { level: 2, text: 'About' },
      ],
    }));
    expect(result.recommendations.some((r) => r.category === 'faq-structure')).toBe(true);
  });

  it('flags missing alt text and escalates to high priority when many images affected', () => {
    const fewMissing = analyzeContentStructure(buildCrawledContent({
      images: [
        { src: '/a.jpg', alt: '' },
        { src: '/b.jpg', alt: 'has alt' },
      ],
    }));
    expect(fewMissing.stats.imagesMissingAlt).toBe(1);
    expect(fewMissing.recommendations.some((r) => r.priority === 'medium' && r.category === 'image-alt-text')).toBe(true);

    const manyMissing = analyzeContentStructure(buildCrawledContent({
      images: Array.from({ length: 10 }, (_, i) => ({ src: `/img${i}.jpg`, alt: '' })),
    }));
    expect(manyMissing.recommendations.some((r) => r.priority === 'high' && r.category === 'image-alt-text')).toBe(true);
  });

  it('handles manual-input URLs without throwing', () => {
    const result = analyzeContentStructure(buildCrawledContent({ url: 'manual-input' }));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(typeof result.stats.contentToCodeRatio).toBe('number');
  });

  it('falls back when wordsPerSentence > 50 (punctuation loss)', () => {
    const longRun = 'word '.repeat(200).trim();
    const result = analyzeContentStructure(buildCrawledContent({
      paragraphs: [longRun],
      wordCount: 200,
    }));
    expect(typeof result.stats.readabilityScore).toBe('number');
    expect(result.stats.readabilityScore).toBeGreaterThan(0);
  });

  it('rewards educational list/definition structure in faq score', () => {
    const result = analyzeContentStructure(buildCrawledContent({
      html: '<html><body><ol><li>step 1</li></ol><dl><dt>term</dt><dd>def</dd></dl></body></html>',
    }));
    expect(result.score).toBeGreaterThan(0);
  });

  it('preserves a high score for a well-structured page', () => {
    const result = analyzeContentStructure(buildCrawledContent({
      wordCount: 1500,
      headings: [
        { level: 1, text: 'Title' },
        { level: 2, text: 'Background' },
        { level: 2, text: 'How does X work?' },
        { level: 2, text: 'What is Y?' },
        { level: 2, text: 'Why does Z matter?' },
        { level: 2, text: 'FAQ' },
        { level: 3, text: 'Question one?' },
      ],
      links: Array.from({ length: 10 }, (_, i) => ({
        href: `/page-${i}`,
        text: `link ${i}`,
        internal: true,
      })),
      images: [
        { src: '/a.webp', alt: 'alt a' },
        { src: '/b.webp', alt: 'alt b' },
      ],
    }));
    expect(result.score).toBeGreaterThanOrEqual(60);
  });
});
