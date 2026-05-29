import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env';

// Rutas que requieren sesión. Si no hay usuario → redirige a /login.
const PROTECTED_PREFIXES = ['/inicio', '/inventario', '/fincas', '/perfil'];

// Si el usuario ya está autenticado y entra a /login, lo mandamos a /inicio.
const AUTH_PAGES = ['/login'];

export const updateSession = async (request) => {
  let response = NextResponse.next({ request });

  // Si todavía no hay credenciales configuradas, solo pasamos la request.
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/inicio';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  return response;
};
