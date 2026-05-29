'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinca } from '@/components/FincaProvider';
import { FincasScreen } from '@/components/SecondaryScreens';
import { CreateFincaModal } from '@/components/CreateFincaModal';
import { CollaboratorsPanel } from '@/components/CollaboratorsPanel';
import { InviteCollaboratorModal } from '@/components/InviteCollaboratorModal';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const ADMIN_ROLES = new Set(['owner', 'admin']);

export const FincasPageClient = () => {
  const router = useRouter();
  const { finca, fincas, setFincaId, user } = useFinca();

  const [counts, setCounts] = useState({});
  const [lots, setLots] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [myRoleInfo, setMyRoleInfo] = useState({ role: null, canAdminister: false });

  // Memberships del usuario en todas sus fincas (mapa farmId → role).
  const [membershipRoles, setMembershipRoles] = useState({});

  // Modal global de invitación (independiente del CollaboratorsPanel),
  // usado desde el botón del header y desde las cards. Puede preseleccionar
  // una finca o mostrar selector si se pasa null.
  const [globalInvite, setGlobalInvite] = useState(null);
  // Bump para que el CollaboratorsPanel recargue al invitar desde fuera.
  const [panelRefreshKey, setPanelRefreshKey] = useState(0);

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

  // Lotes (todos los miembros) + personal (solo admins/owner).
  const loadDetails = useCallback(async () => {
    if (!finca || !isSupabaseConfigured()) {
      setLots([]);
      setPersonnel([]);
      return;
    }
    const isAdminHere = ADMIN_ROLES.has(membershipRoles[finca.id]);
    try {
      const supabase = supabaseBrowser();
      const lotsRes = await supabase
        .from('lots').select('id, name, area_ha')
        .eq('farm_id', finca.id).order('name');
      setLots(lotsRes.data ?? []);

      if (isAdminHere) {
        const persRes = await supabase
          .from('personnel').select('id, full_name, role, phone, email')
          .eq('farm_id', finca.id).order('full_name');
        setPersonnel(persRes.data ?? []);
      } else {
        setPersonnel([]);
      }
    } catch (err) {
      console.error('Error cargando detalle de finca:', err);
    }
  }, [finca, membershipRoles]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  // Cargar mis roles en cada finca.
  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id || fincas.length === 0) {
      setMembershipRoles({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase
          .from('farm_members')
          .select('farm_id, role')
          .eq('user_id', user.id)
          .in('farm_id', fincas.map(f => f.id));
        if (error) throw error;
        if (cancelled) return;
        const map = {};
        for (const row of data ?? []) map[row.farm_id] = row.role;
        setMembershipRoles(map);
      } catch (err) {
        console.error('Error cargando memberships:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, fincas]);

  const manageableFarms = useMemo(
    () => fincas.filter(f => ADMIN_ROLES.has(membershipRoles[f.id])),
    [fincas, membershipRoles]
  );
  const manageableFarmIds = useMemo(
    () => new Set(manageableFarms.map(f => f.id)),
    [manageableFarms]
  );

  const handleInviteToFarm = (targetFarm) => {
    if (targetFarm) {
      setGlobalInvite({
        farmId: targetFarm.id,
        farmName: targetFarm.nombre,
        farms: null,
      });
    } else if (manageableFarms.length === 1) {
      const only = manageableFarms[0];
      setGlobalInvite({ farmId: only.id, farmName: only.nombre, farms: null });
    } else {
      setGlobalInvite({ farmId: null, farmName: null, farms: manageableFarms });
    }
  };

  const handleInvited = (invitation) => {
    if (invitation?.farm_id && finca?.id === invitation.farm_id) {
      setPanelRefreshKey((k) => k + 1);
    }
  };

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
        onInviteCollaborator={
          finca && myRoleInfo.canAdminister ? () => setInviteOpen(true) : null
        }
        onInviteToFarm={manageableFarms.length > 0 ? handleInviteToFarm : null}
        manageableFarmIds={manageableFarmIds}
        collaboratorsSlot={finca && manageableFarmIds.has(finca.id) ? (
          <CollaboratorsPanel
            key={`panel-${finca.id}-${panelRefreshKey}`}
            farm={finca}
            currentUserId={user?.id}
            inviteOpen={inviteOpen}
            onInviteOpenChange={setInviteOpen}
            onRoleResolved={setMyRoleInfo}
          />
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

      {globalInvite && (
        <InviteCollaboratorModal
          farmId={globalInvite.farmId}
          farmName={globalInvite.farmName}
          farms={globalInvite.farms}
          onClose={() => setGlobalInvite(null)}
          onInvited={handleInvited}
        />
      )}
    </>
  );
};
