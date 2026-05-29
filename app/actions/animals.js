'use server';

import { revalidatePath } from 'next/cache';
import { createAnimal, addWeighEvent, registerExit, updateAnimal, getAnimal, logChange } from '@/lib/db/animals';

// Mapeo de las claves del wizard (UI) → columnas de la BD.
const toRow = (input, fincaId) => {
  const isBirth = input.tipoIngreso === 'Nacimiento';
  const parentsLabel = [
    input.madre ? `Madre: ${input.madre}` : null,
    input.padre ? `Padre: ${input.padre}` : null,
  ].filter(Boolean).join(' · ');

  return {
    farm_id: fincaId,
    tag: String(input.arete || '').trim(),
    name: input.nombre?.trim() || null,
    sex: input.sexo || null,
    breed: input.raza || null,
    category: input.categoria || null,
    purpose: input.proposito || null,
    birth_date: input.fechaNac || null,
    current_weight_kg: input.peso ? Number(input.peso) : null,
    color_notes: input.color || null,

    mother_animal_id: input.madreId || null,
    father_animal_id: input.padreId || null,

    entry_type: input.tipoIngreso || null,
    entry_date: isBirth ? (input.fechaNac || input.fechaIngreso || null) : (input.fechaIngreso || null),
    entry_weight_kg: input.peso ? Number(input.peso) : null,
    entry_price: input.precio ? Number(input.precio) : null,
    entry_source: isBirth ? (parentsLabel || null) : (input.proveedor || null),
    entry_document: input.documento || null,

    notes: input.notas || null,
  };
};

export const registerAnimalAction = async ({ fincaId, data }) => {
  if (!fincaId) return { ok: false, error: 'Selecciona una finca activa.' };
  if (!data?.arete) return { ok: false, error: 'El arete es obligatorio.' };
  try {
    const animal = await createAnimal(toRow(data, fincaId));
    revalidatePath('/inventario');
    revalidatePath('/inicio');
    return { ok: true, animal };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo registrar el animal.' };
  }
};

export const updateAnimalDetailsAction = async ({
  animalId, farmId, categoria, proposito, peso, motivo, pesoChanged,
}) => {
  if (!animalId) return { ok: false, error: 'Animal inválido.' };
  if (!farmId)   return { ok: false, error: 'Finca inválida.' };
  try {
    const current = await getAnimal(animalId);
    const weightKg = peso != null && peso !== '' ? Number(peso) : null;

    const trackedChanges = [];
    if (categoria && categoria !== current.category) {
      trackedChanges.push({
        field: 'categoria', label: 'Categoría',
        from: current.category || null, to: categoria,
      });
    }
    if (proposito && proposito !== current.purpose) {
      trackedChanges.push({
        field: 'proposito', label: 'Propósito',
        from: current.purpose || null, to: proposito,
      });
    }

    // Peso: el evento `pesaje` ya queda registrado por addWeighEvent,
    // no lo duplicamos en la lista de cambios.
    if (pesoChanged && weightKg && weightKg > 0) {
      await addWeighEvent({
        animalId,
        farmId,
        weightKg,
        reason: motivo || 'Edición manual',
        date: new Date().toISOString().slice(0, 10),
      });
    }

    const patch = {};
    if (categoria && categoria !== current.category) patch.category = categoria;
    if (proposito && proposito !== current.purpose) patch.purpose = proposito;
    if (!pesoChanged && weightKg && weightKg > 0 && weightKg !== Number(current.current_weight_kg || 0)) {
      patch.current_weight_kg = weightKg;
    }

    if (Object.keys(patch).length) {
      await updateAnimal(animalId, patch);
    }

    if (trackedChanges.length > 0) {
      const summary = trackedChanges
        .map((c) => `${c.label}: ${c.from || '—'} → ${c.to || '—'}`)
        .join(' · ');
      await logChange({
        animalId,
        farmId,
        kind: 'actualizacion',
        changes: trackedChanges,
        summary,
      });
    }

    revalidatePath('/inventario');
    revalidatePath('/inicio');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo actualizar el animal.' };
  }
};

export const weighAnimalAction = async (payload) => {
  try {
    const event = await addWeighEvent(payload);
    revalidatePath('/inventario');
    return { ok: true, event };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo registrar el pesaje.' };
  }
};

export const registerExitAction = async (payload) => {
  try {
    const event = await registerExit(payload);
    revalidatePath('/inventario');
    revalidatePath('/inicio');
    return { ok: true, event };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo registrar la salida.' };
  }
};
