-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 003 — Invitaciones + triggers (auto-owner, updated_at, profile)
--  Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── INVITATIONS ─────────────────────────────────────────────
do $$ begin
  create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');
exception when duplicate_object then null;
end $$;

create table if not exists public.farm_invitations (
  id          uuid primary key default gen_random_uuid(),
  farm_id     uuid not null references public.farms(id) on delete cascade,
  email       text not null,
  role        public.farm_role not null default 'worker' check (role <> 'owner'),
  invited_by  uuid not null references public.profiles(id) on delete cascade,
  token       text not null unique default encode(gen_random_bytes(24), 'hex'),
  status      public.invitation_status not null default 'pending',
  message     text,
  expires_at  timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists farm_invitations_farm_idx  on public.farm_invitations (farm_id, status);
create index if not exists farm_invitations_email_idx on public.farm_invitations (email,   status);

comment on table  public.farm_invitations is 'Invitaciones por email para que otros usuarios se unan a una finca.';
comment on column public.farm_invitations.role is 'Rol con el que entrará el invitado (no puede ser owner).';

-- ─── TRIGGER: updated_at ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at  on public.profiles;
drop trigger if exists trg_farms_updated_at     on public.farms;
drop trigger if exists trg_lots_updated_at      on public.lots;
drop trigger if exists trg_personnel_updated_at on public.personnel;
drop trigger if exists trg_animals_updated_at   on public.animals;

create trigger trg_profiles_updated_at  before update on public.profiles  for each row execute function public.set_updated_at();
create trigger trg_farms_updated_at     before update on public.farms     for each row execute function public.set_updated_at();
create trigger trg_lots_updated_at      before update on public.lots      for each row execute function public.set_updated_at();
create trigger trg_personnel_updated_at before update on public.personnel for each row execute function public.set_updated_at();
create trigger trg_animals_updated_at   before update on public.animals   for each row execute function public.set_updated_at();

-- ─── TRIGGER: al crear una finca, el owner_id se marca como owner ────────────
create or replace function public.handle_new_farm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.farm_members (farm_id, user_id, role, invited_by)
  values (new.id, new.owner_id, 'owner', new.owner_id)
  on conflict (farm_id, user_id) do update
    set role = 'owner';
  return new;
end;
$$;

drop trigger if exists trg_farms_auto_owner on public.farms;
create trigger trg_farms_auto_owner
  after insert on public.farms
  for each row execute function public.handle_new_farm();

-- ─── TRIGGER: al crearse un auth.users → crear su profile ────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── FUNCIÓN: aceptar invitación ─────────────────────────────────────────────
create or replace function public.accept_farm_invitation(invitation_token text)
returns public.farm_members
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.farm_invitations;
  member public.farm_members;
begin
  select * into invite
  from public.farm_invitations
  where token = invitation_token
    and status = 'pending'
    and expires_at > now();

  if not found then
    raise exception 'Invitación inválida o expirada.';
  end if;

  if lower(invite.email) <> lower((select email from public.profiles where id = auth.uid())) then
    raise exception 'Esta invitación es para otro correo electrónico.';
  end if;

  insert into public.farm_members (farm_id, user_id, role, invited_by)
  values (invite.farm_id, auth.uid(), invite.role, invite.invited_by)
  on conflict (farm_id, user_id) do update set role = excluded.role
  returning * into member;

  update public.farm_invitations
     set status = 'accepted', accepted_at = now()
   where id = invite.id;

  return member;
end;
$$;
