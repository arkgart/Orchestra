create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  mode text not null,
  task text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists versions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  summary text,
  score jsonb,
  status text,
  cost numeric,
  created_at timestamptz not null default now()
);

create index if not exists versions_session_id_idx on versions(session_id);
