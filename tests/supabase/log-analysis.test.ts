import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebsiteAnalysis } from '@/types';

const mockGetClient = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => mockGetClient(),
}));

import { logAnalysisToSupabase } from '@/lib/supabase/log-analysis';

afterEach(() => {
  mockGetClient.mockReset();
});

const sampleAnalysis = (): WebsiteAnalysis => ({
  url: 'https://example.com',
  title: 'Hello',
  overallScore: 72,
  timestamp: '2026-04-23T10:00:00.000Z',
  analysisScope: 'page',
  factors: {
    contentStructure: { key: 'contentStructure', label: 'Content Structure', weight: 0.35, score: 70, status: 'good', findings: [], recommendations: [], stats: {} },
    structuredData: { key: 'structuredData', label: 'Structured Data', weight: 0.25, score: 60, status: 'needs-improvement', findings: [], recommendations: [], stats: {} },
    technicalHealth: { key: 'technicalHealth', label: 'Technical Health', weight: 0.20, score: 80, status: 'good', findings: [], recommendations: [], stats: {} },
    pageSEO: { key: 'pageSEO', label: 'Page SEO', weight: 0.20, score: 75, status: 'good', findings: [], recommendations: [], stats: {} },
  },
  recommendations: [{ text: 'Do the thing', priority: 'high', category: 'general' }],
  rawStats: { generatedAt: '2026-04-23T10:00:00.000Z', factorCount: 4, factorStats: [] },
  contentImprovements: [],
});

describe('logAnalysisToSupabase', () => {
  it('returns silently when supabase is not configured', async () => {
    mockGetClient.mockReturnValue(null);
    await expect(
      logAnalysisToSupabase({ analysis: sampleAnalysis(), url: 'https://x', ip: '1.2.3.4', userAgent: 'UA' }),
    ).resolves.toBeUndefined();
  });

  it('inserts a payload mirroring factor scores and metadata', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    mockGetClient.mockReturnValue({ from });

    await logAnalysisToSupabase({
      analysis: sampleAnalysis(),
      url: 'https://example.com',
      ip: '127.0.0.1',
      userAgent: 'Mozilla',
    });

    expect(from).toHaveBeenCalledWith('analyses');
    const payload = insert.mock.calls[0][0];
    expect(payload.url).toBe('https://example.com');
    expect(payload.overall_score).toBe(72);
    expect(payload.factor_scores.contentStructure).toEqual({ score: 70, status: 'good', weight: 0.35 });
    expect(payload.recommendations).toHaveLength(1);
    expect(payload.ip).toBe('127.0.0.1');
    expect(payload.user_agent).toBe('Mozilla');
  });

  it('does not throw when supabase returns an error (non-blocking)', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'oops' } });
    mockGetClient.mockReturnValue({ from: () => ({ insert }) });

    await expect(
      logAnalysisToSupabase({ analysis: sampleAnalysis(), url: 'x', ip: 'x', userAgent: 'x' }),
    ).resolves.toBeUndefined();
  });

  it('substitutes "now" when analysis.timestamp is missing', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockGetClient.mockReturnValue({ from: () => ({ insert }) });

    const analysis = sampleAnalysis();
    analysis.timestamp = '';
    await logAnalysisToSupabase({ analysis, url: 'x', ip: 'x', userAgent: 'x' });
    const payload = insert.mock.calls[0][0];
    expect(typeof payload.analyzed_at).toBe('string');
    expect(payload.analyzed_at.length).toBeGreaterThan(0);
  });
});
