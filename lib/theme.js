// GanaderíaPro — Design tokens
export const GP = {
  // Paleta Verde Campo
  green: '#2D6A4F',        // Primario — CTAs, navbar
  greenMid: '#52B788',     // Activos, badges éxito
  greenLight: '#D8F3DC',   // Fondos suaves, chips
  greenDeep: '#1B4332',    // Hover/pressed
  earth: '#A47148',        // Categoría carne
  earthLight: '#E9D8C4',
  amber: '#F4A261',        // Pesajes, alertas suaves
  amberLight: '#FCE4CC',
  red: '#E76F51',          // Salidas destructivas
  redLight: '#FBDCCF',
  cream: '#F4F1EC',        // Fondo "campo"
  white: '#FFFFFF',
  text: '#374151',         // Gris texto
  textSec: '#9CA3AF',      // Gris secundario
  bg: '#F9FAFB',           // Fondo general app
  border: '#E5E7EB',
  borderSoft: '#F1F3F5',

  font: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
};

// Status meta — color + label + dot color
export const STATUS = {
  activo:     { label: 'Activo',     bg: '#D8F3DC', fg: '#1B4332', dot: '#52B788' },
  vendido:    { label: 'Vendido',    bg: '#E5E7EB', fg: '#374151', dot: '#6B7280' },
  muerto:     { label: 'Muerto',     bg: '#FBDCCF', fg: '#9A3412', dot: '#E76F51' },
  robado:     { label: 'Robado',     bg: '#FEE2E2', fg: '#991B1B', dot: '#DC2626' },
  trasladado: { label: 'Trasladado', bg: '#DBEAFE', fg: '#1E40AF', dot: '#3B82F6' },
};
