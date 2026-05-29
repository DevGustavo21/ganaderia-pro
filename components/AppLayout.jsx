'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from './AppShell';
import { FincaProvider, useFinca } from './FincaProvider';
import { RegisterWizard } from './RegisterWizard';
import { registerAnimalAction } from '@/app/actions/animals';

export const AppLayout = ({ initialFarms = [], authUser = null, children }) => (
  <FincaProvider initialFarms={initialFarms} user={authUser}>
    <AppShellWithActions>{children}</AppShellWithActions>
  </FincaProvider>
);

const AppShellWithActions = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { finca, canEdit } = useFinca();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const canRegister =
    !!finca
    && canEdit
    && (pathname === '/inventario' || pathname?.startsWith('/inventario'));

  const handleSubmitAnimal = async (data) => {
    if (!canEdit) {
      alert('Tu rol es de lector. No tienes permiso para registrar animales.');
      return;
    }
    setSaving(true);
    try {
      const res = await registerAnimalAction({ fincaId: finca.id, data });
      if (!res.ok) {
        alert(res.error || 'No se pudo registrar el animal.');
        return;
      }
      setWizardOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppShell
        onPrimaryAction={canRegister ? () => setWizardOpen(true) : undefined}
      >
        {children}
      </AppShell>

      {wizardOpen && finca && canEdit && (
        <RegisterWizard
          finca={finca}
          saving={saving}
          onClose={() => !saving && setWizardOpen(false)}
          onSubmit={handleSubmitAnimal}
        />
      )}
    </>
  );
};
