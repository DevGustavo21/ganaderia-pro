// Seed data for the prototype
const ANIMALS = [
  { id: 1, arete: 'CO-0421', nombre: 'Margarita', sexo: 'H', raza: 'Holstein', categoria: 'Vaca productora', proposito: 'Leche', estado: 'activo', edad: '4a 2m', peso: 478, lote: 'Potrero Norte', color: '#D8F3DC', ingreso: '2022-03-14', origen: 'Compra · Hacienda La Esperanza', precio: 1850000 },
  { id: 2, arete: 'CO-0518', nombre: 'Tormenta', sexo: 'M', raza: 'Brahman', categoria: 'Toro reproductor', proposito: 'Reproductor', estado: 'activo', edad: '5a 8m', peso: 712, lote: 'Potrero Sur', color: '#A47148', ingreso: '2021-08-02', origen: 'Compra · Subasta El Llano' },
  { id: 3, arete: 'CO-0903', nombre: 'Estrella', sexo: 'H', raza: 'Jersey', categoria: 'Vaca productora', proposito: 'Leche', estado: 'activo', edad: '3a 5m', peso: 421, lote: 'Potrero Norte', color: '#E9D8C4' },
  { id: 4, arete: 'CO-1122', nombre: 'Bonito', sexo: 'M', raza: 'Angus', categoria: 'Novillo de ceba', proposito: 'Carne', estado: 'activo', edad: '2a 1m', peso: 385, lote: 'Cerca del río' },
  { id: 5, arete: 'CO-0237', nombre: 'Luna', sexo: 'H', raza: 'Holstein', categoria: 'Vaca productora', proposito: 'Doble propósito', estado: 'vendido', edad: '6a', peso: 510, lote: '—' },
  { id: 6, arete: 'CO-1284', nombre: 'Pinta', sexo: 'H', raza: 'Gyr', categoria: 'Vaquillona', proposito: 'Leche', estado: 'activo', edad: '1a 9m', peso: 298, lote: 'Potrero Norte' },
  { id: 7, arete: 'CO-0667', nombre: 'Rayo', sexo: 'M', raza: 'Brahman', categoria: 'Ternero', proposito: 'Carne', estado: 'activo', edad: '7m', peso: 165, lote: 'Maternidad' },
  { id: 8, arete: 'CO-0451', nombre: 'Café', sexo: 'M', raza: 'Cebú', categoria: 'Novillo de ceba', proposito: 'Carne', estado: 'trasladado', edad: '2a 6m', peso: 412, lote: '—' },
  { id: 9, arete: 'CO-0779', nombre: 'Negra', sexo: 'H', raza: 'Holstein', categoria: 'Vaca productora', proposito: 'Leche', estado: 'muerto', edad: '8a 2m', peso: 0, lote: '—' },
  { id: 10, arete: 'CO-1340', nombre: 'Manchita', sexo: 'H', raza: 'Holstein', categoria: 'Ternera', proposito: 'Leche', estado: 'activo', edad: '4m', peso: 92, lote: 'Maternidad' },
  { id: 11, arete: 'CO-0892', nombre: 'Trueno', sexo: 'M', raza: 'Angus', categoria: 'Novillo de ceba', proposito: 'Carne', estado: 'activo', edad: '2a 3m', peso: 398, lote: 'Cerca del río' },
  { id: 12, arete: 'CO-0156', nombre: 'Canela', sexo: 'H', raza: 'Gyr', categoria: 'Vaca productora', proposito: 'Doble propósito', estado: 'robado', edad: '5a 1m', peso: 0, lote: '—' },
];

// Metrics derived
const METRICS = {
  totalActivos: ANIMALS.filter(a => a.estado === 'activo').length,
  hembras: ANIMALS.filter(a => a.estado === 'activo' && a.sexo === 'H').length,
  pesoTotal: ANIMALS.filter(a => a.estado === 'activo').reduce((s, a) => s + a.peso, 0),
  salidasMes: ANIMALS.filter(a => ['vendido','muerto','robado','trasladado'].includes(a.estado)).length,
};

// Sample timeline for detail view
const TIMELINE_SAMPLE = [
  { tipo: 'salida-no', fecha: null }, // placeholder, animal still active
  { tipo: 'pesaje', fecha: '2026-04-12', peso: 478, motivo: 'Control rutinario', nota: 'Buen estado corporal' },
  { tipo: 'pesaje', fecha: '2026-01-18', peso: 462, motivo: 'Post-parto', nota: '+8 kg desde último control' },
  { tipo: 'pesaje', fecha: '2025-10-04', peso: 454, motivo: 'Control rutinario' },
  { tipo: 'ingreso', fecha: '2022-03-14', peso: 312, origen: 'Compra · Hacienda La Esperanza', precio: 1850000 },
];

// Razas comunes para el dropdown
const RAZAS = ['Holstein', 'Jersey', 'Brahman', 'Angus', 'Gyr', 'Cebú', 'Simmental', 'Charolais', 'Normando', 'Pardo Suizo'];

// Lotes
const LOTES = ['Potrero Norte', 'Potrero Sur', 'Cerca del río', 'Maternidad', 'Sin asignar'];

// Categorías por sexo
const CATEGORIAS_H = ['Ternera', 'Vaquillona', 'Novilla', 'Vaca productora', 'Vaca seca', 'Vaca de descarte'];
const CATEGORIAS_M = ['Ternero', 'Novillo de ceba', 'Toro reproductor', 'Buey'];

// Fincas
const FINCAS = [
  { id: 'esp', nombre: 'Hacienda La Esperanza', hectareas: 248, ubicacion: 'Casanare' },
  { id: 'pal', nombre: 'Finca El Palmar', hectareas: 92, ubicacion: 'Meta' },
  { id: 'ros', nombre: 'Finca Los Rosales', hectareas: 156, ubicacion: 'Casanare' },
];

Object.assign(window, { ANIMALS, METRICS, TIMELINE_SAMPLE, RAZAS, LOTES, CATEGORIAS_H, CATEGORIAS_M, FINCAS });
