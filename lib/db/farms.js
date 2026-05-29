import { supabaseServer } from '@/lib/supabase/server';

// ─── Lectura ──────────────────────────────────────────────────────
// RLS ya garantiza que solo veo las fincas a las que pertenezco.
export const listMyFarms = async () => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('farms')
    .select('id, name, location, hectares, purpose, color, icon, owner_id, created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// Devuelve la lista de lotes (nombres) de una finca.
export const listFarmLots = async (farmId) => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('lots')
    .select('id, name, area_ha')
    .eq('farm_id', farmId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// Personal de la finca.
export const listFarmPersonnel = async (farmId) => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('personnel')
    .select('id, full_name, role, phone, email')
    .eq('farm_id', farmId)
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const getFarm = async (id) => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// ─── Mutaciones ────────────────────────────────────────────────────
export const createFarm = async ({ name, location, hectares, purpose, color, icon }) => {
  const supabase = await supabaseServer();
  const { data: { user }, error: uErr } = await supabase.auth.getUser();
  if (uErr || !user) throw new Error('No autenticado');

  // La creación de finca se hace por RPC SECURITY DEFINER:
  // no acepta owner_id desde el cliente, usa auth.uid() dentro de Postgres,
  // garantiza el profile y deja que el trigger cree farm_members(owner).
  const { data, error } = await supabase.rpc('create_farm_for_current_user', {
    p_name: name,
    p_location: location || null,
    p_hectares: hectares || null,
    p_purpose: purpose || null,
    p_color: color || '#2D6A4F',
    p_icon: icon || 'leaf',
  });

  if (error) {
    console.error('[createFarm] RPC falló', { code: error.code, message: error.message, details: error.details, hint: error.hint });
    const err = new Error(
      error.code === '42883'
        ? 'Falta aplicar la migration 007 (create_farm_for_current_user) en Supabase.'
        : error.code === '42501'
          ? 'No tienes permiso para crear fincas. Aplica la migration 007 en Supabase.'
        : (error.message || 'No se pudo crear la finca.')
    );
    err.cause = error;
    throw err;
  }
  return data;
};

// ─── Miembros e invitaciones ──────────────────────────────────────
export const listFarmMembers = async (farmId) => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('farm_members')
    .select(`
      role, joined_at, user_id,
      profiles:profiles!farm_members_user_id_fkey(
        id, full_name, email, phone, avatar_url
      )
    `)
    .eq('farm_id', farmId);
  if (error) throw error;
  return data ?? [];
};

export const listFarmInvitations = async (farmId) => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('farm_invitations')
    .select('id, email, role, status, token, expires_at, created_at, accepted_at, message')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const ROLE_VALUES = new Set(['admin', 'editor', 'lector', 'worker']);

export const inviteToFarm = async ({ farmId, email, role = 'editor', message }) => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  if (!ROLE_VALUES.has(role)) throw new Error('Rol inválido para invitación.');

  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  const cleanMessage = message ? String(message).trim().slice(0, 500) : null;

  const { data, error } = await supabase
    .from('farm_invitations')
    .insert({
      farm_id: farmId,
      email: cleanEmail || null,
      role,
      message: cleanMessage,
      invited_by: user.id,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const revokeInvitation = async (invitationId) => {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from('farm_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId);
  if (error) throw error;
};

export const setMemberRole = async ({ farmId, userId, role }) => {
  if (role === 'owner') throw new Error('Para transferir el ownership usa una operación separada.');
  if (!ROLE_VALUES.has(role)) throw new Error('Rol inválido.');
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from('farm_members')
    .update({ role })
    .eq('farm_id', farmId)
    .eq('user_id', userId);
  if (error) throw error;
};

export const removeFarmMember = async ({ farmId, userId }) => {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from('farm_members')
    .delete()
    .eq('farm_id', farmId)
    .eq('user_id', userId);
  if (error) throw error;
};
