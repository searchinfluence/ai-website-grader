import { describe, expect, it } from 'vitest';
import { clamp, getMainContentText, summarizeSchema, toStatus } from '@/lib/analyzer/shared';
import { buildCrawledContent } from '../fixtures/crawled-content';

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

describe('getMainContentText', () => {
  it('joins paragraphs with spaces when paragraphs exist', () => {
    const content = buildCrawledContent({
      paragraphs: ['First.', 'Second.', 'Third.'],
    });
    expect(getMainContentText(content)).toBe('First. Second. Third.');
  });

  it('strips HTML tags and collapses whitespace when paragraphs are empty', () => {
    const content = buildCrawledContent({
      paragraphs: [],
      html: '<div>  <p>Hello   <strong>world</strong></p>\n<p>Again</p>  </div>',
    });
    expect(getMainContentText(content)).toBe('Hello world Again');
  });
});

describe('summarizeSchema', () => {
  it('counts JSON-LD blocks and surfaces top-level @type', () => {
    const content = buildCrawledContent({
      schemaMarkup: [
        JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Acme' }),
        JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage' }),
      ],
    });
    const summary = summarizeSchema(content);
    expect(summary.jsonLdCount).toBe(2);
    expect(summary.totalBlocks).toBe(2);
    expect(summary.validBlocks).toBe(2);
    expect(summary.schemaTypes).toContain('Organization');
    expect(summary.schemaTypes).toContain('FAQPage');
    expect(summary.hasOrganization).toBe(true);
    expect(summary.hasFaqPage).toBe(true);
  });

  it('detects @graph entries and recurses into nested types', () => {
    const content = buildCrawledContent({
      schemaMarkup: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Article', headline: 'Hello' },
            { '@type': 'Person', name: 'Author' },
          ],
        }),
      ],
    });
    const summary = summarizeSchema(content);
    expect(summary.hasGraph).toBe(true);
    expect(summary.hasArticle).toBe(true);
    expect(summary.schemaTypes).toContain('Article');
    expect(summary.schemaTypes).toContain('Person');
  });

  it('handles array @type and full schema.org URLs', () => {
    const content = buildCrawledContent({
      schemaMarkup: [
        JSON.stringify({ '@type': ['LocalBusiness', 'Restaurant'] }),
        JSON.stringify({ '@type': 'https://schema.org/Product' }),
      ],
    });
    const summary = summarizeSchema(content);
    expect(summary.schemaTypes).toEqual(expect.arrayContaining(['LocalBusiness', 'Restaurant', 'Product']));
    expect(summary.hasOrganization).toBe(true);
    expect(summary.hasProductOrService).toBe(true);
  });

  it('counts invalid JSON-LD blocks toward totalBlocks but not validBlocks', () => {
    const content = buildCrawledContent({
      schemaMarkup: ['{not json}', JSON.stringify({ '@type': 'Article' })],
    });
    const summary = summarizeSchema(content);
    expect(summary.totalBlocks).toBe(2);
    expect(summary.validBlocks).toBe(1);
  });

  it('extracts microdata via itemtype attributes', () => {
    const content = buildCrawledContent({
      schemaMarkup: [],
      html: '<div itemscope itemtype="https://schema.org/HowTo"><span itemtype="http://schema.org/Service"></span></div>',
    });
    const summary = summarizeSchema(content);
    expect(summary.microdataTypes).toContain('HowTo');
    expect(summary.hasHowTo).toBe(true);
    expect(summary.microdataTypes).toContain('Service');
  });

  it('extracts RDFa via typeof + vocab="https://schema.org"', () => {
    const content = buildCrawledContent({
      schemaMarkup: [],
      html: '<article vocab="https://schema.org/" typeof="BlogPosting">Body</article>',
    });
    const summary = summarizeSchema(content);
    expect(summary.rdfaTypes).toContain('BlogPosting');
    expect(summary.hasArticle).toBe(true);
  });

  it('extracts RDFa via prefix-bound typeof', () => {
    const content = buildCrawledContent({
      schemaMarkup: [],
      html: '<div prefix="schema: https://schema.org/" typeof="schema:NewsArticle"></div>',
    });
    const summary = summarizeSchema(content);
    expect(summary.rdfaTypes).toContain('NewsArticle');
    expect(summary.hasArticle).toBe(true);
  });

  it('returns empty type lists for content with no schema signals', () => {
    const content = buildCrawledContent({
      schemaMarkup: [],
      html: '<html><body>Plain text</body></html>',
    });
    const summary = summarizeSchema(content);
    expect(summary.schemaTypes).toEqual([]);
    expect(summary.microdataTypes).toEqual([]);
    expect(summary.rdfaTypes).toEqual([]);
    expect(summary.hasOrganization).toBe(false);
    expect(summary.hasFaqPage).toBe(false);
    expect(summary.hasArticle).toBe(false);
    expect(summary.hasProductOrService).toBe(false);
  });
});
