-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 005 — Backfill de profiles + policies de INSERT/UPSERT
--
--  Motivo:
--    El trigger `handle_new_user` crea automáticamente public.profiles cuando
--    se inserta una fila en auth.users. Pero si el usuario ya existía antes
--    de aplicar las migrations (o el trigger se cayó por algún motivo), su
--    profile no existe y la FK farms.owner_id → profiles.id falla al crear
--    una finca, lo cual a veces se reporta como "row-level security policy
--    violation".
--
--    Esta migration:
--      1. Crea el profile para todos los auth.users que no tengan uno.
--      2. Agrega policy de INSERT en profiles para self (defensa adicional
--         si en algún flujo el trigger no se ejecuta).
--      3. Re-instala el trigger handle_new_user por si quedó desincronizado.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Backfill: crea profiles para usuarios huérfanos
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(u.email, '@', 1)
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2) Policy de INSERT para self (idempotente: drop primero por si ya existe)
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
  on public.profiles for insert
  with check (id = auth.uid());

-- 3) Re-instalar el trigger handle_new_user de forma idempotente.
--    (No modificamos la función — la dejamos como la dejó 003 — solo nos
--    aseguramos de que el trigger esté instalado.)
drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
