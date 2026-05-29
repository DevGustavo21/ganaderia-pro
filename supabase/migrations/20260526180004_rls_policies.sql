-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 004 — Row Level Security (owner / admin / worker)
--  Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helpers (security definer) ──────────────────────────────
create or replace function public.is_farm_member(p_farm uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.farm_members where farm_id = p_farm and user_id = auth.uid());
$$;

create or replace function public.farm_role_of(p_farm uuid)
returns public.farm_role
language sql stable security definer set search_path = public
as $$
  select role from public.farm_members where farm_id = p_farm and user_id = auth.uid();
$$;

create or replace function public.is_farm_admin(p_farm uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.farm_role_of(p_farm) in ('owner', 'admin');
$$;

create or replace function public.is_farm_owner(p_farm uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.farm_role_of(p_farm) = 'owner';
$$;

-- ─── Activar RLS (idempotente: no error si ya está activo) ───
alter table public.profiles         enable row level security;
alter table public.farms            enable row level security;
alter table public.farm_members     enable row level security;
alter table public.lots             enable row level security;
alter table public.personnel        enable row level security;
alter table public.animals          enable row level security;
alter table public.animal_events    enable row level security;
alter table public.notifications    enable row level security;
alter table public.farm_invitations enable row level security;

-- ─── PROFILES ────────────────────────────────────────────────
drop policy if exists "profiles_self_read"    on public.profiles;
drop policy if exists "profiles_member_read"  on public.profiles;
drop policy if exists "profiles_self_update"  on public.profiles;

create policy "profiles_self_read"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_member_read"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.farm_members fm_self
      join public.farm_members fm_other on fm_self.farm_id = fm_other.farm_id
      where fm_self.user_id = auth.uid()
        and fm_other.user_id = profiles.id
    )
  );

create policy "profiles_self_update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─── FARMS ───────────────────────────────────────────────────
drop policy if exists "farms_insert_self"   on public.farms;
drop policy if exists "farms_member_select" on public.farms;
drop policy if exists "farms_admin_update"  on public.farms;
drop policy if exists "farms_owner_delete"  on public.farms;

create policy "farms_insert_self"
  on public.farms for insert
  with check (owner_id = auth.uid());

create policy "farms_member_select"
  on public.farms for select
  using (public.is_farm_member(id));

create policy "farms_admin_update"
  on public.farms for update
  using (public.is_farm_admin(id))
  with check (public.is_farm_admin(id));

create policy "farms_owner_delete"
  on public.farms for delete
  using (public.is_farm_owner(id));

-- ─── FARM MEMBERS ────────────────────────────────────────────
drop policy if exists "members_member_select" on public.farm_members;
drop policy if exists "members_admin_insert"  on public.farm_members;
drop policy if exists "members_admin_update"  on public.farm_members;
drop policy if exists "members_admin_delete"  on public.farm_members;
drop policy if exists "members_self_leave"    on public.farm_members;

create policy "members_member_select"
  on public.farm_members for select
  using (public.is_farm_member(farm_id));

create policy "members_admin_insert"
  on public.farm_members for insert
  with check (public.is_farm_admin(farm_id));

create policy "members_admin_update"
  on public.farm_members for update
  using (public.is_farm_admin(farm_id))
  with check (public.is_farm_admin(farm_id));

create policy "members_admin_delete"
  on public.farm_members for delete
  using (public.is_farm_admin(farm_id) and role <> 'owner');

create policy "members_self_leave"
  on public.farm_members for delete
  using (user_id = auth.uid() and role <> 'owner');

-- ─── LOTS ────────────────────────────────────────────────────
drop policy if exists "lots_member_select" on public.lots;
drop policy if exists "lots_admin_write"   on public.lots;

create policy "lots_member_select"
  on public.lots for select
  using (public.is_farm_member(farm_id));

create policy "lots_admin_write"
  on public.lots for all
  using (public.is_farm_admin(farm_id))
  with check (public.is_farm_admin(farm_id));

-- ─── PERSONNEL ───────────────────────────────────────────────
drop policy if exists "personnel_member_select" on public.personnel;
drop policy if exists "personnel_admin_write"   on public.personnel;

create policy "personnel_member_select"
  on public.personnel for select
  using (public.is_farm_member(farm_id));

create policy "personnel_admin_write"
  on public.personnel for all
  using (public.is_farm_admin(farm_id))
  with check (public.is_farm_admin(farm_id));

-- ─── ANIMALS ─────────────────────────────────────────────────
drop policy if exists "animals_member_select" on public.animals;
drop policy if exists "animals_member_insert" on public.animals;
drop policy if exists "animals_member_update" on public.animals;
drop policy if exists "animals_admin_delete"  on public.animals;

create policy "animals_member_select"
  on public.animals for select
  using (public.is_farm_member(farm_id));

create policy "animals_member_insert"
  on public.animals for insert
  with check (public.is_farm_member(farm_id) and created_by = auth.uid());

create policy "animals_member_update"
  on public.animals for update
  using (public.is_farm_member(farm_id))
  with check (public.is_farm_member(farm_id));

create policy "animals_admin_delete"
  on public.animals for delete
  using (public.is_farm_admin(farm_id));

-- ─── ANIMAL EVENTS ───────────────────────────────────────────
drop policy if exists "events_member_select" on public.animal_events;
drop policy if exists "events_member_insert" on public.animal_events;
drop policy if exists "events_admin_delete"  on public.animal_events;

create policy "events_member_select"
  on public.animal_events for select
  using (public.is_farm_member(farm_id));

create policy "events_member_insert"
  on public.animal_events for insert
  with check (
    public.is_farm_member(farm_id)
    and created_by = auth.uid()
    and (type <> 'salida' or public.is_farm_admin(farm_id))
  );

create policy "events_admin_delete"
  on public.animal_events for delete
  using (public.is_farm_admin(farm_id));

-- ─── NOTIFICATIONS ───────────────────────────────────────────
drop policy if exists "notifications_self_select" on public.notifications;
drop policy if exists "notifications_self_update" on public.notifications;
drop policy if exists "notifications_self_delete" on public.notifications;

create policy "notifications_self_select"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_self_update"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_self_delete"
  on public.notifications for delete
  using (user_id = auth.uid());

-- ─── INVITATIONS ─────────────────────────────────────────────
drop policy if exists "invitations_admin_select"   on public.farm_invitations;
drop policy if exists "invitations_invitee_select" on public.farm_invitations;
drop policy if exists "invitations_admin_insert"   on public.farm_invitations;
drop policy if exists "invitations_admin_update"   on public.farm_invitations;
drop policy if exists "invitations_admin_delete"   on public.farm_invitations;

create policy "invitations_admin_select"
  on public.farm_invitations for select
  using (public.is_farm_admin(farm_id));

create policy "invitations_invitee_select"
  on public.farm_invitations for select
  using (
    lower(email) = lower(
      (select email from public.profiles where id = auth.uid())
    )
  );

create policy "invitations_admin_insert"
  on public.farm_invitations for insert
  with check (
    public.is_farm_admin(farm_id)
    and invited_by = auth.uid()
    and role <> 'owner'
  );

create policy "invitations_admin_update"
  on public.farm_invitations for update
  using (public.is_farm_admin(farm_id))
  with check (public.is_farm_admin(farm_id));

create policy "invitations_admin_delete"
  on public.farm_invitations for delete
  using (public.is_farm_admin(farm_id));
