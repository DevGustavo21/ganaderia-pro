import { AppLayout } from '@/components/AppLayout';
import { supabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { listMyFarms } from '@/lib/db/farms';
import { toDisplayUser } from '@/lib/userDisplay';

const fetchInitial = async () => {
  if (!isSupabaseConfigured()) return { farms: [], user: null };
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { farms: [], user: null };
    const farms = await listMyFarms();
    return { farms, user: toDisplayUser(user) };
  } catch {
    return { farms: [], user: null };
  }
};

export default async function AuthedLayout({ children }) {
  const { farms, user } = await fetchInitial();
  return (
    <AppLayout initialFarms={farms} authUser={user}>
      {children}
    </AppLayout>
  );
}
