import { Suspense } from 'react';
import { LoginScreen } from '@/components/LoginScreen';

export const metadata = {
  title: 'Iniciar sesión — GanaderíaPro',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
