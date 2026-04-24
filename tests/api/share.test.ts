import { afterEach, describe, expect, it, vi } from 'vitest';

const mockCreate = vi.fn();
const mockGet = vi.fn();

vi.mock('@/lib/supabase/shared-reports', () => ({
  createSharedReport: (...args: unknown[]) => mockCreate(...args),
  getSharedReport: (...args: unknown[]) => mockGet(...args),
}));

import { POST, GET } from '@/app/api/share/route';

const postReq = (body: unknown, origin = 'https://app.example.com') =>
  ({
    json: async () => body,
    nextUrl: { origin } as URL,
  }) as unknown as Parameters<typeof POST>[0];

const getReq = (id: string | null) =>
  ({
    nextUrl: { searchParams: new URLSearchParams(id ? `id=${id}` : '') } as URL,
  }) as unknown as Parameters<typeof GET>[0];

afterEach(() => {
  mockCreate.mockReset();
  mockGet.mockReset();
});

const validAnalysis = {
  url: 'https://example.com',
  timestamp: '2026-04-23T10:00:00Z',
  overallScore: 80,
};

describe('POST /api/share', () => {
  it('returns 400 when payload is missing url or timestamp', async () => {
    const res = await POST(postReq({ analysis: { url: 'https://x' } }));
    expect(res.status).toBe(400);
  });

  it('accepts payload under analysis or analysisData key', async () => {
    mockCreate.mockResolvedValue({ id: 'abc', shareUrl: 'https://app.example.com/report/abc' });

    const res1 = await POST(postReq({ analysis: validAnalysis }));
    expect(res1.status).toBe(200);

    const res2 = await POST(postReq({ analysisData: validAnalysis }));
    expect(res2.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('passes nextUrl.origin as the base URL', async () => {
    mockCreate.mockResolvedValue({ id: 'abc', shareUrl: 'x' });
    await POST(postReq({ analysis: validAnalysis }, 'https://custom.example.com'));
    expect(mockCreate).toHaveBeenCalledWith(validAnalysis, 'https://custom.example.com');
  });

  it('returns 500 with error message when createSharedReport throws', async () => {
    mockCreate.mockRejectedValue(new Error('boom'));
    const res = await POST(postReq({ analysis: validAnalysis }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('boom');
  });
});

describe('GET /api/share', () => {
  it('returns 400 when id is missing', async () => {
    const res = await GET(getReq(null));
    expect(res.status).toBe(400);
  });

  it('returns 404 when no report is found', async () => {
    mockGet.mockResolvedValue(null);
    const res = await GET(getReq('11111111-2222-4333-8444-555555555555'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with the report when found', async () => {
    mockGet.mockResolvedValue(validAnalysis);
    const res = await GET(getReq('11111111-2222-4333-8444-555555555555'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.report.url).toBe('https://example.com');
  });

  it('returns 500 when getSharedReport throws', async () => {
    mockGet.mockRejectedValue(new Error('db down'));
    const res = await GET(getReq('11111111-2222-4333-8444-555555555555'));
    expect(res.status).toBe(500);
  });
});
