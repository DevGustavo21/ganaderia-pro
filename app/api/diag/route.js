import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET /api/diag       — solo lectura (auth + profile + listar fincas)
// GET /api/diag?try=1 — intenta crear una finca de prueba y la borra
//
// Solo desarrollo. Eliminar antes de producción.
export const GET = async (request) => {
  const url = new URL(request.url);
  const tryInsert = url.searchParams.get('try') === '1';

  try {
    const supabase = await supabaseServer();

    // 1) ¿quién soy según getUser()?
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({
        ok: false, step: 'auth',
        error: userErr?.message || 'No autenticado',
        hint: 'No hay sesión en el server. ¿Cookies bloqueadas? ¿Cerraste sesión?',
      });
    }

    // 2) ¿qué ve la BD como auth.uid()?
    const { data: uidRows, error: uidErr } = await supabase.rpc('uid_check');

    // 3) ¿existe mi profile?
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, plan')
      .eq('id', user.id)
      .maybeSingle();

    // 4) ¿puedo listar fincas?
    const { data: farms, error: farmsErr } = await supabase
      .from('farms')
      .select('id, name, owner_id')
      .order('created_at', { ascending: true });

    // 4b) ¿de cuáles soy miembro?
    const { data: memberships, error: memErr } = await supabase
      .from('farm_members')
      .select('farm_id, role')
      .eq('user_id', user.id);

    const report = {
      ok: true,
      user: { id: user.id, email: user.email, provider: user.app_metadata?.provider },
      uidRpc: { data: uidRows, error: uidErr?.message || null },
      profile: { exists: !!profile, data: profile, error: profErr?.message || null },
      farms: { count: farms?.length ?? 0, sample: farms?.slice(0, 3) ?? [], error: farmsErr?.message || null },
      memberships: { count: memberships?.length ?? 0, data: memberships ?? [], error: memErr?.message || null },
    };

    // Diagnóstico del problema más común:
    const dbUid = uidRows?.[0]?.auth_uid || null;
    if (dbUid && dbUid !== user.id) {
      report.warning = `auth.uid() en la BD (${dbUid}) NO coincide con user.id (${user.id}). Cierra sesión y vuelve a entrar.`;
    } else if (!dbUid) {
      report.warning = 'auth.uid() es NULL en la BD. La cookie de Supabase no está llegando — revisa que el middleware esté activo y vuelve a iniciar sesión.';
    }

    // 5) Insert de prueba opcional
    if (tryInsert) {
      const probe = {
        owner_id: user.id,
        name: `__diag__ ${new Date().toISOString()}`,
        location: 'Diag',
        hectares: 1,
        purpose: 'Otro',
        color: '#2D6A4F',
        icon: 'leaf',
      };
      const { data: inserted, error: insErr } = await supabase
        .from('farms')
        .insert(probe)
        .select('id, name, owner_id')
        .single();

      if (insErr) {
        report.tryInsert = {
          ok: false,
          code: insErr.code,
          message: insErr.message,
          details: insErr.details,
          hint:
            insErr.code === '42501'
              ? 'RLS bloqueó el INSERT. La policy farms_insert_self exige owner_id = auth.uid(). Verifica el warning de arriba.'
              : 'Postgres rechazó el INSERT por otra razón.',
        };
      } else {
        // Limpieza: borra la finca de prueba.
        await supabase.from('farms').delete().eq('id', inserted.id);
        report.tryInsert = { ok: true, inserted, cleaned: true };
      }
    }

    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
};
