'use server';

import { revalidatePath } from 'next/cache';
import {
  createFarm,
  inviteToFarm,
  revokeInvitation,
  setMemberRole,
  removeFarmMember,
  listFarmMembers,
  listFarmInvitations,
} from '@/lib/db/farms';

export const createFarmAction = async (formData) => {
  // formData puede venir como FormData (form) o como objeto plano
  const get = (k) =>
    formData instanceof FormData ? formData.get(k) : formData?.[k];

  const name = String(get('name') || '').trim();
  if (!name) return { ok: false, error: 'El nombre es obligatorio.' };

  try {
    const farm = await createFarm({
      name,
      location: String(get('location') || '').trim() || null,
      hectares: Number(get('hectares') || 0) || null,
      purpose: String(get('purpose') || '').trim() || null,
      color: String(get('color') || '#2D6A4F'),
      icon: String(get('icon') || 'leaf'),
    });
    revalidatePath('/inicio');
    revalidatePath('/fincas');
    revalidatePath('/inventario');
    return { ok: true, farm };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo crear la finca.' };
  }
};

// Crea invitación (email opcional). Devuelve el token; el cliente arma el link
// con su origin (window.location.origin) para enviarlo o copiarlo.
export const createInvitationAction = async ({ farmId, email, role = 'editor', message }) => {
  if (!farmId) return { ok: false, error: 'Selecciona una finca.' };
  if (!['editor', 'lector', 'admin'].includes(role)) {
    return { ok: false, error: 'Rol inválido.' };
  }
  try {
    const invitation = await inviteToFarm({ farmId, email, role, message });
    revalidatePath('/fincas');
    return { ok: true, invitation };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo crear la invitación.' };
  }
};

export const revokeInvitationAction = async ({ invitationId }) => {
  if (!invitationId) return { ok: false, error: 'Invitación inválida.' };
  try {
    await revokeInvitation(invitationId);
    revalidatePath('/fincas');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo revocar.' };
  }
};

export const changeMemberRoleAction = async ({ farmId, userId, role }) => {
  if (!farmId || !userId) return { ok: false, error: 'Faltan datos.' };
  try {
    await setMemberRole({ farmId, userId, role });
    revalidatePath('/fincas');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo cambiar el rol.' };
  }
};

export const removeMemberAction = async ({ farmId, userId }) => {
  if (!farmId || !userId) return { ok: false, error: 'Faltan datos.' };
  try {
    await removeFarmMember({ farmId, userId });
    revalidatePath('/fincas');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo eliminar al miembro.' };
  }
};

// Helpers para componentes de servidor que quieran prefetch.
export const fetchFarmCollaborators = async (farmId) => {
  if (!farmId) return { members: [], invitations: [] };
  try {
    const [members, invitations] = await Promise.all([
      listFarmMembers(farmId),
      listFarmInvitations(farmId),
    ]);
    return { members, invitations };
  } catch (err) {
    console.error('[fetchFarmCollaborators]', err);
    return { members: [], invitations: [], error: err?.message || 'Error al cargar' };
  }
};
