import { WebsiteAnalysis } from '@/types';
import { getSupabaseAdminClient } from './admin';

export async function logAnalysisToSupabase(params: {
  analysis: WebsiteAnalysis;
  url: string;
  ip: string;
  userAgent: string;
}): Promise<void> {
  const client = getSupabaseAdminClient();
  if (!client) return;

  const { analysis, url, ip, userAgent } = params;

  const payload = {
    url,
    analyzed_at: analysis.timestamp || new Date().toISOString(),
    overall_score: analysis.overallScore,
    factor_scores: Object.fromEntries(
      Object.entries(analysis.factors).map(([key, factor]) => [
        key,
        {
          score: factor.score,
          status: factor.status,
          weight: factor.weight
        }
      ])
    ),
    recommendations: analysis.recommendations,
    raw_stats: analysis.rawStats,
    ip,
    user_agent: userAgent
  };

  const { error } = await client.from('analyses').insert(payload);
  if (error) {
    console.error('Supabase analysis logging failed:', error.message);
  }
}
