-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 011 — Extiende farm_role con 'editor' y 'lector'.
--  Idempotente. DEBE correr en su propia transacción antes de usar los valores
--  en otras migraciones (Postgres 12+ permite ADD VALUE IF NOT EXISTS dentro
--  de una transacción siempre que no se use el valor en la misma).
-- ─────────────────────────────────────────────────────────────────────────────

alter type public.farm_role add value if not exists 'editor';
alter type public.farm_role add value if not exists 'lector';

comment on type public.farm_role is
  'owner = propietario (admin total) · admin = administrador (legacy, mismos permisos que owner salvo borrar finca) · editor = puede crear/editar animales y eventos · lector = solo lectura · worker = legacy alias de editor.';
