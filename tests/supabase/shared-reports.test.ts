import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebsiteAnalysis } from '@/types';

const mockGetClient = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => mockGetClient(),
}));

import { createSharedReport, getSharedReport } from '@/lib/supabase/shared-reports';

afterEach(() => {
  mockGetClient.mockReset();
});

const sampleAnalysis = (): WebsiteAnalysis => ({
  url: 'https://example.com',
  title: 'Hello',
  overallScore: 80,
  timestamp: '2026-04-23T10:00:00.000Z',
  analysisScope: 'page',
  factors: {
    contentStructure: { key: 'contentStructure', label: 'Content Structure', weight: 0.35, score: 80, status: 'good', findings: [], recommendations: [], stats: {} },
    structuredData: { key: 'structuredData', label: 'Structured Data', weight: 0.25, score: 70, status: 'good', findings: [], recommendations: [], stats: {} },
    technicalHealth: { key: 'technicalHealth', label: 'Technical Health', weight: 0.20, score: 85, status: 'excellent', findings: [], recommendations: [], stats: {} },
    pageSEO: { key: 'pageSEO', label: 'Page SEO', weight: 0.20, score: 80, status: 'good', findings: [], recommendations: [], stats: {} },
  },
  recommendations: [],
  rawStats: {},
  contentImprovements: [],
});

describe('createSharedReport', () => {
  it('throws when supabase is not configured', async () => {
    mockGetClient.mockReturnValue(null);
    await expect(createSharedReport(sampleAnalysis())).rejects.toThrow(/not configured/);
  });

  it('inserts the analysis and returns a share URL with the generated id', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    mockGetClient.mockReturnValue({ from });

    const out = await createSharedReport(sampleAnalysis(), 'https://app.example.com/');

    expect(from).toHaveBeenCalledWith('shared_reports');
    expect(insert).toHaveBeenCalledOnce();
    const payload = insert.mock.calls[0][0];
    expect(typeof payload.id).toBe('string');
    expect(payload.url).toBe('https://example.com');
    expect(payload.analysis_data.overallScore).toBe(80);
    expect(out.shareUrl).toBe(`https://app.example.com/report/${out.id}`);
  });

  it('translates "shared_reports does not exist" errors into a clear migration hint', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { message: 'relation "shared_reports" does not exist' },
    });
    mockGetClient.mockReturnValue({ from: () => ({ insert }) });
    await expect(createSharedReport(sampleAnalysis())).rejects.toThrow(/Run the Supabase migration/);
  });

  it('rethrows other supabase errors with their message', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'permission denied' } });
    mockGetClient.mockReturnValue({ from: () => ({ insert }) });
    await expect(createSharedReport(sampleAnalysis())).rejects.toThrow(/permission denied/);
  });

  it('strips trailing slashes from the base URL', async () => {
    mockGetClient.mockReturnValue({
      from: () => ({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    });
    const out = await createSharedReport(sampleAnalysis(), 'https://app.example.com////');
    expect(out.shareUrl.startsWith('https://app.example.com/report/')).toBe(true);
  });
});

describe('getSharedReport', () => {
  it('returns null without hitting supabase for invalid UUIDs', async () => {
    const out = await getSharedReport('not-a-uuid');
    expect(out).toBeNull();
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it('throws when supabase is not configured', async () => {
    mockGetClient.mockReturnValue(null);
    await expect(getSharedReport('11111111-2222-4333-8444-555555555555')).rejects.toThrow(/not configured/);
  });

  it('returns the normalized analysis when a row is found', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { analysis_data: sampleAnalysis(), expires_at: '2099-01-01T00:00:00Z' },
      error: null,
    });
    mockGetClient.mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ gt: () => ({ maybeSingle }) }) }),
      }),
    });

    const out = await getSharedReport('11111111-2222-4333-8444-555555555555');
    expect(out?.url).toBe('https://example.com');
    expect(out?.overallScore).toBe(80);
  });

  it('returns null when no row is found', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    mockGetClient.mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ gt: () => ({ maybeSingle }) }) }),
      }),
    });
    const out = await getSharedReport('11111111-2222-4333-8444-555555555555');
    expect(out).toBeNull();
  });

  it('throws when supabase returns an error', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'db down' } });
    mockGetClient.mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ gt: () => ({ maybeSingle }) }) }),
      }),
    });
    await expect(getSharedReport('11111111-2222-4333-8444-555555555555')).rejects.toThrow(/db down/);
  });
});
