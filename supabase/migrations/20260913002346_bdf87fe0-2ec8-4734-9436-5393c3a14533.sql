create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid references public.projects(id) on delete cascade,
  chat_id uuid references public.chats(id) on delete cascade,
  goal text not null,
  mode text not null default 'general',
  tier text not null default 'balanced',
  status text not null default 'queued',
  iterations int not null default 0,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  label text not null,
  files jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.installed_extensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  extension_id text not null,
  is_enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, extension_id)
);
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid references public.projects(id) on delete cascade,
  kind text not null,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  permissions jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.custom_tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  command text not null,
  permissions jsonb not null default '{}'::jsonb,
  ai_invokable boolean not null default true,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.agent_tasks to authenticated;
grant select, insert, update, delete on public.snapshots to authenticated;
grant select, insert, update, delete on public.installed_extensions to authenticated;
grant select, insert, update, delete on public.integrations to authenticated;
grant select, insert, update, delete on public.custom_tools to authenticated;
grant all on public.agent_tasks to service_role;
grant all on public.snapshots to service_role;
grant all on public.installed_extensions to service_role;
grant all on public.integrations to service_role;
grant all on public.custom_tools to service_role;

alter table public.agent_tasks enable row level security;
alter table public.snapshots enable row level security;
alter table public.installed_extensions enable row level security;
alter table public.integrations enable row level security;
alter table public.custom_tools enable row level security;

do $$
declare t text;
begin
  foreach t in array array['agent_tasks','snapshots','installed_extensions','integrations','custom_tools'] loop
    execute format('create policy "own_select_%1$s" on public.%1$I for select to authenticated using (auth.uid() = user_id)', t);
    execute format('create policy "own_insert_%1$s" on public.%1$I for insert to authenticated with check (auth.uid() = user_id)', t);
    execute format('create policy "own_update_%1$s" on public.%1$I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "own_delete_%1$s" on public.%1$I for delete to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;