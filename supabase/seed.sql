-- ─────────────────────────────────────────────────────────────────────────────
--  GanaderíaPro · seed local (solo para `supabase db reset`)
--
--  Crea un usuario demo, 3 fincas, lotes, personal y algunos animales.
--  Útil para arrancar el entorno local sin tener que registrarse manualmente.
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  demo_user uuid;
  esp_id    uuid;
  pal_id    uuid;
  ros_id    uuid;
begin
  -- ─── Usuario demo (carlos@hacienda-esperanza.co)
  demo_user := '00000000-0000-0000-0000-000000000001';

  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  values (
    demo_user,
    '00000000-0000-0000-0000-000000000000',
    'carlos@hacienda-esperanza.co',
    crypt('demo1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carlos Ramírez"}'::jsonb,
    'authenticated',
    'authenticated'
  )
  on conflict (id) do nothing;

  -- profile lo crea el trigger handle_new_user; lo actualizamos para fijar plan
  update public.profiles
     set full_name = 'Carlos Ramírez',
         plan = 'pro',
         phone = '+57 320 555 0001'
   where id = demo_user;

  -- ─── Fincas
  insert into public.farms (id, owner_id, name, location, hectares, purpose, color)
  values
    (gen_random_uuid(), demo_user, 'Hacienda La Esperanza', 'Casanare', 248, 'Doble propósito', '#2D6A4F'),
    (gen_random_uuid(), demo_user, 'Finca El Palmar',       'Meta',      92, 'Carne',           '#52B788'),
    (gen_random_uuid(), demo_user, 'Finca Los Rosales',     'Casanare', 156, 'Leche',           '#F4A261')
  returning id into esp_id;

  select id into esp_id from public.farms where name = 'Hacienda La Esperanza' and owner_id = demo_user;
  select id into pal_id from public.farms where name = 'Finca El Palmar'       and owner_id = demo_user;
  select id into ros_id from public.farms where name = 'Finca Los Rosales'     and owner_id = demo_user;

  -- ─── Lotes
  insert into public.lots (farm_id, name) values
    (esp_id, 'Potrero Norte'), (esp_id, 'Potrero Sur'),
    (esp_id, 'Cerca del río'), (esp_id, 'Maternidad'),
    (pal_id, 'Potrero Alto'), (pal_id, 'Potrero Bajo'), (pal_id, 'Bebedero'),
    (ros_id, 'Ordeño A'), (ros_id, 'Ordeño B'), (ros_id, 'Maternidad');

  -- ─── Personal
  insert into public.personnel (farm_id, full_name, role, phone) values
    (esp_id, 'Luis Méndez',    'Capataz',     '+57 320 555 1100'),
    (esp_id, 'Ana Rojas',      'Veterinaria', '+57 311 555 1101'),
    (esp_id, 'Jorge Pinilla',  'Vaquero',     '+57 312 555 1102'),
    (pal_id, 'María Torres',   'Capataza',    '+57 313 555 2200'),
    (pal_id, 'Diego Cárdenas', 'Vaquero',     '+57 314 555 2201'),
    (ros_id, 'Sofía Herrera',  'Encargada',   '+57 315 555 3300'),
    (ros_id, 'Pedro Galvis',   'Ordeñador',   '+57 316 555 3301'),
    (ros_id, 'Camilo Suárez',  'Vaquero',     '+57 317 555 3302');

  -- ─── Algunos animales (resumen)
  insert into public.animals (farm_id, tag, name, sex, breed, category, purpose, status, birth_date, current_weight_kg, created_by) values
    (esp_id, 'CO-0421', 'Margarita', 'H', 'Holstein', 'Vaca productora',  'Leche',       'activo',  '2022-01-01', 478, demo_user),
    (esp_id, 'CO-0518', 'Tormenta',  'M', 'Brahman',  'Toro reproductor', 'Reproductor', 'activo',  '2020-06-01', 712, demo_user),
    (pal_id, 'PA-1122', 'Bonito',    'M', 'Angus',    'Novillo de ceba',  'Carne',       'activo',  '2024-04-01', 385, demo_user),
    (ros_id, 'RO-0237', 'Luna',      'H', 'Holstein', 'Vaca productora',  'Leche',       'vendido', '2020-01-01', 510, demo_user);
end $$;
