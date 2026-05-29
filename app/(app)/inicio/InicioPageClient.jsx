'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InicioScreen } from '@/components/InicioScreen';
import { useFinca } from '@/components/FincaProvider';
import { CreateFincaModal } from '@/components/CreateFincaModal';

export const InicioPageClient = ({ farms: farmsFromServer = [], counts = {}, recent = [], userName = '' }) => {
  const router = useRouter();
  const { finca, fincas: fincasFromCtx, setFincaId, user } = useFinca();
  const [showCreate, setShowCreate] = useState(false);

  const name = userName || user?.name || user?.email?.split('@')[0] || '';

  // Preferimos la lista del provider (la que también alimenta el selector
  // del shell). Si la página falló al traer la lista pero el layout sí, así
  // seguimos viendo nuestras fincas.
  const farms = fincasFromCtx?.length ? fincasFromCtx : farmsFromServer;

  const handleOpenFinca = (f) => {
    setFincaId(f.id);
    router.push('/inventario');
  };

  return (
    <>
      <InicioScreen
        userName={name}
        finca={finca}
        fincas={farms}
        counts={counts}
        recent={recent}
        onOpenFinca={handleOpenFinca}
        onGoTo={(tab) => router.push(`/${tab}`)}
        onCreateFinca={() => setShowCreate(true)}
      />

      {showCreate && (
        <CreateFincaModal
          onClose={() => setShowCreate(false)}
          onCreated={(farm) => {
            setShowCreate(false);
            if (farm?.id) setFincaId(farm.id);
            // Si ya hay otras fincas: ir a Inventario para empezar a operar.
            // Si era la primera: quedarse en Inicio y refrescar para que aparezca.
            if (farmsFromServer.length > 0) {
              router.refresh();
              router.push('/inventario');
            } else {
              router.refresh();
            }
          }}
        />
      )}
    </>
  );
};
