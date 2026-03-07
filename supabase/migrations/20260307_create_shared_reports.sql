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
