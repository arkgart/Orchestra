-- Supabase schema for MEGAMIND ULTRA orchestration runs
create table if not exists orchestration_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  task text not null,
  mode text not null,
  status text not null default 'running',
  initial_graph jsonb,
  best_version text,
  cost_usd numeric,
  metadata jsonb
);

create table if not exists orchestration_events (
  id bigserial primary key,
  session_id uuid references orchestration_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null,
  payload jsonb
);

create index if not exists idx_events_session on orchestration_events(session_id);
