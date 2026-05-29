# Supabase · GanaderíaPro

Esquema de base de datos + RLS para GanaderíaPro.

## Estructura

```
supabase/
├── config.toml                                      # Config del CLI local
├── seed.sql                                         # Datos demo para `supabase db reset`
├── migrations/
│   ├── 20260526180001_init_core.sql                 # profiles, farms, members, lots, personnel
│   ├── 20260526180002_animals_events.sql            # animals, animal_events, notifications
│   ├── 20260526180003_invitations_triggers.sql      # invitaciones + triggers
│   └── 20260526180004_rls_policies.sql              # Row Level Security
└── README.md
```

## Aplicar localmente

Requiere [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# 1. Vincular el proyecto (solo la primera vez)
supabase link --project-ref <tu-project-ref>

# 2. Arrancar Supabase local
supabase start

# 3. Ejecutar migrations + seed
supabase db reset
```

## Subir a producción

```bash
supabase db push
```

## Modelo de roles (resumen)

| Acción                                          | owner | admin | worker |
|-------------------------------------------------|:-----:|:-----:|:------:|
| Ver la finca y sus datos                        | ✅    | ✅    | ✅     |
| Crear/editar animales                           | ✅    | ✅    | ✅     |
| Registrar pesaje / traslado / tratamiento       | ✅    | ✅    | ✅     |
| Registrar **salida** (venta/muerte/robo)        | ✅    | ✅    | ❌     |
| Ver/editar lotes y personal                     | ✅    | ✅    | ❌     |
| Invitar/quitar colaboradores                    | ✅    | ✅    | ❌     |
| Promover worker → admin                         | ✅    | ✅    | ❌     |
| Eliminar la finca                               | ✅    | ❌    | ❌     |
| Transferir la propiedad de la finca             | ✅    | ❌    | ❌     |

Las reglas viven en `20260526180004_rls_policies.sql` y se aplican a nivel
de Postgres con RLS, por lo que **cualquier cliente** (web, móvil, scripts)
está obligado a respetarlas.

### Cómo se asigna el rol al crear una finca

Al insertar una `farms`, el trigger `trg_farms_auto_owner` crea
automáticamente el `farm_members` con `role = 'owner'` para el `owner_id`.

### Cómo se invita a un colaborador

1. Un admin/owner inserta una fila en `farm_invitations` con `email` y
   `role` (`admin` o `worker`).
2. Se le envía el `token` por email (lógica fuera de DB).
3. El invitado autenticado llama a la función
   `accept_farm_invitation(token)` y queda agregado a `farm_members`.

### Cómo promover a un colaborador a admin

```sql
update public.farm_members
   set role = 'admin'
 where farm_id = '...'
   and user_id = '...';
```

Lo permite la policy `members_admin_update`. El índice único
`farm_members_one_owner_per_farm` impide tener dos owners.

### Cómo transferir el ownership

Se hace en transacción:

```sql
begin;
update public.farm_members set role = 'admin' where farm_id = '...' and role = 'owner';
update public.farm_members set role = 'owner' where farm_id = '...' and user_id = '<nuevo-owner>';
update public.farms set owner_id = '<nuevo-owner>' where id = '...';
commit;
```

Solo el owner actual puede hacerlo (validado por la policy
`farms_admin_update` + el índice parcial de un único owner).
