-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 002 — Animales y eventos (pesajes, ingresos, salidas, etc.)
--  Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Types ───────────────────────────────────────────────────
do $$ begin
  create type public.animal_sex as enum ('H', 'M');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.animal_status as enum ('activo', 'vendido', 'muerto', 'robado', 'trasladado');
exception when duplicate_object then null;
end $$;

-- ─── ANIMALS ─────────────────────────────────────────────────
create table if not exists public.animals (
  id                  uuid primary key default gen_random_uuid(),
  farm_id             uuid not null references public.farms(id) on delete cascade,
  tag                 text not null,
  name                text,
  sex                 public.animal_sex not null,
  breed               text,
  category            text,
  purpose             text,
  status              public.animal_status not null default 'activo',
  birth_date          date,
  current_weight_kg   numeric(7, 2),
  current_lot_id      uuid references public.lots(id) on delete set null,
  color_notes         text,
  photo_url           text,
  mother_animal_id    uuid references public.animals(id) on delete set null,

  entry_type          text check (entry_type in ('Nacimiento', 'Compra', 'Donación', 'Traslado')),
  entry_date          date,
  entry_weight_kg     numeric(7, 2),
  entry_price         numeric(12, 2),
  entry_source        text,
  entry_document      text,

  notes               text,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (farm_id, tag)
);

create index if not exists animals_farm_idx        on public.animals (farm_id);
create index if not exists animals_status_idx      on public.animals (farm_id, status);
create index if not exists animals_current_lot_idx on public.animals (current_lot_id);

comment on table  public.animals is 'Animales pertenecientes a una finca. Cada arete es único dentro de la finca.';
comment on column public.animals.tag    is 'Arete identificador (único por finca).';
comment on column public.animals.status is 'Estado vital/comercial actual del animal.';

-- ─── ANIMAL EVENTS ───────────────────────────────────────────
do $$ begin
  create type public.event_type as enum (
    'ingreso', 'pesaje', 'traslado', 'tratamiento', 'parto', 'nota', 'salida'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.exit_cause as enum ('venta', 'muerte', 'robo', 'traslado');
exception when duplicate_object then null;
end $$;

create table if not exists public.animal_events (
  id            uuid primary key default gen_random_uuid(),
  animal_id     uuid not null references public.animals(id) on delete cascade,
  farm_id       uuid not null references public.farms(id) on delete cascade,
  type          public.event_type not null,
  event_date    date not null default current_date,

  weight_kg     numeric(7, 2),
  weight_reason text,

  from_lot_id   uuid references public.lots(id) on delete set null,
  to_lot_id     uuid references public.lots(id) on delete set null,

  treatment        text,
  treatment_dose   text,

  exit_cause       public.exit_cause,
  exit_amount      numeric(12, 2),
  exit_buyer       text,
  exit_destination text,
  exit_document    text,

  description   text,
  metadata      jsonb not null default '{}'::jsonb,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists animal_events_animal_idx on public.animal_events (animal_id, event_date desc);
create index if not exists animal_events_farm_idx   on public.animal_events (farm_id,   event_date desc);
create index if not exists animal_events_type_idx   on public.animal_events (farm_id, type);

comment on table  public.animal_events is 'Historial cronológico de todos los movimientos/eventos de un animal.';

-- ─── NOTIFICATIONS ───────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  farm_id     uuid references public.farms(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  action_url  text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, read_at);

comment on table public.notifications is 'Notificaciones in-app dirigidas a un usuario.';
