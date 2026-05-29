// Animal detail sheet — slides up from bottom on mobile
const AnimalDetail = ({ animal, onClose, onExit, onWeigh }) => {
  if (!animal) return null;
  const isActive = animal.estado === 'activo';

  // Build timeline based on animal status
  const timeline = React.useMemo(() => {
    const base = [
      { tipo: 'pesaje', fecha: '2026-04-12', peso: animal.peso, motivo: 'Control rutinario', nota: 'Condición corporal 3.5/5' },
      { tipo: 'pesaje', fecha: '2026-01-18', peso: Math.max(0, animal.peso - 16), motivo: 'Post-vacunación', nota: '+8 kg desde último control' },
      { tipo: 'pesaje', fecha: '2025-10-04', peso: Math.max(0, animal.peso - 24), motivo: 'Control rutinario' },
      { tipo: 'ingreso', fecha: animal.ingreso || '2022-03-14', peso: Math.max(60, animal.peso - 160), origen: animal.origen || 'Compra · Hacienda La Esperanza', precio: animal.precio || 1850000 },
    ];
    if (!isActive) {
      const salida = {
        vendido:    { causa: 'Venta',     detalle: 'Hacienda San Andrés', monto: 3200000, fecha: '2026-05-08' },
        muerto:     { causa: 'Muerte',    detalle: 'Enfermedad — neumonía bovina', fecha: '2026-04-22' },
        robado:     { causa: 'Robo',      detalle: 'Denuncia N° 2026-441', fecha: '2026-03-15' },
        trasladado: { causa: 'Traslado',  detalle: 'Finca El Palmar', fecha: '2026-04-30' },
      }[animal.estado];
      return [{ tipo: 'salida', ...salida }, ...base];
    }
    return base;
  }, [animal]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(17,24,39,0.50)',
        animation: 'gp-fade-in .2s ease',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: GP.bg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        height: '90%',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.20)',
        animation: 'gp-slide-up .28s cubic-bezier(.2,.7,.3,1)',
        overflow: 'hidden',
      }}>
        {/* Handle */}
        <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: '#D1D5DB' }} />
        </div>

        {/* Close button */}
        <button type="button" onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, zIndex: 5,
          width: 32, height: 32, borderRadius: 999,
          background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <Icon name="x" size={16} color={GP.text} />
        </button>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {/* Hero block */}
          <div style={{ position: 'relative', padding: '12px 16px 16px' }}>
            <div style={{
              position: 'relative',
              height: 200, borderRadius: 18,
              background: `linear-gradient(135deg, ${animal.color || (animal.sexo === 'M' ? '#E9D8C4' : '#D8F3DC')} 0%, ${animal.sexo === 'M' ? '#C9A87D' : '#A7DEC0'} 100%)`,
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* placeholder animal silhouette */}
              <svg width="140" height="140" viewBox="0 0 24 24" fill="none">
                <path d="M5 8c0-1.5 1-3 2.5-3S10 6 10 8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M14 8c0-1.5 1-3 2.5-3S19 6.5 19 8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M5 8h14v5a7 7 0 0 1-14 0Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/>
                <circle cx="9.5" cy="11" r="0.7" fill="rgba(255,255,255,0.9)"/>
                <circle cx="14.5" cy="11" r="0.7" fill="rgba(255,255,255,0.9)"/>
                <path d="M10 16c.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {/* Status badge overlay */}
              <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <StatusBadge status={animal.estado} size="md" />
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.92)', padding: '6px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: GP.text, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="camera" size={12} color={GP.textSec} /> Foto placeholder
              </div>
            </div>

            {/* Name + arete */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GP.textSec, letterSpacing: 0.6 }}>
                ARETE · {animal.arete}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>
                {animal.nombre || 'Sin nombre'}
              </h2>
              <div style={{ fontSize: 13, color: GP.textSec, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span>{animal.raza}</span>
                <span style={{ width: 3, height: 3, borderRadius: 999, background: GP.textSec, opacity: 0.5 }} />
                <span>{animal.sexo === 'M' ? 'Macho' : 'Hembra'}</span>
                <span style={{ width: 3, height: 3, borderRadius: 999, background: GP.textSec, opacity: 0.5 }} />
                <span>{animal.edad}</span>
              </div>
            </div>
          </div>

          {/* Quick facts grid */}
          <div style={{ padding: '0 16px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              <Fact label="Categoría" value={animal.categoria} />
              <Fact label="Propósito" value={animal.proposito} />
              <Fact label="Lote actual" value={animal.lote} icon="pin" />
              <Fact label="Peso actual" value={animal.peso ? `${animal.peso} kg` : '—'} accent={GP.amber} />
            </div>
          </div>

          {/* Action buttons */}
          {isActive && (
            <div style={{ padding: '16px 16px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Button variant="amber" onClick={onWeigh} icon={<Icon name="weight" size={16} color="#fff" />} fullWidth>
                Pesaje
              </Button>
              <Button variant="danger" onClick={onExit} icon={<Icon name="arrowOut" size={16} color="#fff" />} fullWidth>
                Salida
              </Button>
            </div>
          )}

          {/* Timeline */}
          <div style={{ padding: '16px 16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: GP.text }}>Historial de movimientos</h3>
              <span style={{ fontSize: 12, color: GP.textSec }}>{timeline.length} eventos</span>
            </div>
            <Timeline events={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Fact = ({ label, value, accent, icon }) => (
  <div style={{
    padding: '10px 12px',
    background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 12,
  }}>
    <div style={{ fontSize: 10, fontWeight: 600, color: GP.textSec, letterSpacing: 0.4, textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
      {icon && <Icon name={icon} size={13} color={GP.textSec} />}
      <span style={{ fontSize: 14, fontWeight: 600, color: accent || GP.text }}>{value || '—'}</span>
    </div>
  </div>
);

// Vertical timeline
const Timeline = ({ events }) => {
  return (
    <div style={{ position: 'relative', paddingLeft: 0 }}>
      {events.map((e, i) => (
        <TimelineEvent key={i} event={e} last={i === events.length - 1} />
      ))}
    </div>
  );
};

const TimelineEvent = ({ event, last }) => {
  const meta = {
    ingreso: { color: GP.green, bg: GP.greenLight, label: 'Ingreso', icon: 'arrowUp' },
    pesaje:  { color: GP.amber, bg: GP.amberLight, label: 'Pesaje',  icon: 'weight' },
    salida:  { color: GP.red,   bg: GP.redLight,   label: 'Salida',  icon: 'arrowOut' },
  }[event.tipo];
  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: last ? 0 : 14 }}>
      {/* Dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: meta.bg, border: `2px solid ${meta.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          <Icon name={meta.icon} size={14} color={meta.color} strokeWidth={2.2} />
        </div>
        {!last && (
          <div style={{ width: 2, flex: 1, background: GP.border, marginTop: 2 }} />
        )}
      </div>

      {/* Card */}
      <div style={{
        flex: 1, padding: '10px 12px',
        background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, letterSpacing: 0.3, textTransform: 'uppercase' }}>
            {event.tipo === 'salida' ? `Salida · ${event.causa}` : meta.label}
          </span>
          <span style={{ fontSize: 11, color: GP.textSec, fontWeight: 500 }}>
            {fmtDate(event.fecha)}
          </span>
        </div>
        {event.tipo === 'pesaje' && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: GP.text }}>
              {event.peso} <span style={{ fontSize: 12, color: GP.textSec, fontWeight: 500 }}>kg</span>
            </div>
            <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>{event.motivo}</div>
            {event.nota && <div style={{ fontSize: 12, color: GP.text, marginTop: 4, padding: '6px 8px', background: GP.borderSoft, borderRadius: 6 }}>{event.nota}</div>}
          </>
        )}
        {event.tipo === 'ingreso' && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{event.origen}</div>
            <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>
              Peso ingreso: <strong style={{ color: GP.text }}>{event.peso} kg</strong>
              {event.precio && <> · Precio: <strong style={{ color: GP.text }}>${(event.precio / 1000000).toFixed(2)}M</strong></>}
            </div>
          </>
        )}
        {event.tipo === 'salida' && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{event.detalle}</div>
            {event.monto && <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>Monto: <strong style={{ color: GP.text }}>${(event.monto / 1000000).toFixed(2)}M</strong></div>}
          </>
        )}
      </div>
    </div>
  );
};

function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

Object.assign(window, { AnimalDetail });
