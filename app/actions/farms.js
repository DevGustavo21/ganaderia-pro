'use server';

import { revalidatePath } from 'next/cache';
import { createFarm, inviteToFarm, setMemberRole } from '@/lib/db/farms';

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

export const inviteCollaboratorAction = async ({ farmId, email, role, message }) => {
  try {
    const invitation = await inviteToFarm({ farmId, email, role, message });
    revalidatePath('/fincas');
    return { ok: true, invitation };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo enviar la invitación.' };
  }
};

export const changeMemberRoleAction = async ({ farmId, userId, role }) => {
  try {
    await setMemberRole({ farmId, userId, role });
    revalidatePath('/fincas');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo cambiar el rol.' };
  }
};
