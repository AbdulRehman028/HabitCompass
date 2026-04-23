create table if not exists public.tracker_progress (
  id uuid primary key default gen_random_uuid(),
  client_id text unique not null,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists tracker_progress_updated_at_idx
  on public.tracker_progress (updated_at desc);
