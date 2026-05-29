-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 012 — Colaboradores: RLS por rol (editor/lector),
--  invitaciones por link (email nullable) y RPC pública get_invitation_info.
--  Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper: editor o superior (NO lector) ───────────────────
create or replace function public.is_farm_editor(p_farm uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.farm_role_of(p_farm) in ('owner', 'admin', 'editor', 'worker');
$$;

comment on function public.is_farm_editor(uuid) is
  'true si el usuario actual pertenece a la finca con rol con permiso de edición. Excluye `lector` y a quien no es miembro.';

-- ─── Policies: animals (insert/update solo editores) ─────────
drop policy if exists "animals_member_insert" on public.animals;
create policy "animals_member_insert"
  on public.animals for insert
  with check (public.is_farm_editor(farm_id) and created_by = auth.uid());

drop policy if exists "animals_member_update" on public.animals;
create policy "animals_member_update"
  on public.animals for update
  using (public.is_farm_editor(farm_id))
  with check (public.is_farm_editor(farm_id));

-- ─── Policies: animal_events (insert: editores; salidas: admins) ─
drop policy if exists "events_member_insert" on public.animal_events;
create policy "events_member_insert"
  on public.animal_events for insert
  with check (
    public.is_farm_editor(farm_id)
    and created_by = auth.uid()
    and (type <> 'salida' or public.is_farm_admin(farm_id))
  );

-- ─── Policies: animal_photos (insert: editores) ──────────────
drop policy if exists animal_photos_insert on public.animal_photos;
create policy animal_photos_insert on public.animal_photos
  for insert with check (
    auth.uid() is not null
    and public.is_farm_editor(animal_photos.farm_id)
  );

-- ─── Storage RLS: solo editores escriben en el bucket ────────
drop policy if exists animal_photos_storage_insert on storage.objects;
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

drop policy if exists animal_photos_storage_update on storage.objects;
create policy animal_photos_storage_update on storage.objects
  for update using (
    bucket_id = 'animal-photos'
    and exists (
      select 1 from public.farm_members fm
      where fm.user_id = auth.uid()
        and fm.farm_id::text = (storage.foldername(name))[1]
        and fm.role in ('owner', 'admin', 'editor', 'worker')
    )
  );

-- ─── Invitaciones: email opcional (link abierto) ─────────────
alter table public.farm_invitations alter column email drop not null;

comment on column public.farm_invitations.email is
  'Email opcional del invitado. Si es null, la invitación es por link abierto y cualquier usuario autenticado puede aceptarla.';

-- ─── RPC pública: leer datos de invitación por token (sin auth) ─
create or replace function public.get_invitation_info(invitation_token text)
returns table(
  email      text,
  role       public.farm_role,
  farm_id    uuid,
  farm_name  text,
  status     public.invitation_status,
  expires_at timestamptz,
  message    text
)
language sql
security definer
set search_path = public
as $$
  select
    i.email,
    i.role,
    i.farm_id,
    f.name as farm_name,
    i.status,
    i.expires_at,
    i.message
  from public.farm_invitations i
  join public.farms f on f.id = i.farm_id
  where i.token = invitation_token;
$$;

grant execute on function public.get_invitation_info(text) to anon, authenticated;

-- ─── Reemplaza accept_farm_invitation: ahora soporta email null ─
create or replace function public.accept_farm_invitation(invitation_token text)
returns public.farm_members
language plpgsql
security definer
set search_path = public
as $$
declare
  invite        public.farm_invitations;
  member        public.farm_members;
  current_email text;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para aceptar una invitación.';
  end if;

  select * into invite
  from public.farm_invitations
  where token = invitation_token
    and status = 'pending'
    and expires_at > now();

  if not found then
    raise exception 'Invitación inválida o expirada.';
  end if;

  if invite.email is not null then
    select email into current_email
    from public.profiles where id = auth.uid();
    if lower(invite.email) <> lower(coalesce(current_email, '')) then
      raise exception 'Esta invitación es para otro correo electrónico.';
    end if;
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

grant execute on function public.accept_farm_invitation(text) to authenticated;
