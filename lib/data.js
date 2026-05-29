// Seed data for the prototype.
//
// Modelo simple:
//   FINCAS  → cada finca tiene lotes y personal propios
//   ANIMALS → cada animal pertenece a una finca (fincaId)
//
// Un mismo dueño/admin (USER actual) puede tener múltiples fincas
// (lib/data.js solo cubre el seed de las que él administra).

export const USER = {
  id: 'u1',
  nombre: 'Carlos Ramírez',
  email: 'carlos@hacienda-esperanza.co',
  rol: 'admin',
  plan: 'Pro',
};

export const FINCAS = [
  {
    id: 'esp',
    nombre: 'Hacienda La Esperanza',
    hectareas: 248,
    ubicacion: 'Casanare',
    color: '#2D6A4F',
    icono: 'leaf',
    proposito: 'Doble propósito',
    administrador: 'Carlos Ramírez',
    lotes: ['Potrero Norte', 'Potrero Sur', 'Cerca del río', 'Maternidad', 'Sin asignar'],
  },
  {
    id: 'pal',
    nombre: 'Finca El Palmar',
    hectareas: 92,
    ubicacion: 'Meta',
    color: '#52B788',
    icono: 'leaf',
    proposito: 'Carne',
    administrador: 'Carlos Ramírez',
    lotes: ['Potrero Alto', 'Potrero Bajo', 'Bebedero', 'Sin asignar'],
  },
  {
    id: 'ros',
    nombre: 'Finca Los Rosales',
    hectareas: 156,
    ubicacion: 'Casanare',
    color: '#F4A261',
    icono: 'leaf',
    proposito: 'Leche',
    administrador: 'Carlos Ramírez',
    lotes: ['Ordeño A', 'Ordeño B', 'Maternidad', 'Sin asignar'],
  },
];

// Personal por finca — equipos independientes.
export const PERSONAL = [
  // Esperanza
  { id: 'p1', fincaId: 'esp', nombre: 'Luis Méndez',     rol: 'Capataz',     telefono: '+57 320 555 1100' },
  { id: 'p2', fincaId: 'esp', nombre: 'Ana Rojas',       rol: 'Veterinaria', telefono: '+57 311 555 1101' },
  { id: 'p3', fincaId: 'esp', nombre: 'Jorge Pinilla',   rol: 'Vaquero',     telefono: '+57 312 555 1102' },
  // Palmar
  { id: 'p4', fincaId: 'pal', nombre: 'María Torres',    rol: 'Capataza',    telefono: '+57 313 555 2200' },
  { id: 'p5', fincaId: 'pal', nombre: 'Diego Cárdenas',  rol: 'Vaquero',     telefono: '+57 314 555 2201' },
  // Rosales
  { id: 'p6', fincaId: 'ros', nombre: 'Sofía Herrera',   rol: 'Encargada',   telefono: '+57 315 555 3300' },
  { id: 'p7', fincaId: 'ros', nombre: 'Pedro Galvis',    rol: 'Ordeñador',   telefono: '+57 316 555 3301' },
  { id: 'p8', fincaId: 'ros', nombre: 'Camilo Suárez',   rol: 'Vaquero',     telefono: '+57 317 555 3302' },
];

