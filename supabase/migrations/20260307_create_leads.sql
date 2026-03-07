create table if not exists public.leads (
  id bigserial primary key,
  name text not null,
  email text not null,
  company text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

drop policy if exists "service role can insert leads" on public.leads;
create policy "service role can insert leads"
  on public.leads
  for insert
  to service_role
  with check (true);
