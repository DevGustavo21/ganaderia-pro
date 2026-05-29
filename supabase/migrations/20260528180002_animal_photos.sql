-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 010 — Galería de fotos por animal + bucket en Storage.
--  Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Tabla animal_photos ─────────────────────────────────────
create table if not exists public.animal_photos (
  id            uuid primary key default gen_random_uuid(),
  animal_id     uuid not null references public.animals(id) on delete cascade,
  farm_id       uuid not null references public.farms(id) on delete cascade,
  storage_path  text not null,
  url           text,
  weight_kg     numeric(7, 2),
  notes         text,
  taken_at      date not null default current_date,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists animal_photos_animal_idx on public.animal_photos (animal_id, taken_at desc);
create index if not exists animal_photos_farm_idx   on public.animal_photos (farm_id);

comment on table public.animal_photos is
  'Galería cronológica de fotos de cada animal. Sirve como evidencia visual de crecimiento.';

-- ─── RLS animal_photos ───────────────────────────────────────
alter table public.animal_photos enable row level security;

drop policy if exists animal_photos_select on public.animal_photos;
create policy animal_photos_select on public.animal_photos
  for select using (
    exists (
      select 1 from public.farm_members fm
      where fm.farm_id = animal_photos.farm_id
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists animal_photos_insert on public.animal_photos;
create policy animal_photos_insert on public.animal_photos
  for insert with check (
    auth.uid() is not null
    and exists (
      select 1 from public.farm_members fm
      where fm.farm_id = animal_photos.farm_id
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists animal_photos_delete on public.animal_photos;
create policy animal_photos_delete on public.animal_photos
  for delete using (
    exists (
      select 1 from public.farm_members fm
      where fm.farm_id = animal_photos.farm_id
        and fm.user_id = auth.uid()
        and fm.role in ('owner', 'admin')
    )
  );

-- ─── Bucket en Storage ───────────────────────────────────────
-- Público: los URLs son adivinables solo si conoces el path (`<farmId>/<animalId>/<file>`).
insert into storage.buckets (id, name, public)
values ('animal-photos', 'animal-photos', true)
on conflict (id) do nothing;

-- ─── RLS Storage (storage.objects) ───────────────────────────
-- Path esperado: `<farm_id>/<animal_id>/<archivo>`
-- Solo miembros de la finca pueden escribir; cualquiera puede leer (bucket público).

drop policy if exists animal_photos_storage_select on storage.objects;
create policy animal_photos_storage_select on storage.objects
  for select using (bucket_id = 'animal-photos');

drop policy if exists animal_photos_storage_insert on storage.objects;
create policy animal_photos_storage_insert on storage.objects
  for insert with check (
    bucket_id = 'animal-photos'
    and auth.uid() is not null
    and exists (
      select 1 from public.farm_members fm
      where fm.user_id = auth.uid()
        and fm.farm_id::text = (storage.foldername(name))[1]
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
    )
  );

drop policy if exists animal_photos_storage_delete on storage.objects;
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
