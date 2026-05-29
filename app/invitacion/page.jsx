import { Suspense } from 'react';
import { SignupViaInvitation } from '@/components/SignupViaInvitation';

export const metadata = {
  title: 'Invitación · GanaderíaPro',
  description: 'Únete a una finca como colaborador en GanaderíaPro.',
};

export default function InvitacionPage() {
  return (
    <Suspense fallback={null}>
      <SignupViaInvitation />
    </Suspense>
  );
}
