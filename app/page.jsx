import { redirect } from 'next/navigation';

export default function HomePage() {
  // En el futuro: si hay sesión activa → '/inicio'; si no → '/login'.
  redirect('/login');
}
