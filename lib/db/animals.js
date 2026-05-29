import { supabaseServer } from '@/lib/supabase/server';

// ─── Lectura ──────────────────────────────────────────────────────
export const listAnimalsByFarm = async (farmId, { status } = {}) => {
  const supabase = await supabaseServer();
  let q = supabase
    .from('animals')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

// Métricas resumen de una finca (calculadas a partir de los animales).
export const computeFarmMetrics = (animals = [], personnelCount = 0) => {
  const activos = animals.filter(a => a.status === 'activo');
  const isOut = (s) => ['vendido', 'muerto', 'robado', 'trasladado'].includes(s);
  return {
    total: animals.length,
    activos: activos.length,
    hembras: activos.filter(a => a.sex === 'H').length,
    machos: activos.filter(a => a.sex === 'M').length,
    pesoTotal: activos.reduce((s, a) => s + (Number(a.current_weight_kg) || 0), 0),
    salidas: animals.filter(a => isOut(a.status)).length,
    personal: personnelCount,
  };
};

// Trae conteos por finca de manera eficiente (1 sola query).
// Devuelve un objeto { farmId: { activos, total, salidas } }.
export const fetchFarmCounts = async (farmIds = []) => {
  if (!farmIds.length) return {};
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('animals')
    .select('farm_id, status, sex, current_weight_kg')
    .in('farm_id', farmIds);
  if (error) throw error;

  const out = {};
  for (const id of farmIds) out[id] = computeFarmMetrics([], 0);
  for (const row of data ?? []) {
    const m = out[row.farm_id] || computeFarmMetrics([], 0);
    if (row.status === 'activo') {
      m.activos += 1;
      if (row.sex === 'H') m.hembras += 1;
      else if (row.sex === 'M') m.machos += 1;
      m.pesoTotal += Number(row.current_weight_kg) || 0;
    }
    if (['vendido', 'muerto', 'robado', 'trasladado'].includes(row.status)) m.salidas += 1;
    m.total += 1;
    out[row.farm_id] = m;
  }
  return out;
};

export const getAnimal = async (id) => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('animals')
    .select('*, animal_events(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// ─── Mutaciones ────────────────────────────────────────────────────
// Asegura que el usuario tenga profile (FK created_by → profiles.id).
const ensureProfile = async (supabase, user) => {
  const meta = user.user_metadata || {};
  const fullName =
    meta.full_name || meta.name ||
    [meta.given_name, meta.family_name].filter(Boolean).join(' ').trim() ||
    user.email?.split('@')[0] || 'Usuario';
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, email: user.email, full_name: fullName },
      { onConflict: 'id', ignoreDuplicates: false }
    );
  if (error) throw error;
};

export const createAnimal = async (payload) => {
  const supabase = await supabaseServer();
  const { data: { user }, error: uErr } = await supabase.auth.getUser();
  if (uErr || !user) throw new Error('No autenticado');

  await ensureProfile(supabase, user);

  const { data, error } = await supabase
    .from('animals')
    .insert({ ...payload, created_by: user.id })
    .select('*')
    .single();
  if (error) throw error;

  // evento de ingreso
  await supabase.from('animal_events').insert({
    animal_id: data.id,
    farm_id: data.farm_id,
    type: 'ingreso',
    event_date: data.entry_date ?? new Date().toISOString().slice(0, 10),
    weight_kg: data.entry_weight_kg ?? null,
    description: data.entry_source ? `Ingreso por ${data.entry_type ?? 'Compra'} (${data.entry_source})` : null,
    created_by: user.id,
  });

  return data;
};

export const updateAnimal = async (id, patch) => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('animals')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

// ─── Eventos ──────────────────────────────────────────────────────
export const addWeighEvent = async ({ animalId, farmId, weightKg, reason, date }) => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('animal_events')
    .insert({
      animal_id: animalId,
      farm_id: farmId,
      type: 'pesaje',
      weight_kg: weightKg,
      weight_reason: reason,
      event_date: date ?? new Date().toISOString().slice(0, 10),
      created_by: user.id,
    })
    .select('*')
    .single();
  if (error) throw error;

  await supabase.from('animals').update({ current_weight_kg: weightKg }).eq('id', animalId);
  return data;
};

// Solo admins/owner — la RLS bloquea workers automáticamente.
export const registerExit = async ({ animalId, farmId, cause, amount, buyer, destination, date, document, description }) => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('animal_events')
    .insert({
      animal_id: animalId,
      farm_id: farmId,
      type: 'salida',
      event_date: date ?? new Date().toISOString().slice(0, 10),
      exit_cause: cause,
      exit_amount: amount,
      exit_buyer: buyer,
      exit_destination: destination,
      exit_document: document,
      description,
      created_by: user.id,
    })
    .select('*')
    .single();
  if (error) throw error;

  const statusByCause = {
    venta: 'vendido',
    muerte: 'muerto',
    robo: 'robado',
    traslado: 'trasladado',
  };
  await supabase
    .from('animals')
    .update({ status: statusByCause[cause] ?? 'vendido' })
    .eq('id', animalId);

  return data;
};
