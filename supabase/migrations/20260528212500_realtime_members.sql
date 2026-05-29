-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 014 — Realtime para cambios de membresía.
--
--  Activa la publicación de cambios en `farm_members` para que el cliente
--  reciba en tiempo real las actualizaciones de rol del usuario actual.
-- ─────────────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'farm_members'
  ) then
    execute 'alter publication supabase_realtime add table public.farm_members';
  end if;
end $$;
