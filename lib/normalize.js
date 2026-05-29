// Mapeo DB (snake_case en) ↔ UI legacy (camelCase es).
// Permite que los componentes existentes sigan funcionando sin reescribir todo.

const ymd = (d) => {
  if (!d) return null;
  try {
    return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

const calcAge = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years === 0) return `${months}m`;
  return `${years}a ${months}m`;
};

// Normaliza una fila de Supabase (snake_case en inglés) al shape que
// los componentes legacy esperan (camelCase en español). Este archivo no
// es client-only, así que puede usarse tanto en Server Components como en
// Client Components.
export const normalizeFarm = (row) => {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    nombre: row.name,
    ubicacion: row.location || '—',
    hectareas: row.hectares ?? 0,
    color: row.color || '#2D6A4F',
    icono: row.icon || 'leaf',
    proposito: row.purpose || '—',
    administrador: row.owner_name || '—',
    lotes: row.lotes || [],
  };
};

export const normalizeAnimal = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fincaId: row.farm_id,
    arete: row.tag,
    nombre: row.name || '',
    sexo: row.sex,
    raza: row.breed || '',
    categoria: row.category || '',
    proposito: row.purpose || '',
    estado: row.status,
    edad: calcAge(row.birth_date),
    peso: Number(row.current_weight_kg) || 0,
    fechaNac: ymd(row.birth_date),
    color: row.color_notes || '',
    lote: row.current_lot_id || '—',
    ingreso: ymd(row.entry_date),
    origen: row.entry_source || '',
    precio: row.entry_price ? Number(row.entry_price) : null,
    photoUrl: row.photo_url || null,
    madreId: row.mother_animal_id || null,
    padreId: row.father_animal_id || null,
    createdAt: row.created_at,
  };
};

export const normalizePersonnel = (row) => ({
  id: row.id,
  fincaId: row.farm_id,
  nombre: row.full_name,
  rol: row.role || '—',
  telefono: row.phone || '',
  email: row.email || '',
});
