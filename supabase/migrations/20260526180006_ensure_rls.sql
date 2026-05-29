-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 006 — "Garantía RLS"
--
--  Asegura que:
--    1) RLS está habilitado en todas las tablas relevantes.
--    2) Existe la policy crítica `farms_insert_self` (causa principal del
--       error "new row violates row-level security policy for table farms"
--       cuando la migration 004 nunca llegó a aplicarse).
--    3) Existe función auxiliar `public.uid_check()` para diagnosticar
--       desde la app que `auth.uid()` realmente coincide con el usuario.
--    4) Todos los auth.users tienen profile (backfill defensivo).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) RLS habilitado (idempotente)
alter table public.profiles         enable row level security;
alter table public.farms            enable row level security;
alter table public.farm_members     enable row level security;
alter table public.lots             enable row level security;
alter table public.personnel        enable row level security;
alter table public.animals          enable row level security;
alter table public.animal_events    enable row level security;
alter table public.notifications    enable row level security;
alter table public.farm_invitations enable row level security;

-- 2) Policy crítica para farms
drop policy if exists "farms_insert_self" on public.farms;
create policy "farms_insert_self"
  on public.farms for insert
  with check (owner_id = auth.uid());

-- También nos aseguramos de las de SELECT/UPDATE/DELETE
drop policy if exists "farms_member_select" on public.farms;
create policy "farms_member_select"
  on public.farms for select
  using (public.is_farm_member(id));

drop policy if exists "farms_admin_update" on public.farms;
create policy "farms_admin_update"
  on public.farms for update
  using (public.is_farm_admin(id))
  with check (public.is_farm_admin(id));

drop policy if exists "farms_owner_delete" on public.farms;
create policy "farms_owner_delete"
  on public.farms for delete
  using (public.is_farm_owner(id));

-- Policy de INSERT para profiles (necesaria para upsert defensivo)
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
  on public.profiles for insert
  with check (id = auth.uid());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
  on public.profiles for select
  using (id = auth.uid());

-- 3) Función helper para diagnóstico (la usa /api/diag)
create or replace function public.uid_check()
returns table (auth_uid uuid, has_profile boolean)
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid(),
         exists (select 1 from public.profiles where id = auth.uid());
$$;

grant execute on function public.uid_check() to anon, authenticated;

-- 4) Backfill defensivo de profiles
insert into public.profiles (id, email, full_name)
select
  u.id, u.email,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(u.email, '@', 1)
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
