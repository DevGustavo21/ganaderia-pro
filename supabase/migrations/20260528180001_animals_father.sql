-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 009 — Soporte para padre en animales (ya existía la madre).
--  Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.animals
  add column if not exists father_animal_id uuid references public.animals(id) on delete set null;

create index if not exists animals_mother_idx on public.animals (mother_animal_id);
create index if not exists animals_father_idx on public.animals (father_animal_id);

comment on column public.animals.mother_animal_id is 'Madre biológica (referencia al inventario). Opcional en ingresos por compra/donación/traslado.';
comment on column public.animals.father_animal_id is 'Padre biológico (referencia al inventario). Opcional en ingresos por compra/donación/traslado.';
