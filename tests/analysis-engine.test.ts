import { afterEach, describe, expect, it, vi } from 'vitest';

const mockCrawl = vi.fn();
const mockParseText = vi.fn();
const mockScore = vi.fn();

vi.mock('@/lib/crawler', () => ({
  crawlWebsite: (...args: unknown[]) => mockCrawl(...args),
  parseTextContent: (...args: unknown[]) => mockParseText(...args),
}));
vi.mock('@/lib/scoring/engine', () => ({
  scoreWebsiteV3: (...args: unknown[]) => mockScore(...args),
}));

import { analyzeWebsite } from '@/lib/analysis-engine';

const baseContent = {
  title: 'Hello',
  metaDescription: '',
  headings: [],
  paragraphs: [],
  images: [],
  links: [],
  wordCount: 0,
  html: '',
  url: 'https://example.com',
  schemaMarkup: [],
  hasJavaScriptDependency: false,
};

const baseScore = {
  overallScore: 80,
  factors: {},
  recommendations: [],
  rawStats: {},
};

afterEach(() => {
  mockCrawl.mockReset();
  mockParseText.mockReset();
  mockScore.mockReset();
});

describe('analyzeWebsite', () => {
  it('uses crawlWebsite when no textContent is provided', async () => {
    mockCrawl.mockResolvedValue(baseContent);
    mockScore.mockReturnValue(baseScore);

    const out = await analyzeWebsite('https://example.com');

    expect(mockCrawl).toHaveBeenCalledWith('https://example.com');
    expect(mockParseText).not.toHaveBeenCalled();
    expect(out.url).toBe('https://example.com');
    expect(out.overallScore).toBe(80);
    expect(out.analysisScope).toBe('page');
    expect(typeof out.timestamp).toBe('string');
  });

  it('uses parseTextContent when textContent is provided and sets a manual title', async () => {
    mockParseText.mockResolvedValue({ ...baseContent, title: '' });
    mockScore.mockReturnValue(baseScore);

    const out = await analyzeWebsite('manual-input', 'pasted body text');

    expect(mockParseText).toHaveBeenCalledWith('pasted body text');
    expect(mockCrawl).not.toHaveBeenCalled();
    expect(out.title).toBe('Manual Content Analysis');
  });

  it('translates a crawl-failure into a friendly user-facing error', async () => {
    mockCrawl.mockRejectedValue(new Error('Failed to crawl website: timeout'));
    await expect(analyzeWebsite('https://example.com')).rejects.toThrow(/Analyze Text/);
  });

  it('passes through other error messages with a Failed-to-analyze prefix', async () => {
    mockCrawl.mockRejectedValue(new Error('something else'));
    await expect(analyzeWebsite('https://example.com')).rejects.toThrow(/Failed to analyze website: something else/);
  });

  it('preserves the crawled content reference in the result', async () => {
    mockCrawl.mockResolvedValue(baseContent);
    mockScore.mockReturnValue(baseScore);
    const out = await analyzeWebsite('https://example.com');
    expect(out.crawledContent).toBe(baseContent);
  });
});
