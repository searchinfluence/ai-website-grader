import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Override the global mock from tests/setup.ts so we can test the real functions.
vi.unmock('@/lib/performance-apis');

import {
  validateHTML,
  getPageSpeedInsights,
  analyzePerformanceMetrics,
  runParallelAnalysis,
} from '@/lib/performance-apis';

const mockFetch = (responder: (input: string) => Response | Promise<Response>) => {
  vi.stubGlobal('fetch', vi.fn(async (input: unknown) => responder(String(input))));
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GOOGLE_PAGESPEED_API_KEY;
});

describe('validateHTML', () => {
  it('parses an array-shaped W3C JSON response', async () => {
    mockFetch(async () =>
      new Response(
        JSON.stringify([
          { type: 'error', message: 'Bad attribute', lastLine: 12 },
          { type: 'warning', message: 'Section lacks heading', firstLine: 30 },
          { type: 'info', message: 'Trailing slash on void' },
        ]),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const out = await validateHTML('https://example.com');
    expect(out.errors).toBe(1);
    expect(out.warnings).toBe(1);
    expect(out.isValid).toBe(false);
    expect(out.validationState).toBe('invalid');
    expect(out.messages.length).toBe(3);
    expect(out.messages[0].line).toBe(12);
  });

  it('parses an object-shaped W3C JSON response with a messages array', async () => {
    mockFetch(async () =>
      new Response(
        JSON.stringify({
          messages: [
            { type: 'error', message: 'oops', lastLine: 5 },
            { type: 'warning', message: 'meh' },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const out = await validateHTML('https://example.com');
    expect(out.errors).toBe(1);
    expect(out.warnings).toBe(1);
    expect(out.isValid).toBe(false);
  });

  it('returns "unknown" validationState when the validator returns non-OK', async () => {
    mockFetch(async () => new Response('boom', { status: 500 }));
    const out = await validateHTML('https://example.com');
    expect(out.validationState).toBe('unknown');
    expect(out.isValid).toBe(false);
  });

  it('falls back to local validation when fetch throws (valid HTML → "valid")', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const out = await validateHTML(
      'https://example.com',
      '<!DOCTYPE html><html><head><title>X</title></head><body><p>x</p></body></html>',
    );
    // Local fallback flagged structural completeness — should be "valid".
    expect(out.validationState).toBe('valid');
    expect(out.isValid).toBe(true);
  });

  it('falls back to local validation when fetch throws (broken HTML → "invalid")', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const out = await validateHTML('https://example.com', '');
    expect(out.validationState).toBe('invalid');
    expect(out.errors).toBeGreaterThan(0);
  });

  it('POSTs the HTML body when called with manual-input + html', async () => {
    let receivedInit: RequestInit | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        receivedInit = init;
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }),
    );
    await validateHTML('manual-input', '<html><body>x</body></html>');
    expect(receivedInit?.method).toBe('POST');
    expect(receivedInit?.body).toBe('<html><body>x</body></html>');
  });
});

describe('getPageSpeedInsights', () => {
  it('returns estimated metrics when no API key is configured', async () => {
    const out = await getPageSpeedInsights('https://example.com');
    expect(out).toEqual({ lcp: 2500, fid: 100, cls: 0.1, score: 75 });
  });

  it('parses real PageSpeed response when an API key is set', async () => {
    process.env.GOOGLE_PAGESPEED_API_KEY = 'test-key';
    mockFetch(async () =>
      new Response(
        JSON.stringify({
          lighthouseResult: {
            audits: {
              'largest-contentful-paint': { numericValue: 1800 },
              'max-potential-fid': { numericValue: 80 },
              'cumulative-layout-shift': { numericValue: 0.05 },
            },
            categories: { performance: { score: 0.92 } },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const out = await getPageSpeedInsights('https://example.com');
    expect(out.lcp).toBe(1800);
    expect(out.fid).toBe(80);
    expect(out.cls).toBe(0.05);
    expect(out.score).toBe(92);
  });

  it('falls back to estimates when the PageSpeed API responds non-OK', async () => {
    process.env.GOOGLE_PAGESPEED_API_KEY = 'test-key';
    mockFetch(async () => new Response('quota', { status: 429 }));
    const out = await getPageSpeedInsights('https://example.com');
    expect(out).toEqual({ lcp: 2500, fid: 100, cls: 0.1, score: 75 });
  });

  it('falls back to estimates when fetch throws', async () => {
    process.env.GOOGLE_PAGESPEED_API_KEY = 'test-key';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('boom');
      }),
    );
    const out = await getPageSpeedInsights('https://example.com');
    expect(out).toEqual({ lcp: 2500, fid: 100, cls: 0.1, score: 75 });
  });
});

describe('analyzePerformanceMetrics', () => {
  it('combines validateHTML, getPageSpeedInsights, analyzeAccessibility into a result', async () => {
    // No API key — perf falls back to estimates. validator returns clean JSON.
    mockFetch(async (url: string) => {
      if (url.includes('validator.w3.org')) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      throw new Error(`unexpected fetch in test: ${url}`);
    });
    const out = await analyzePerformanceMetrics(
      'https://example.com',
      '<html><h1>Hi</h1><img src="/a" alt="a"></html>',
    );
    expect(out.coreWebVitals).toEqual({ lcp: 2500, fid: 100, cls: 0.1, score: 75 });
    expect(out.htmlValidation?.validationState).toBe('valid');
    expect(typeof out.accessibilityScore).toBe('number');
    expect(typeof out.performanceScore).toBe('number');
  });
});

describe('runParallelAnalysis', () => {
  it('runs all tasks and returns results in order', async () => {
    const tasks = [async () => 1, async () => 2, async () => 3, async () => 4, async () => 5];
    const out = await runParallelAnalysis(tasks, 2);
    expect(out).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles fewer tasks than the concurrency limit', async () => {
    const out = await runParallelAnalysis([async () => 'only'], 4);
    expect(out).toEqual(['only']);
  });
});