// Animales — cada uno asignado a su finca.
export const ANIMALS = [
  // Hacienda La Esperanza
  { id: 1,  fincaId: 'esp', arete: 'CO-0421', nombre: 'Margarita', sexo: 'H', raza: 'Holstein', categoria: 'Vaca productora', proposito: 'Leche',            estado: 'activo',     edad: '4a 2m', peso: 478, lote: 'Potrero Norte', color: '#D8F3DC', ingreso: '2022-03-14', origen: 'Compra · Hacienda La Esperanza', precio: 1850000 },
  { id: 2,  fincaId: 'esp', arete: 'CO-0518', nombre: 'Tormenta',  sexo: 'M', raza: 'Brahman',  categoria: 'Toro reproductor', proposito: 'Reproductor',      estado: 'activo',     edad: '5a 8m', peso: 712, lote: 'Potrero Sur',   color: '#A47148', ingreso: '2021-08-02', origen: 'Compra · Subasta El Llano' },
  { id: 3,  fincaId: 'esp', arete: 'CO-0903', nombre: 'Estrella',  sexo: 'H', raza: 'Jersey',   categoria: 'Vaca productora',  proposito: 'Leche',            estado: 'activo',     edad: '3a 5m', peso: 421, lote: 'Potrero Norte', color: '#E9D8C4' },
  { id: 6,  fincaId: 'esp', arete: 'CO-1284', nombre: 'Pinta',     sexo: 'H', raza: 'Gyr',      categoria: 'Vaquillona',       proposito: 'Leche',            estado: 'activo',     edad: '1a 9m', peso: 298, lote: 'Potrero Norte' },
  { id: 7,  fincaId: 'esp', arete: 'CO-0667', nombre: 'Rayo',      sexo: 'M', raza: 'Brahman',  categoria: 'Ternero',          proposito: 'Carne',            estado: 'activo',     edad: '7m',    peso: 165, lote: 'Maternidad' },
  { id: 9,  fincaId: 'esp', arete: 'CO-0779', nombre: 'Negra',     sexo: 'H', raza: 'Holstein', categoria: 'Vaca productora',  proposito: 'Leche',            estado: 'muerto',     edad: '8a 2m', peso: 0,   lote: '—' },
  { id: 10, fincaId: 'esp', arete: 'CO-1340', nombre: 'Manchita',  sexo: 'H', raza: 'Holstein', categoria: 'Ternera',          proposito: 'Leche',            estado: 'activo',     edad: '4m',    peso: 92,  lote: 'Maternidad' },

  // Finca El Palmar
  { id: 4,  fincaId: 'pal', arete: 'PA-1122', nombre: 'Bonito',    sexo: 'M', raza: 'Angus',    categoria: 'Novillo de ceba',  proposito: 'Carne',            estado: 'activo',     edad: '2a 1m', peso: 385, lote: 'Potrero Alto' },
  { id: 8,  fincaId: 'pal', arete: 'PA-0451', nombre: 'Café',      sexo: 'M', raza: 'Cebú',     categoria: 'Novillo de ceba',  proposito: 'Carne',            estado: 'trasladado', edad: '2a 6m', peso: 412, lote: '—' },
  { id: 11, fincaId: 'pal', arete: 'PA-0892', nombre: 'Trueno',    sexo: 'M', raza: 'Angus',    categoria: 'Novillo de ceba',  proposito: 'Carne',            estado: 'activo',     edad: '2a 3m', peso: 398, lote: 'Potrero Bajo' },

  // Finca Los Rosales
  { id: 5,  fincaId: 'ros', arete: 'RO-0237', nombre: 'Luna',      sexo: 'H', raza: 'Holstein', categoria: 'Vaca productora',  proposito: 'Doble propósito', estado: 'vendido',    edad: '6a',    peso: 510, lote: '—' },
  { id: 12, fincaId: 'ros', arete: 'RO-0156', nombre: 'Canela',    sexo: 'H', raza: 'Gyr',      categoria: 'Vaca productora',  proposito: 'Doble propósito', estado: 'robado',     edad: '5a 1m', peso: 0,   lote: '—' },
  { id: 13, fincaId: 'ros', arete: 'RO-0317', nombre: 'Perla',     sexo: 'H', raza: 'Jersey',   categoria: 'Vaca productora',  proposito: 'Leche',            estado: 'activo',     edad: '4a',    peso: 408, lote: 'Ordeño A' },
  { id: 14, fincaId: 'ros', arete: 'RO-0498', nombre: 'Lucero',    sexo: 'H', raza: 'Holstein', categoria: 'Vaca productora',  proposito: 'Leche',            estado: 'activo',     edad: '3a 8m', peso: 446, lote: 'Ordeño A' },
  { id: 15, fincaId: 'ros', arete: 'RO-0721', nombre: 'Suerte',    sexo: 'H', raza: 'Gyr',      categoria: 'Vaquillona',       proposito: 'Leche',            estado: 'activo',     edad: '1a 6m', peso: 312, lote: 'Ordeño B' },
];

// ─────────────────────────────────────────────────────────────
// Helpers de consulta por finca
// ─────────────────────────────────────────────────────────────
export const animalsByFinca = (fincaId) =>
  ANIMALS.filter(a => a.fincaId === fincaId);

