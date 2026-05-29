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
  const { finca } = useFinca();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const canRegister =
    !!finca && (pathname === '/inventario' || pathname?.startsWith('/inventario'));

  const handleSubmitAnimal = async (data) => {
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

      {wizardOpen && finca && (
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
