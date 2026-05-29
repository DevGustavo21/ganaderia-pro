# GanaderíaPro

Plataforma web responsive de gestión ganadera multi-finca construida con
**Next.js 15 (App Router)** y **React 19**, con backend en **Supabase**
(Postgres + Auth + RLS).

## Estructura

```
.
├── app/
│   ├── layout.jsx                  # Layout raíz + fuente Inter
│   ├── globals.css                 # Tokens CSS + utilidades responsive
│   ├── page.jsx                    # Redirige a /login
│   ├── not-found.jsx               # 404
│   ├── login/page.jsx              # Pantalla de login
│   └── (app)/                      # Grupo de rutas autenticadas
│       ├── layout.jsx              # Provee FincaContext + AppShell
│       ├── inicio/                 # Dashboard global
│       ├── inventario/             # Inventario de la finca activa
│       ├── fincas/                 # Listado y detalle de fincas
│       └── perfil/                 # Perfil del usuario
├── components/
│   ├── AppLayout.jsx               # Wrapper cliente: FincaProvider + AppShell
│   ├── AppShell.jsx                # Sidebar desktop / bottom nav mobile
│   ├── FincaProvider.jsx           # Contexto de finca activa (localStorage)
│   ├── EmptyFincaState.jsx         # Empty state cuando no hay finca activa
│   ├── InicioScreen.jsx            # Dashboard global con módulos de fincas
│   ├── InventoryScreen.jsx         # Lista/grid de animales filtrada por finca
│   ├── SecondaryScreens.jsx        # FincasScreen + PerfilScreen
│   ├── LoginScreen.jsx             # Login responsive split-screen
│   ├── RegisterWizard.jsx          # Wizard de 3 pasos para registrar animal
│   ├── AnimalDetail.jsx            # Modal de detalle con timeline
│   ├── ExitForm.jsx                # Formulario de salida
│   ├── Modal.jsx                   # Dialog centrado desktop / sheet mobile
│   ├── Icon.jsx                    # Set de íconos SVG inline
│   └── ui.jsx                      # Primitivas (Button, Input, Pill…)
├── lib/
│   ├── theme.js                    # Tokens de diseño
│   └── data.js                     # Seed data (en memoria, mientras integramos Supabase)
├── supabase/
│   ├── config.toml                 # Config del CLI local
│   ├── seed.sql                    # Datos demo
│   ├── migrations/                 # SQL versionado
│   └── README.md                   # Modelo de roles, helpers, etc.
├── _legacy/                        # Prototipo original
├── next.config.mjs
├── jsconfig.json
└── package.json
```

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000  → redirige a /login
npm run build
npm run start
```

## Conectar Supabase

### 1) Crear el proyecto

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. Anota:
   - **Project URL** (`Project Settings → API`)
   - **anon public key**

### 2) Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

Reinicia `npm run dev` para que tome las nuevas variables.

> Sin estas variables la app sigue funcionando en **modo demo**: el login
> ignora las credenciales y entra directo a `/inicio` con los datos seed
> de `lib/data.js`. Útil para iterar UI antes de tener backend.

### 3) Aplicar las migrations

Con el [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <tu-ref>
supabase db push          # sube migrations a producción
# o, en local:
supabase start
supabase db reset         # corre migrations + seed.sql
```

### 4) Auth (correo + Google)

#### Email / contraseña
Ya viene activo. Crear cuenta desde `/login → "Crear cuenta"`.

#### Google OAuth (paso a paso)

**Parte A — Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):

1. Crea (o selecciona) un proyecto.
2. `APIs & Services → OAuth consent screen`
   - User type: **External**
   - Llena nombre, email de soporte y email del desarrollador. Guarda.
   - (Mientras esté en modo "Testing", agrega tu correo en **Test users**).
3. `APIs & Services → Credentials → Create credentials → OAuth client ID`
   - Application type: **Web application**
   - Name: `GanaderíaPro Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://<tu-ref>.supabase.co`
     - (Producción) `https://tudominio.com`
   - **Authorized redirect URIs**:
     - `https://<tu-ref>.supabase.co/auth/v1/callback` *(este es el oficial de Supabase, no el de tu app)*
   - Copia el `Client ID` y `Client Secret`.

**Parte B — Supabase Dashboard**:

1. `Authentication → Providers → Google` → activa el toggle.
2. Pega `Client ID` y `Client Secret`. Guarda.
3. `Authentication → URL Configuration`
   - **Site URL**: `http://localhost:3000` (o tu dominio).
   - **Redirect URLs**: agrega
     - `http://localhost:3000/auth/callback`
     - `https://tudominio.com/auth/callback` (producción)

**Parte C — App**:

Ya está cableado en `app/auth/callback/route.js`. El botón **"Continuar con Google"** en `/login` dispara el flujo correctamente.