export const personalByFinca = (fincaId) =>
  PERSONAL.filter(p => p.fincaId === fincaId);

export const fincaMetrics = (fincaId) => {
  const list = animalsByFinca(fincaId);
  const activos = list.filter(a => a.estado === 'activo');
  return {
    total: list.length,
    activos: activos.length,
    hembras: activos.filter(a => a.sexo === 'H').length,
    machos:  activos.filter(a => a.sexo === 'M').length,
    pesoTotal: activos.reduce((s, a) => s + a.peso, 0),
    salidas: list.filter(a => ['vendido', 'muerto', 'robado', 'trasladado'].includes(a.estado)).length,
    personal: personalByFinca(fincaId).length,
  };
};

export const globalMetrics = () => {
  const totales = FINCAS.map(f => fincaMetrics(f.id));
  return {
    fincas:     FINCAS.length,
    hectareas:  FINCAS.reduce((s, f) => s + f.hectareas, 0),
    activos:    totales.reduce((s, m) => s + m.activos,    0),
    hembras:    totales.reduce((s, m) => s + m.hembras,    0),
    machos:     totales.reduce((s, m) => s + m.machos,     0),
    pesoTotal:  totales.reduce((s, m) => s + m.pesoTotal,  0),
    salidas:    totales.reduce((s, m) => s + m.salidas,    0),
    personal:   totales.reduce((s, m) => s + m.personal,   0),
  };
};

// ─────────────────────────────────────────────────────────────
// Compat: métricas globales (uso heredado en componentes viejos)
// ─────────────────────────────────────────────────────────────
export const METRICS = {
  totalActivos: ANIMALS.filter(a => a.estado === 'activo').length,
  hembras:      ANIMALS.filter(a => a.estado === 'activo' && a.sexo === 'H').length,
  pesoTotal:    ANIMALS.filter(a => a.estado === 'activo').reduce((s, a) => s + a.peso, 0),
  salidasMes:   ANIMALS.filter(a => ['vendido', 'muerto', 'robado', 'trasladado'].includes(a.estado)).length,
};

export const RAZAS = ['Holstein', 'Jersey', 'Brahman', 'Angus', 'Gyr', 'Cebú', 'Simmental', 'Charolais', 'Normando', 'Pardo Suizo'];

// LOTES por defecto (cuando no se conoce la finca activa).
export const LOTES = ['Potrero Norte', 'Potrero Sur', 'Cerca del río', 'Maternidad', 'Sin asignar'];

export const CATEGORIAS_H = ['Ternera', 'Vaquillona', 'Novilla', 'Vaca productora', 'Vaca seca', 'Vaca de descarte'];
export const CATEGORIAS_M = ['Ternero', 'Novillo de ceba', 'Toro reproductor', 'Buey'];

// Actividad reciente cross-fincas para el dashboard de inicio.
export const ACTIVIDAD_RECIENTE = [
  { id: 'a1', fincaId: 'esp', tipo: 'ingreso', titulo: 'Ingreso · Manchita',  detalle: 'Nacimiento — Maternidad',              fecha: '2026-05-22', icon: 'arrowUp', color: '#2D6A4F' },
  { id: 'a2', fincaId: 'ros', tipo: 'salida',  titulo: 'Venta · Luna',        detalle: 'Hacienda San Andrés · $3.20M',        fecha: '2026-05-08', icon: 'arrowOut', color: '#E76F51' },
  { id: 'a3', fincaId: 'esp', tipo: 'pesaje',  titulo: 'Pesaje · Margarita',  detalle: '478 kg — Control rutinario',          fecha: '2026-04-12', icon: 'weight',  color: '#F4A261' },
  { id: 'a4', fincaId: 'pal', tipo: 'traslado',titulo: 'Traslado · Café',     detalle: 'Hacia Finca El Palmar',               fecha: '2026-04-30', icon: 'sync',    color: '#3B82F6' },
  { id: 'a5', fincaId: 'ros', tipo: 'robo',    titulo: 'Robo · Canela',       detalle: 'Denuncia 2026-441 radicada',          fecha: '2026-03-15', icon: 'warn',    color: '#DC2626' },
];
