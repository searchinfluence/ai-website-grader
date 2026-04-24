import { afterEach, describe, expect, it, vi } from 'vitest';
import { crawlWebsite } from '@/lib/crawler';

const HTML_OK = `<!doctype html>
<html><head><title>OK</title><meta name="viewport" content="width=device-width"/></head>
<body><h1>Welcome</h1><p>Some body content here.</p><a href="/about">About</a></body></html>`;

const responder = (urlMatchers: Array<{ match: RegExp; respond: () => Response | Promise<Response> }>) =>
  vi.fn(async (url: unknown) => {
    const u = String(url);
    for (const { match, respond } of urlMatchers) {
      if (match.test(u)) return respond();
    }
    throw new Error(`unexpected fetch in test: ${u}`);
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('crawlWebsite', () => {
  it('fetches the HTML, parses it, and includes robotsInfo from /robots.txt', async () => {
    vi.stubGlobal(
      'fetch',
      responder([
        {
          match: /\/robots\.txt$/,
          respond: () => new Response('User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml', { status: 200 }),
        },
        {
          match: /^https:\/\/example\.com\/?$/,
          respond: () => new Response(HTML_OK, { status: 200 }),
        },
      ]),
    );

    const out = await crawlWebsite('https://example.com');

    expect(out.title).toBe('OK');
    expect(out.url).toBe('https://example.com/');
    expect(out.robotsInfo?.hasRobotsTxt).toBe(true);
    expect(out.robotsInfo?.allowsAllBots).toBe(true);
    expect(out.headings[0]).toEqual({ level: 1, text: 'Welcome' });
  });

  it('throws a "Failed to crawl website" error on non-OK HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      responder([
        {
          match: /^https:\/\/example\.com\/?$/,
          respond: () => new Response('not found', { status: 404, statusText: 'Not Found' }),
        },
      ]),
    );

    await expect(crawlWebsite('https://example.com')).rejects.toThrow(/Failed to crawl/);
  });

  it('throws when fetch itself rejects (network down)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ENOTFOUND example.com');
      }),
    );
    await expect(crawlWebsite('https://example.com')).rejects.toThrow(/Failed to crawl/);
  });

  it('returns hasRobotsTxt:false when robots.txt fetch returns 404', async () => {
    vi.stubGlobal(
      'fetch',
      responder([
        { match: /\/robots\.txt$/, respond: () => new Response('not found', { status: 404 }) },
        { match: /^https:\/\/example\.com\/?$/, respond: () => new Response(HTML_OK, { status: 200 }) },
      ]),
    );
    const out = await crawlWebsite('https://example.com');
    expect(out.robotsInfo?.hasRobotsTxt).toBe(false);
  });

  it('respects bare-hostname input by normalizing to https://', async () => {
    vi.stubGlobal(
      'fetch',
      responder([
        { match: /\/robots\.txt$/, respond: () => new Response('User-agent: *\nAllow: /', { status: 200 }) },
        { match: /^https:\/\/example\.com\/?$/, respond: () => new Response(HTML_OK, { status: 200 }) },
      ]),
    );
    const out = await crawlWebsite('example.com');
    expect(out.url).toBe('https://example.com/');
  });
});
