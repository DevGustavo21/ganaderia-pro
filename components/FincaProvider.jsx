'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeFarm } from '@/lib/normalize';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const STORAGE_KEY = 'gp.activeFincaId';
const EDITOR_ROLES = new Set(['owner', 'admin', 'editor', 'worker']);
const ADMIN_ROLES = new Set(['owner', 'admin']);

const FincaContext = createContext({
  finca: null,
  fincas: [],
  user: null,
  setFincaId: () => {},
  clearFinca: () => {},
  ready: false,
  role: null,
  roleLoading: false,
  canEdit: false,
  canAdmin: false,
});

export const FincaProvider = ({ initialFarms = [], user = null, children }) => {
  const fincas = useMemo(() => initialFarms.map(normalizeFarm), [initialFarms]);

  const [fincaId, setFincaIdState] = useState(null);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && fincas.some(f => f.id === saved)) {
        setFincaIdState(saved);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, [fincas]);

  const setFincaId = useCallback((id) => {
    setFincaIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const clearFinca = useCallback(() => setFincaId(null), [setFincaId]);
  const finca = fincaId ? fincas.find(f => f.id === fincaId) || null : null;

  // Carga el rol del usuario en la finca activa + Realtime para reflejar
  // cambios del administrador sin necesidad de refrescar.
  // Mientras esté en curso, `canEdit`/`canAdmin` quedan en false (fail-closed).
  useEffect(() => {
    if (!finca?.id || !user?.id || !isSupabaseConfigured()) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    let cancelled = false;
    setRoleLoading(true);
    setRole(null);
    const supabase = supabaseBrowser();

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('farm_members')
          .select('role')
          .eq('farm_id', finca.id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        setRole(data?.role || null);
      } catch (err) {
        console.error('[FincaProvider] role load error:', err);
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    };

    fetchRole();

    // Realtime: si el admin cambia mi rol o me quita de la finca,
    // se refleja inmediatamente en la UI.
    const channel = supabase
      .channel(`farm_member:${finca.id}:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farm_members',
          filter: `farm_id=eq.${finca.id}`,
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row || row.user_id !== user.id) return;
          if (payload.eventType === 'DELETE') {
            setRole(null);
          } else {
            setRole(payload.new?.role || null);
          }
        }
      )
      .subscribe();

    // Cuando la pestaña vuelve a foco, reverificamos el rol por si
    // Realtime no estaba habilitado o se perdió la suscripción.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchRole();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [finca?.id, user?.id]);

  const canEdit = !roleLoading && EDITOR_ROLES.has(role);
  const canAdmin = !roleLoading && ADMIN_ROLES.has(role);

  return (
    <FincaContext.Provider
      value={{
        finca, fincas, user,
        setFincaId, clearFinca, ready,
        role, roleLoading, canEdit, canAdmin,
      }}
    >
      {children}
    </FincaContext.Provider>
  );
};

export const useFinca = () => useContext(FincaContext);
