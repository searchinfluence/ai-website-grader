create extension if not exists pgcrypto;

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  analyzed_at timestamptz not null default now(),
  overall_score int not null,
  factor_scores jsonb not null,
  recommendations jsonb not null,
  raw_stats jsonb not null,
  ip text,
  user_agent text
);

alter table public.analyses enable row level security;

create policy "anon can read analyses"
  on public.analyses
  for select
  to anon
  using (true);

create policy "service role can insert analyses"
  on public.analyses
  for insert
  to service_role
  with check (true);
