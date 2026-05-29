'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseEnv } from './env';

// Cliente Supabase para el navegador (componentes 'use client').
// Se memoriza para evitar crear múltiples instancias.
let _client = null;

export const supabaseBrowser = () => {
  if (_client) return _client;
  assertSupabaseEnv();
  _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
};
