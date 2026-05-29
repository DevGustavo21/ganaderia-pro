import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// Endpoint de retorno para OAuth (Google) y magic links.
// Supabase manda al usuario aquí con ?code=... → intercambiamos por sesión.
export const GET = async (request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/inicio`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
};
