// Helpers cliente para subir fotos al bucket `animal-photos`.
// Path: `<farmId>/<animalId>/<timestamp>-<rand>.<ext>` para que la RLS de
// storage.objects pueda validar pertenencia por finca.

import { supabaseBrowser } from '@/lib/supabase/client';

const BUCKET = 'animal-photos';

const sanitizeExt = (file) => {
  const fromName = file?.name?.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  const fromType = (file?.type || '').split('/').pop()?.toLowerCase();
  if (fromType === 'jpeg') return 'jpg';
  if (fromType && /^[a-z0-9]{2,5}$/.test(fromType)) return fromType;
  return 'jpg';
};

// Sube una foto al storage y devuelve `{ path, url }`. No toca BD.
export const uploadAnimalPhoto = async ({ farmId, animalId, file }) => {
  if (!farmId || !animalId || !file) throw new Error('Faltan datos para subir la foto.');
  const supabase = supabaseBrowser();
  const ext = sanitizeExt(file);
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${farmId}/${animalId}/${Date.now()}-${rand}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || `image/${ext}`,
  });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: publicUrl };
};

// Registra la foto en animal_photos y actualiza animals.photo_url (la última foto).
// También deja huella en el timeline (`animal_events` tipo `nota` con metadata.kind = 'foto')
// para que aparezca en el historial de movimientos.
export const attachAnimalPhoto = async ({ farmId, animalId, path, url, weightKg = null, notes = null }) => {
  const supabase = supabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error: insertErr } = await supabase
    .from('animal_photos')
    .insert({
      farm_id: farmId,
      animal_id: animalId,
      storage_path: path,
      url,
      weight_kg: weightKg,
      notes,
      created_by: user.id,
    });
  if (insertErr) throw insertErr;

  const { error: updateErr } = await supabase
    .from('animals')
    .update({ photo_url: url })
    .eq('id', animalId);
  if (updateErr) throw updateErr;

  // Evento en el historial. No bloquea el flujo si falla (la foto ya quedó guardada).
  const { error: eventErr } = await supabase
    .from('animal_events')
    .insert({
      animal_id: animalId,
      farm_id: farmId,
      type: 'nota',
      event_date: new Date().toISOString().slice(0, 10),
      description: notes ? `Foto · ${notes}` : 'Nueva foto agregada al historial',
      metadata: {
        kind: 'foto',
        url,
        storage_path: path,
        weight_kg: weightKg,
        notes: notes || null,
      },
      created_by: user.id,
    });
  if (eventErr) {
    console.warn('[attachAnimalPhoto] no se registró el evento de foto:', eventErr);
  }
};

// Helper combinado: sube + registra. Devuelve { path, url }.
export const uploadAndAttachAnimalPhoto = async ({ farmId, animalId, file, weightKg, notes }) => {
  const { path, url } = await uploadAnimalPhoto({ farmId, animalId, file });
  await attachAnimalPhoto({ farmId, animalId, path, url, weightKg, notes });
  return { path, url };
};

// Lista la galería de un animal (más recientes primero).
export const listAnimalPhotos = async ({ animalId }) => {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from('animal_photos')
    .select('id, url, storage_path, weight_kg, notes, taken_at, created_at')
    .eq('animal_id', animalId)
    .order('taken_at', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};