### 5) Cómo funciona internamente

| Archivo                              | Responsabilidad                                       |
|--------------------------------------|-------------------------------------------------------|
| `lib/supabase/env.js`                | Lee/valida `NEXT_PUBLIC_SUPABASE_*`                   |
| `lib/supabase/client.js`             | `supabaseBrowser()` — para componentes `'use client'` |
| `lib/supabase/server.js`             | `supabaseServer()` — RSC, Server Actions, route handlers |
| `lib/supabase/middleware.js`         | Refresca la sesión vía cookies + protege rutas        |
| `middleware.js`                      | Punto de entrada del middleware de Next               |
| `app/auth/callback/route.js`         | Callback de OAuth (Google) y magic links              |
| `app/auth/actions.js`                | Server Action `signOut`                               |
| `app/actions/farms.js`               | Server Actions: crear finca, invitar, cambiar rol     |
| `app/actions/animals.js`             | Server Actions: registrar animal, pesaje, salida      |
| `lib/db/farms.js`, `lib/db/animals.js` | Helpers de consulta (server-side, respetan RLS)     |
| `lib/normalize.js`                   | Mapeo BD (en_snake) ↔ UI (es_camel)                   |
| `components/FincaProvider.jsx`       | Contexto cliente con fincas reales + finca activa     |
| `components/CreateFincaModal.jsx`    | Modal para crear una finca                            |

Cuando hay sesión:
- Visitar `/login` redirige a `/inicio`.
- Visitar `/inicio`, `/inventario`, `/fincas`, `/perfil` sin sesión redirige
  a `/login?next=<ruta-original>`.
- El layout autenticado (`app/(app)/layout.jsx`) precarga las fincas del
  usuario y las inyecta en `FincaProvider`. Cada pantalla luego hace fetch
  de los datos específicos (animales, lotes, personal) cuando cambia la
  finca activa.

## Rutas

| Ruta              | Descripción                                          |
|-------------------|------------------------------------------------------|
| `/`               | Redirige a `/login`                                  |
| `/login`          | Pantalla de inicio de sesión                         |
| `/inicio`         | Dashboard global con módulos por finca               |
| `/inventario`     | Inventario de la finca activa (filtrado por `fincaId`)|
| `/fincas`         | Listado y administración de fincas                   |
| `/perfil`         | Perfil del usuario                                   |

Después del login el usuario aterriza en `/inicio` **sin ninguna finca
seleccionada**. Desde ahí elige a cuál finca entrar (módulo o selector en la
top bar) y eso activa el contexto para el resto de la app.

## Modelo multi-finca

Un usuario administra **múltiples fincas**. Cada finca tiene **animales,
personal y lotes independientes** identificados por `farm_id`. El contexto
de la finca activa vive en `FincaProvider` (cliente) y se persiste en
`localStorage` (`gp.activeFincaId`).

- Selector en la top bar → cambia la finca activa.
- Opción **"Vista global"** → limpia la finca activa y vuelve a `/inicio`.
- `/inventario` muestra un empty state si no hay finca activa.

## Modelo de roles (Supabase)

| Acción                                          | owner | admin | worker |
|-------------------------------------------------|:-----:|:-----:|:------:|
| Ver la finca y sus datos                        |  ✅   |  ✅   |   ✅   |
| Crear/editar animales                           |  ✅   |  ✅   |   ✅   |
| Registrar pesaje / traslado / tratamiento       |  ✅   |  ✅   |   ✅   |
| Registrar **salida** (venta/muerte/robo)        |  ✅   |  ✅   |   ❌   |
| Ver/editar lotes y personal                     |  ✅   |  ✅   |   ❌   |
| Invitar/quitar colaboradores                    |  ✅   |  ✅   |   ❌   |
| Promover `worker → admin`                       |  ✅   |  ✅   |   ❌   |
| Eliminar la finca                               |  ✅   |  ❌   |   ❌   |
| Transferir la propiedad de la finca             |  ✅   |  ❌   |   ❌   |

Detalle completo y SQL en [`supabase/README.md`](./supabase/README.md).

## Responsive

Breakpoints clave (`globals.css`):

- `< 600px`  → mobile (1 col, bottom nav fijo, FAB para registrar)
- `600-1023` → tablet (grid 2 col, métricas 4 col)
- `≥ 1024px` → desktop (sidebar fijo, top bar, contenido con `max-width:
  1280px`, sin bottom nav)
- `≥ 1280px` → wide (grid de inventario a 3 columnas)

## Diseño

- **Paleta Verde Campo** (`lib/theme.js`): verdes (`#2D6A4F`, `#1B4332`,
  `#D8F3DC`), tierra (`#A47148`), ámbar (`#F4A261`), rojo (`#E76F51`).
- Tipografía **Inter** vía `next/font/google`.
