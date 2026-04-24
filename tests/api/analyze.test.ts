import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockAnalyzeWebsite = vi.fn();
const mockLogAnalysis = vi.fn();

vi.mock('@/lib/analysis-engine', () => ({
  analyzeWebsite: (...args: unknown[]) => mockAnalyzeWebsite(...args),
}));
vi.mock('@/lib/supabase/log-analysis', () => ({
  logAnalysisToSupabase: (...args: unknown[]) => mockLogAnalysis(...args),
}));

import { POST, OPTIONS } from '@/app/api/analyze/route';

const buildReq = ({
  body,
  origin,
  ip,
  ua,
}: {
  body?: unknown;
  origin?: string | null;
  ip?: string;
  ua?: string;
}) => {
  const headers = new Map<string, string>();
  if (origin !== null && origin !== undefined) headers.set('origin', origin);
  if (ip) headers.set('x-forwarded-for', ip);
  if (ua) headers.set('user-agent', ua);

  return {
    headers: { get: (key: string) => headers.get(key.toLowerCase()) ?? null },
    json: async () => body,
  } as unknown as Parameters<typeof POST>[0];
};

const sampleAnalysis = {
  url: 'https://example.com',
  title: 'Hi',
  overallScore: 80,
  timestamp: '2026-04-23T10:00:00.000Z',
  analysisScope: 'page',
  factors: {},
  recommendations: [],
  rawStats: {},
};

beforeEach(() => {
  mockAnalyzeWebsite.mockReset();
  mockLogAnalysis.mockReset();
});

afterEach(() => {
  // Best-effort: there's no public API to reset the in-module rate-limit map,
  // so use a unique IP per test to avoid cross-test contamination.
});

describe('POST /api/analyze — origin checks', () => {
  it('returns 403 when origin is not on the allowlist', async () => {
    const res = await POST(buildReq({ origin: 'https://evil.example.com', ip: '9.0.0.1' }));
    expect(res.status).toBe(403);
  });

  it('allows requests with no origin header (server-to-server)', async () => {
    mockAnalyzeWebsite.mockResolvedValue(sampleAnalysis);
    mockLogAnalysis.mockResolvedValue(undefined);
    const res = await POST(buildReq({ origin: null, ip: '9.0.1.1', body: { url: 'https://example.com' } }));
    expect(res.status).toBe(200);
  });

  it('allows the localhost dev origin', async () => {
    mockAnalyzeWebsite.mockResolvedValue(sampleAnalysis);
    mockLogAnalysis.mockResolvedValue(undefined);
    const res = await POST(buildReq({
      origin: 'http://localhost:3000',
      ip: '9.0.2.1',
      body: { url: 'https://example.com' },
    }));
    expect(res.status).toBe(200);
  });

  it('allows trusted Vercel preview suffixes', async () => {
    mockAnalyzeWebsite.mockResolvedValue(sampleAnalysis);
    mockLogAnalysis.mockResolvedValue(undefined);
    const res = await POST(buildReq({
      origin: 'https://my-preview-abc.vercel.app',
      ip: '9.0.3.1',
      body: { url: 'https://example.com' },
    }));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/analyze — input validation', () => {
  it('returns 400 when neither url nor textContent is provided', async () => {
    const res = await POST(buildReq({ body: {}, ip: '9.0.4.1' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/URL or text content/);
  });

  it('accepts textContent without a url and uses manual-input as the logged URL', async () => {
    mockAnalyzeWebsite.mockResolvedValue(sampleAnalysis);
    mockLogAnalysis.mockResolvedValue(undefined);
    const res = await POST(buildReq({ body: { textContent: 'plain text' }, ip: '9.0.5.1' }));
    expect(res.status).toBe(200);
    expect(mockAnalyzeWebsite).toHaveBeenCalledWith('manual-input', 'plain text');
    expect(mockLogAnalysis.mock.calls[0][0].url).toBe('manual-input');
  });
});

describe('POST /api/analyze — happy path and errors', () => {
  it('returns the analysis result and logs it', async () => {
    mockAnalyzeWebsite.mockResolvedValue(sampleAnalysis);
    mockLogAnalysis.mockResolvedValue(undefined);
    const res = await POST(buildReq({
      body: { url: 'https://example.com' },
      ip: '9.0.6.1',
      ua: 'TestUA',
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://example.com');
    expect(mockLogAnalysis).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.com',
      ip: '9.0.6.1',
      userAgent: 'TestUA',
    }));
  });

  it('returns 500 with the error message when analysis throws', async () => {
    mockAnalyzeWebsite.mockRejectedValue(new Error('crawl failed'));
    const res = await POST(buildReq({ body: { url: 'https://example.com' }, ip: '9.0.7.1' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('crawl failed');
  });
});

describe('POST /api/analyze — rate limit', () => {
  it('returns 429 after 30 requests in the same minute from the same IP', async () => {
    mockAnalyzeWebsite.mockResolvedValue(sampleAnalysis);
    mockLogAnalysis.mockResolvedValue(undefined);

    const ip = '9.0.99.1';
    for (let i = 0; i < 30; i++) {
      const res = await POST(buildReq({ body: { url: 'https://example.com' }, ip }));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(buildReq({ body: { url: 'https://example.com' }, ip }));
    expect(blocked.status).toBe(429);
  });
});

describe('OPTIONS /api/analyze', () => {
  it('returns 200 with CORS headers for an allowed origin', async () => {
    const res = await OPTIONS(buildReq({ origin: 'http://localhost:3000' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('returns 403 for a disallowed origin', async () => {
    const res = await OPTIONS(buildReq({ origin: 'https://evil.example.com' }));
    expect(res.status).toBe(403);
  });
});
