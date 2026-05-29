import { InicioPageClient } from './InicioPageClient';
import { listMyFarms } from '@/lib/db/farms';
import { fetchFarmCounts } from '@/lib/db/animals';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { supabaseServer } from '@/lib/supabase/server';
import { normalizeFarm } from '@/lib/normalize';
import { getDisplayName } from '@/lib/userDisplay';

export const metadata = { title: 'Inicio — GanaderíaPro' };
export const dynamic = 'force-dynamic';

const safe = async (label, fn, fallback) => {
  try {
    return await fn();
  } catch (err) {
    console.error(`[inicio:${label}]`, err?.message || err);
    return fallback;
  }
};

const fetchData = async () => {
  if (!isSupabaseConfigured()) {
    return { farms: [], counts: {}, recent: [], userName: '' };
  }

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { farms: [], counts: {}, recent: [], userName: '' };

  // Cada fetch va por su lado: si uno falla, los demás siguen.
  const farmsRaw = await safe('listMyFarms', () => listMyFarms(), []);
  const farms = farmsRaw.map(normalizeFarm);

  const counts = await safe(
    'fetchFarmCounts',
    () => fetchFarmCounts(farms.map(f => f.id)),
    {}
  );

  const recent = await safe(
    'recent',
    async () => {
      const { data, error } = await supabase
        .from('animal_events')
        .select('id, type, event_date, description, weight_kg, exit_cause, farm_id, animals(name, tag)')
        .order('event_date', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
    []
  );

  return { farms, counts, recent, userName: getDisplayName(user) };
};

export default async function InicioPage() {
  const data = await fetchData();
  return <InicioPageClient {...data} />;
}
