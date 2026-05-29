-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 008 — Repara owners sin farm_members
--
--  Síntoma: Crear una finca funciona (no hay error de RLS) pero NO aparece
--  en la app porque la policy `farms_member_select` requiere
--  is_farm_member(id) = true. Eso solo es cierto si existe una fila en
--  farm_members. Si por algún motivo el trigger trg_farms_auto_owner no se
--  ejecutó, las fincas creadas quedan "invisibles" para su propio dueño.
--
--  Esta migration:
--    1) Re-instala la función `handle_new_farm` y su trigger AFTER INSERT.
--    2) Hace BACKFILL: por cada farm sin owner en farm_members, lo agrega.
--    3) Añade SELECT alternativa para que un owner SIEMPRE pueda verse su
--       propia finca, aunque por error no haya membership (defensa extra).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Re-instalar trigger
create or replace function public.handle_new_farm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.farm_members (farm_id, user_id, role, invited_by)
  values (new.id, new.owner_id, 'owner', new.owner_id)
  on conflict (farm_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

drop trigger if exists trg_farms_auto_owner on public.farms;
create trigger trg_farms_auto_owner
  after insert on public.farms
  for each row execute function public.handle_new_farm();

-- 2) Backfill: insertar owner en farm_members para fincas huérfanas
insert into public.farm_members (farm_id, user_id, role, invited_by)
select f.id, f.owner_id, 'owner', f.owner_id
from public.farms f
left join public.farm_members m
  on m.farm_id = f.id
 and m.user_id = f.owner_id
where m.farm_id is null
on conflict (farm_id, user_id) do update set role = 'owner';

-- 3) Policy adicional: el owner_id puede ver su finca sin depender de
--    farm_members. Es redundante con farms_member_select, pero blinda el
--    caso de membresía corrupta o ausente.
drop policy if exists "farms_owner_select" on public.farms;
create policy "farms_owner_select"
  on public.farms for select
  using (owner_id = auth.uid());
