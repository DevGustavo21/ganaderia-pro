'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinca } from '@/components/FincaProvider';
import { FincasScreen } from '@/components/SecondaryScreens';
import { CreateFincaModal } from '@/components/CreateFincaModal';
import { CollaboratorsPanel } from '@/components/CollaboratorsPanel';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const FincasPageClient = () => {
  const router = useRouter();
  const { finca, fincas, setFincaId, user } = useFinca();

  const [counts, setCounts] = useState({});
  const [lots, setLots] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  // Cargar conteos por finca.
  useEffect(() => {
    if (!isSupabaseConfigured() || fincas.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase
          .from('animals')
          .select('farm_id, status, sex')
          .in('farm_id', fincas.map(f => f.id));
        if (error) throw error;
        if (cancelled) return;
        const map = {};
        fincas.forEach(f => { map[f.id] = { activos: 0, hembras: 0, machos: 0, total: 0 }; });
        for (const row of data ?? []) {
          const m = map[row.farm_id];
          if (!m) continue;
          m.total += 1;
          if (row.status === 'activo') {
            m.activos += 1;
            if (row.sex === 'H') m.hembras += 1;
            else if (row.sex === 'M') m.machos += 1;
          }
        }
        setCounts(map);
      } catch (err) {
        console.error('Error cargando conteos:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [fincas]);

  // Lotes + personal de la finca activa.
  const loadDetails = useCallback(async () => {
    if (!finca || !isSupabaseConfigured()) {
      setLots([]);
      setPersonnel([]);
      return;
    }
    try {
      const supabase = supabaseBrowser();
      const [lotsRes, persRes] = await Promise.all([
        supabase.from('lots').select('id, name, area_ha').eq('farm_id', finca.id).order('name'),
        supabase.from('personnel').select('id, full_name, role, phone, email').eq('farm_id', finca.id).order('full_name'),
      ]);
      setLots(lotsRes.data ?? []);
      setPersonnel(persRes.data ?? []);
    } catch (err) {
      console.error('Error cargando detalle de finca:', err);
    }
  }, [finca]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  return (
    <>
      <FincasScreen
        finca={finca}
        fincas={fincas}
        counts={counts}
        lots={lots}
        personnel={personnel}
        onSwitchFinca={(f) => setFincaId(f.id)}
        onOpenFinca={(f) => {
          setFincaId(f.id);
          router.push('/inventario');
        }}
        onCreateFinca={() => setShowCreate(true)}
        collaboratorsSlot={finca ? (
          <CollaboratorsPanel farm={finca} currentUserId={user?.id} />
        ) : null}
      />

      {showCreate && (
        <CreateFincaModal
          onClose={() => setShowCreate(false)}
          onCreated={(farm) => {
            setShowCreate(false);
            setFincaId(farm.id);
            router.refresh();
          }}
        />
      )}
    </>
  );
};
