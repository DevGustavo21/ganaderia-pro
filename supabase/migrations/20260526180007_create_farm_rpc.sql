-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · 007 — RPC segura para crear fincas
--
--  Motivo:
--    Algunos entornos de Supabase/PostgREST pueden seguir devolviendo 42501
--    al hacer INSERT directo en public.farms desde el cliente aunque la policy
--    exista, especialmente si el contexto auth.uid() no queda disponible como
--    esperamos dentro de la request.
--
--    Esta función mueve la operación a una RPC SECURITY DEFINER:
--      - valida que exista auth.uid()
--      - garantiza public.profiles para ese usuario
--      - inserta la finca con owner_id = auth.uid()
--      - el trigger trg_farms_auto_owner crea farm_members(owner)
--
--    La función NO acepta owner_id desde el cliente, así que el usuario no
--    puede crear fincas a nombre de otra persona.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.create_farm_for_current_user(
  p_name text,
  p_location text default null,
  p_hectares numeric default null,
  p_purpose text default null,
  p_color text default '#2D6A4F',
  p_icon text default 'leaf'
)
returns public.farms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := coalesce(auth.jwt() ->> 'email', '');
  v_full_name text := coalesce(
    auth.jwt() -> 'user_metadata' ->> 'full_name',
    auth.jwt() -> 'user_metadata' ->> 'name',
    split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1),
    'Usuario'
  );
  v_farm public.farms;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'El nombre de la finca es obligatorio';
  end if;

  insert into public.profiles (id, email, full_name)
  values (v_user_id, v_email, v_full_name)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();

  insert into public.farms (
    owner_id,
    name,
    location,
    hectares,
    purpose,
    color,
    icon
  )
  values (
    v_user_id,
    trim(p_name),
    nullif(trim(coalesce(p_location, '')), ''),
    p_hectares,
    nullif(trim(coalesce(p_purpose, '')), ''),
    coalesce(nullif(trim(p_color), ''), '#2D6A4F'),
    coalesce(nullif(trim(p_icon), ''), 'leaf')
  )
  returning * into v_farm;

  return v_farm;
end;
$$;

grant execute on function public.create_farm_for_current_user(
  text, text, numeric, text, text, text
) to authenticated;
