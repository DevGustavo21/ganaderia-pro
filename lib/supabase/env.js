// Helpers para leer las variables de entorno de Supabase con validación
// y para saber, en tiempo de ejecución, si el proyecto está configurado.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR-PROJECT-REF'));

export const assertSupabaseEnv = () => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Crea un archivo .env.local a partir de .env.example.'
    );
  }
};
