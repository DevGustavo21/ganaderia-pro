// Inventory list screen — mobile
const InventoryScreen = ({ onOpenAnimal, onNewAnimal, finca, onSwitchFinca, fincas, _initialQuery = '' }) => {
  const [query, setQuery] = React.useState(_initialQuery);
  const [filter, setFilter] = React.useState('todos');
  const [fincaOpen, setFincaOpen] = React.useState(false);

  const filtered = ANIMALS.filter(a => {
    if (filter !== 'todos' && a.estado !== filter) return false;
    if (query && !(`${a.arete} ${a.nombre} ${a.raza}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  const filterOpts = [
    { key: 'todos', label: 'Todos', count: ANIMALS.length },
    { key: 'activo', label: 'Activo', count: ANIMALS.filter(a => a.estado === 'activo').length },
    { key: 'vendido', label: 'Vendido', count: ANIMALS.filter(a => a.estado === 'vendido').length },
    { key: 'muerto', label: 'Muerto', count: ANIMALS.filter(a => a.estado === 'muerto').length },
    { key: 'robado', label: 'Robado', count: ANIMALS.filter(a => a.estado === 'robado').length },
    { key: 'trasladado', label: 'Trasladado', count: ANIMALS.filter(a => a.estado === 'trasladado').length },
  ];

  return (
    <div style={{ background: GP.bg, minHeight: '100%', position: 'relative' }}>
      {/* Sticky finca header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: GP.white,
        borderBottom: `1px solid ${GP.border}`,
      }}>
        <div style={{ padding: '12px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            type="button"
            onClick={() => setFincaOpen(o => !o)}
            style={{
              flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10,
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              textAlign: 'left',
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: GP.greenLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="leaf" size={18} color={GP.green} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: GP.textSec, letterSpacing: 0.6, textTransform: 'uppercase' }}>Finca activa</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: GP.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {finca.nombre}
                </span>
                <Icon name="chevD" size={14} color={GP.textSec} />
              </div>
            </div>
          </button>
          <button type="button" style={{
            position: 'relative', width: 40, height: 40, borderRadius: 10,
            background: GP.greenLight, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="bell" size={18} color={GP.green} />
            <span style={{
              position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 999,
              background: GP.amber, border: `1.5px solid ${GP.greenLight}`,
            }} />
          </button>
        </div>

        {/* Finca selector dropdown */}
        {fincaOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 16, right: 16,
            background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 14,
            boxShadow: '0 16px 40px rgba(0,0,0,0.12)', padding: 6, zIndex: 30,
          }}>
            {fincas.map(f => (
              <button key={f.id} type="button"
                onClick={() => { onSwitchFinca(f); setFincaOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: f.id === finca.id ? GP.greenLight : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>
                <Icon name="pin" size={16} color={f.id === finca.id ? GP.green : GP.textSec} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{f.nombre}</div>
                  <div style={{ fontSize: 11, color: GP.textSec }}>{f.hectareas} ha · {f.ubicacion}</div>
                </div>
                {f.id === finca.id && <Icon name="check" size={16} color={GP.green} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title + register CTA */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            margin: 0, fontSize: 24, fontWeight: 700, color: GP.text,
            letterSpacing: -0.4,
          }}>Inventario</h1>
          <div style={{ fontSize: 13, color: GP.textSec, marginTop: 2 }}>
            {METRICS.totalActivos} animales activos
          </div>
        </div>
      </div>

      {/* Metric chips — horizontal scroll */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 16px 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        <MetricChip label="Activos" value={METRICS.totalActivos} sub="cab." accent={GP.green} />
        <MetricChip label="Hembras" value={METRICS.hembras} sub="cab." accent={GP.greenMid} />
        <MetricChip label="Peso total" value={(METRICS.pesoTotal / 1000).toFixed(1)} sub="ton" accent={GP.amber} />
        <MetricChip label="Salidas/mes" value={METRICS.salidasMes} sub="cab." accent={GP.red} />
      </div>

      {/* Search */}
      <div style={{ padding: '4px 16px 8px' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por arete, nombre o raza" />
      </div>

      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 8, padding: '4px 16px 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {filterOpts.map(o => (
          <Pill key={o.key} size="sm" active={filter === o.key} onClick={() => setFilter(o.key)}>
            {o.label} <span style={{ opacity: 0.7, fontWeight: 500 }}>· {o.count}</span>
          </Pill>
        ))}
      </div>

      {/* Animal cards */}
      <div style={{ padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{
            padding: '40px 16px', textAlign: 'center', color: GP.textSec, fontSize: 14,
            background: GP.white, borderRadius: 14, border: `1px dashed ${GP.border}`,
          }}>
            <Icon name="search" size={28} color={GP.textSec} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: GP.text, marginBottom: 4 }}>Sin resultados</div>
            <div>No encontramos animales con esos criterios.</div>
          </div>
        )}

        {filtered.map(a => (
          <button key={a.id} type="button" onClick={() => onOpenAnimal(a)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px',
              background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 14,
              cursor: 'pointer', textAlign: 'left',
              width: '100%', fontFamily: GP.font,
              minHeight: 72,
            }}>
            <AnimalAvatar animal={a} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: GP.textSec, letterSpacing: 0.4 }}>
                  {a.arete}
                </span>
                <StatusBadge status={a.estado} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: GP.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {a.nombre || 'Sin nombre'}
              </div>
              <div style={{ fontSize: 12, color: GP.textSec, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{a.categoria}</span>
                <span style={{ width: 3, height: 3, borderRadius: 999, background: GP.textSec, opacity: 0.5 }} />
                <span>{a.raza}</span>
              </div>
            </div>
            <Icon name="chevR" size={16} color={GP.textSec} />
          </button>
        ))}
      </div>

      {/* FAB */}
      <button type="button" onClick={onNewAnimal} style={{
        position: 'absolute', bottom: 96, right: 16,
        width: 56, height: 56, borderRadius: 999,
        background: GP.green, border: 'none', cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(45,106,79,0.40), 0 2px 6px rgba(45,106,79,0.20)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: GP.white, zIndex: 25,
      }}>
        <Icon name="plus" size={24} color="#fff" strokeWidth={2.2} />
      </button>
    </div>
  );
};

// Bottom navigation bar — sticky, four tabs
const BottomNav = ({ active, onChange }) => {
  const tabs = [
    { key: 'inventario', label: 'Inventario', icon: 'cow' },
    { key: 'finca', label: 'Finca', icon: 'leaf' },
    { key: 'reportes', label: 'Reportes', icon: 'chart', disabled: true },
    { key: 'perfil', label: 'Perfil', icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      background: GP.white,
      borderTop: `1px solid ${GP.border}`,
      paddingBottom: 18, // safe-area-ish
      paddingTop: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {tabs.map(t => {
          const isActive = active === t.key;
          const color = t.disabled ? '#D1D5DB' : (isActive ? GP.green : GP.textSec);
          return (
            <button key={t.key}
              type="button"
              onClick={() => !t.disabled && onChange(t.key)}
              disabled={t.disabled}
              style={{
                flex: 1, padding: '8px 4px 4px',
                background: 'transparent', border: 'none',
                cursor: t.disabled ? 'not-allowed' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                position: 'relative',
              }}>
              <Icon name={t.icon} size={22} color={color} strokeWidth={isActive ? 2 : 1.75} />
              <span style={{
                fontSize: 10, fontWeight: isActive ? 600 : 500, color,
                letterSpacing: 0.1,
              }}>{t.label}</span>
              {t.disabled && (
                <span style={{
                  position: 'absolute', top: 4, right: '50%', transform: 'translateX(22px)',
                  fontSize: 8, padding: '1px 4px', borderRadius: 4,
                  background: '#E5E7EB', color: '#6B7280', fontWeight: 600,
                  letterSpacing: 0.3,
                }}>PRONTO</span>
              )}
              {isActive && (
                <span style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 24, height: 3, borderRadius: 999, background: GP.green,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

Object.assign(window, { InventoryScreen, BottomNav });
