'use client';

import { useRouter } from 'next/navigation';
import { useFinca } from '@/components/FincaProvider';
import { PerfilScreen } from '@/components/SecondaryScreens';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const PerfilPageClient = () => {
  const router = useRouter();
  const { clearFinca, fincas, user } = useFinca();

  const handleLogout = async () => {
    clearFinca();
    if (isSupabaseConfigured()) {
      try {
        await supabaseBrowser().auth.signOut();
      } catch {
        // ignore — limpiamos sesión local de todas formas
      }
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <PerfilScreen
      user={user}
      fincasCount={fincas.length}
      onLogout={handleLogout}
    />
  );
};
