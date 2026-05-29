-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 013 — Fuerza permisos reales por rol.
--
--  lector = solo lectura.
--  editor/worker = puede crear/editar animales, eventos operativos y fotos.
--  admin/owner = editor + administración y salidas.
--
--  Importante: migration nueva porque Supabase no vuelve a ejecutar archivos
--  ya aplicados aunque se editen localmente.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_farm_editor(p_farm uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.farm_role_of(p_farm) in ('owner', 'admin', 'editor', 'worker');
$$;

comment on function public.is_farm_editor(uuid) is
  'true si el usuario actual puede escribir datos operativos en la finca. Excluye lector.';

-- ─── Animals: lectores solo SELECT ─────────────────────────────
drop policy if exists "animals_member_select" on public.animals;
drop policy if exists "animals_member_insert" on public.animals;
drop policy if exists "animals_member_update" on public.animals;
drop policy if exists "animals_admin_delete"  on public.animals;

create policy "animals_member_select"
  on public.animals for select
  using (public.is_farm_member(farm_id));

create policy "animals_member_insert"
  on public.animals for insert
  with check (
    public.is_farm_editor(farm_id)
    and created_by = auth.uid()
  );

create policy "animals_member_update"
  on public.animals for update
  using (public.is_farm_editor(farm_id))
  with check (public.is_farm_editor(farm_id));

create policy "animals_admin_delete"
  on public.animals for delete
  using (public.is_farm_admin(farm_id));

-- ─── Animal events: lectores solo SELECT ───────────────────────
drop policy if exists "events_member_select" on public.animal_events;
drop policy if exists "events_member_insert" on public.animal_events;
drop policy if exists "events_admin_delete"  on public.animal_events;

create policy "events_member_select"
  on public.animal_events for select
  using (public.is_farm_member(farm_id));

create policy "events_member_insert"
  on public.animal_events for insert
  with check (
    public.is_farm_editor(farm_id)
    and created_by = auth.uid()
    and (type <> 'salida' or public.is_farm_admin(farm_id))
  );

create policy "events_admin_delete"
  on public.animal_events for delete
  using (public.is_farm_admin(farm_id));

-- ─── Animal photos table: lectores solo SELECT ─────────────────
drop policy if exists animal_photos_select on public.animal_photos;
drop policy if exists animal_photos_insert on public.animal_photos;
drop policy if exists animal_photos_update on public.animal_photos;
drop policy if exists animal_photos_delete on public.animal_photos;

create policy animal_photos_select on public.animal_photos
  for select using (public.is_farm_member(farm_id));

create policy animal_photos_insert on public.animal_photos
  for insert with check (
    public.is_farm_editor(farm_id)
    and created_by = auth.uid()
  );

create policy animal_photos_update on public.animal_photos
  for update
  using (public.is_farm_editor(farm_id))
  with check (public.is_farm_editor(farm_id));

create policy animal_photos_delete on public.animal_photos
  for delete using (public.is_farm_admin(farm_id));

-- ─── Storage: lectores no suben/reemplazan fotos ───────────────
drop policy if exists animal_photos_storage_insert on storage.objects;
drop policy if exists animal_photos_storage_update on storage.objects;
drop policy if exists animal_photos_storage_delete on storage.objects;

create policy animal_photos_storage_insert on storage.objects
  for insert with check (
    bucket_id = 'animal-photos'
    and auth.uid() is not null
    and exists (
      select 1 from public.farm_members fm
      where fm.user_id = auth.uid()
        and fm.farm_id::text = (storage.foldername(name))[1]
        and fm.role in ('owner', 'admin', 'editor', 'worker')
    )
  );

create policy animal_photos_storage_update on storage.objects
  for update using (
    bucket_id = 'animal-photos'
    and exists (
      select 1 from public.farm_members fm
      where fm.user_id = auth.uid()
        and fm.farm_id::text = (storage.foldername(name))[1]
        and fm.role in ('owner', 'admin', 'editor', 'worker')
    )
  ) with check (
    bucket_id = 'animal-photos'
    and exists (
      select 1 from public.farm_members fm
      where fm.user_id = auth.uid()
        and fm.farm_id::text = (storage.foldername(name))[1]
        and fm.role in ('owner', 'admin', 'editor', 'worker')
    )
  );

create policy animal_photos_storage_delete on storage.objects
  for delete using (
    bucket_id = 'animal-photos'
    and exists (
      select 1 from public.farm_members fm
      where fm.user_id = auth.uid()
        and fm.farm_id::text = (storage.foldername(name))[1]
        and fm.role in ('owner', 'admin')
    )
  );
