import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseEnv } from './env';

// Cliente Supabase para Server Components, Server Actions y Route Handlers.
// Lee y escribe cookies para mantener la sesión sincronizada con SSR.
export const supabaseServer = async () => {
  assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components no pueden mutar cookies; el middleware
          // se encarga de refrescarlas. Es seguro ignorar.
        }
      },
    },
  });
};
