-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 001 — Esquema base (perfiles, fincas, miembros, lotes, personal)
--  Idempotente: se puede correr varias veces sin error.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── PROFILES ────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  phone        text,
  avatar_url   text,
  plan         text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table  public.profiles is 'Perfil público del usuario, enlazado 1:1 a auth.users.';
comment on column public.profiles.plan is 'Plan de suscripción del usuario.';

-- ─── FARMS ───────────────────────────────────────────────────
create table if not exists public.farms (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete restrict,
  name        text not null,
  location    text,
  hectares    numeric(10, 2),
  purpose     text check (purpose in ('Leche', 'Carne', 'Doble propósito', 'Reproducción', 'Otro')),
  color       text not null default '#2D6A4F',
  icon        text not null default 'leaf',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists farms_owner_idx on public.farms (owner_id);

comment on table  public.farms is 'Fincas administradas. Cada finca tiene un único owner (admin con privilegios totales).';
comment on column public.farms.owner_id is 'Dueño actual de la finca. Único usuario con permiso para eliminar/transferir.';

-- ─── FARM MEMBERS ────────────────────────────────────────────
do $$ begin
  create type public.farm_role as enum ('owner', 'admin', 'worker');
exception when duplicate_object then null;
end $$;

create table if not exists public.farm_members (
  farm_id     uuid not null references public.farms(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        public.farm_role not null default 'worker',
  invited_by  uuid references public.profiles(id) on delete set null,
  joined_at   timestamptz not null default now(),
  primary key (farm_id, user_id)
);

create index        if not exists farm_members_user_idx              on public.farm_members (user_id);
create unique index if not exists farm_members_one_owner_per_farm    on public.farm_members (farm_id) where role = 'owner';

comment on table  public.farm_members is 'Membresía de usuarios en fincas. Define el rol del usuario en cada finca.';
comment on column public.farm_members.role is 'owner | admin | worker. Solo puede existir un owner por finca.';

-- ─── LOTS ────────────────────────────────────────────────────
create table if not exists public.lots (
  id          uuid primary key default gen_random_uuid(),
  farm_id     uuid not null references public.farms(id) on delete cascade,
  name        text not null,
  area_ha     numeric(8, 2),
  color       text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (farm_id, name)
);

create index if not exists lots_farm_idx on public.lots (farm_id);

comment on table public.lots is 'Lotes/potreros de cada finca. Independientes entre fincas.';

-- ─── PERSONNEL ───────────────────────────────────────────────
create table if not exists public.personnel (
  id          uuid primary key default gen_random_uuid(),
  farm_id     uuid not null references public.farms(id) on delete cascade,
  full_name   text not null,
  role        text,
  phone       text,
  email       text,
  notes       text,
  linked_user uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists personnel_farm_idx on public.personnel (farm_id);

comment on table  public.personnel is 'Personal de cada finca. Puede o no estar vinculado a un usuario con acceso a la app.';
comment on column public.personnel.linked_user is 'Si se le invitó a la app, este campo apunta al profile correspondiente.';
