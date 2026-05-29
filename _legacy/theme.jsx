// GanaderíaPro — Design tokens
const GP = {
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
  white: '#FFFFFF',
  text: '#374151',         // Gris texto
  textSec: '#9CA3AF',      // Gris secundario
  bg: '#F9FAFB',           // Fondo general
  border: '#E5E7EB',
  borderSoft: '#F1F3F5',

  // Type
  font: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
};

// Status meta — color + label + dot color
const STATUS = {
  activo:     { label: 'Activo',     bg: '#D8F3DC', fg: '#1B4332', dot: '#52B788' },
  vendido:    { label: 'Vendido',    bg: '#E5E7EB', fg: '#374151', dot: '#6B7280' },
  muerto:     { label: 'Muerto',     bg: '#FBDCCF', fg: '#9A3412', dot: '#E76F51' },
  robado:     { label: 'Robado',     bg: '#FEE2E2', fg: '#991B1B', dot: '#DC2626' },
  trasladado: { label: 'Trasladado', bg: '#DBEAFE', fg: '#1E40AF', dot: '#3B82F6' },
};

// Inline icon set — stroked, 1.75 weight, currentColor
const Icon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.75, style = {} }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chevR: <path d="m9 6 6 6-6 6"/>,
    chevL: <path d="m15 6-6 6 6 6"/>,
    chevD: <path d="m6 9 6 6 6-6"/>,
    cow: <><path d="M5 8c0-1.5 1-3 2.5-3S10 6 10 8"/><path d="M14 8c0-1.5 1-3 2.5-3S19 6.5 19 8"/><path d="M5 8h14v5a7 7 0 0 1-14 0Z"/><circle cx="9.5" cy="11" r=".8" fill="currentColor"/><circle cx="14.5" cy="11" r=".8" fill="currentColor"/><path d="M10 16c.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5"/></>,
    leaf: <><path d="M11 20A7 7 0 0 1 4 13C4 8 8 5 13 4c2-.3 6-1 7-1-.1 4-1 8.5-2 10.5-1.5 3-4 5.5-7 6.5Z"/><path d="M2 22c4-4 8-7 14-12"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
    weight: <><path d="M5 7h14l-1.5 12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2L5 7Z"/><path d="M9 7a3 3 0 1 1 6 0"/><path d="M9 12l3 2 3-2"/></>,
    arrowUp: <><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>,
    arrowOut: <><path d="M7 17 17 7"/><path d="M9 7h8v8"/></>,
    camera: <><path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
    check: <path d="m5 12 5 5L20 7"/>,
    x: <><path d="M6 6l12 12M18 6 6 18"/></>,
    warn: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5M12 18h.01"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></>,
    pin: <><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></>,
    dot: <circle cx="12" cy="12" r="4" fill="currentColor"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.4.9 2.1 1.2L10 21h4l.5-2.6c.7-.3 1.5-.7 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/></>,
    droplet: <path d="M12 3s-6 6.5-6 11a6 6 0 0 0 12 0c0-4.5-6-11-6-11Z"/>,
    bull: <><path d="M6 9 3 6M18 9l3-3"/><path d="M6 9c0-1.5 2-2 6-2s6 .5 6 2v3a6 6 0 0 1-12 0V9Z"/><circle cx="9.5" cy="11" r=".8" fill="currentColor"/><circle cx="14.5" cy="11" r=".8" fill="currentColor"/><path d="M10 15c.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5"/></>,
    doc: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    sync: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, ...style }}>
      {paths[name]}
    </svg>
  );
};

Object.assign(window, { GP, STATUS, Icon });
