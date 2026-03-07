import { WebsiteAnalysis } from '@/types';
import { getSupabaseAdminClient } from './admin';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-grader.searchinfluence.com';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SharedReportRow = {
  id: string;
  url: string;
  analysis_data: WebsiteAnalysis;
  created_at: string;
  expires_at: string;
};

export const SHARED_REPORTS_SCHEMA_SQL = `
create extension if not exists pgcrypto;

create table if not exists public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  analysis_data jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

alter table public.shared_reports enable row level security;

drop policy if exists "anon can read shared reports" on public.shared_reports;
create policy "anon can read shared reports"
  on public.shared_reports
  for select
  to anon
  using (expires_at > now());

drop policy if exists "service role can insert shared reports" on public.shared_reports;
create policy "service role can insert shared reports"
  on public.shared_reports
  for insert
  to service_role
  with check (true);
`;

export async function createSharedReport(analysis: WebsiteAnalysis): Promise<{ id: string; shareUrl: string }> {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error('Supabase admin client is not configured.');
  }

  const shareId = crypto.randomUUID();
  const insertPayload = {
    id: shareId,
    url: analysis.url,
    analysis_data: analysis
  };

  const result = await client
    .from('shared_reports')
    .insert(insertPayload);

  if (result.error) {
    if (result.error.message.toLowerCase().includes('shared_reports') && result.error.message.toLowerCase().includes('does not exist')) {
      throw new Error('shared_reports table is missing. Run the Supabase migration to create it.');
    }
    throw new Error(result.error?.message || 'Failed to create shared report.');
  }

  return {
    id: shareId,
    shareUrl: `${SHARE_BASE_URL}/report/${shareId}`
  };
}

export async function getSharedReport(id: string): Promise<WebsiteAnalysis | null> {
  if (!UUID_PATTERN.test(id)) {
    return null;
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error('Supabase admin client is not configured.');
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await client
    .from('shared_reports')
    .select('analysis_data, expires_at')
    .eq('id', id)
    .gt('expires_at', nowIso)
    .maybeSingle<Pick<SharedReportRow, 'analysis_data' | 'expires_at'>>();

  if (error) {
    throw new Error(error.message || 'Failed to fetch shared report.');
  }

  if (!data?.analysis_data) {
    return null;
  }

  return data.analysis_data;
}
