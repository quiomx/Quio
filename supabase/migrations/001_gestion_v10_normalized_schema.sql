-- Gestión Quio V10 · esquema normalizado compatible.
-- No elimina workspace_states: la aplicación puede seguir sincronizando el payload V9/V10.
begin;

create extension if not exists pgcrypto;

create table if not exists public.gestion_v10_state_backups (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  payload jsonb not null,
  source_revision bigint not null,
  backed_up_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  name text not null,
  business_name text,
  phone text,
  email text,
  status text not null default 'Prospecto',
  source text,
  preferred_contact text,
  last_contact date,
  next_followup date,
  notes text,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id)
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  primary_client_legacy_id text,
  name text not null,
  industry text,
  phone text,
  email text,
  maps_url text,
  website_url text,
  status text,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id)
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  client_legacy_id text,
  project_legacy_id text,
  due_date date,
  reason text,
  channel text,
  status text,
  result text,
  notes text,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  client_legacy_id text,
  business_legacy_id text,
  review_date date,
  iqpd numeric,
  level text,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id)
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  folio text not null,
  client_legacy_id text,
  business_legacy_id text,
  package_legacy_id text,
  status text not null,
  valid_until date,
  total numeric not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id),
  unique(workspace_id,folio)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  client_legacy_id text,
  business_legacy_id text,
  quote_legacy_id text,
  package_legacy_id text,
  name text not null,
  status text not null,
  start_date date,
  due_date date,
  progress integer not null default 0 check(progress between 0 and 100),
  next_step text,
  checklist jsonb not null default '[]'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id)
);

create table if not exists public.financial_movements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  idempotency_key text,
  movement_type text not null check(movement_type in ('Ingreso','Gasto')),
  client_legacy_id text,
  project_legacy_id text,
  quote_legacy_id text,
  category text,
  concept text not null,
  amount numeric not null check(amount >= 0),
  paid_amount numeric not null default 0 check(paid_amount >= 0),
  status text not null check(status in ('Pendiente','Parcial','Pagado','Cancelado')),
  movement_date date not null,
  due_date date,
  payment_method text,
  reference text,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id),
  unique(workspace_id,idempotency_key)
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  name text not null,
  price numeric not null default 0,
  estimated_hours numeric not null default 0,
  contents jsonb not null default '[]'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,legacy_id)
);

create table if not exists public.gestion_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_log_v10 (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text not null,
  client_legacy_id text,
  project_legacy_id text,
  entity text,
  record_legacy_id text,
  action text not null,
  detail text,
  happened_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  unique(workspace_id,legacy_id)
);

create index if not exists clients_workspace_status_idx on public.clients(workspace_id,status);
create index if not exists followups_workspace_due_idx on public.followups(workspace_id,due_date,status);
create index if not exists quotes_workspace_status_idx on public.quotes(workspace_id,status);
create index if not exists projects_workspace_status_due_idx on public.projects(workspace_id,status,due_date);
create index if not exists financial_movements_workspace_date_idx on public.financial_movements(workspace_id,movement_date);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'gestion_v10_state_backups','clients','businesses','followups','reviews','quotes',
    'projects','financial_movements','packages','gestion_settings','activity_log_v10'
  ] loop
    execute format('alter table public.%I enable row level security',table_name);
    execute format('drop policy if exists "gestion members read" on public.%I',table_name);
    execute format('create policy "gestion members read" on public.%I for select to authenticated using (public.is_quio_member(workspace_id))',table_name);
    execute format('drop policy if exists "gestion members write" on public.%I',table_name);
    execute format('create policy "gestion members write" on public.%I for all to authenticated using (public.is_quio_member(workspace_id)) with check (public.is_quio_member(workspace_id))',table_name);
    execute format('grant select,insert,update,delete on public.%I to authenticated',table_name);
  end loop;
end $$;

commit;
