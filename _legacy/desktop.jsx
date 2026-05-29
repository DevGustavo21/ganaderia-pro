// Desktop layout — sidebar + table + metrics + side panel
const DesktopApp = () => {
  const [selected, setSelected] = React.useState(ANIMALS[0]);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('todos');
  const [finca, setFinca] = React.useState(FINCAS[0]);

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
    <div style={{
      width: '100%', height: '100%',
      background: GP.bg, fontFamily: GP.font,
      display: 'flex',
    }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DesktopHeader finca={finca} setFinca={setFinca} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Center column */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: GP.text, letterSpacing: -0.5 }}>Inventario</h1>
                <div style={{ fontSize: 13, color: GP.textSec, marginTop: 4 }}>
                  Gestiona los animales de {finca.nombre}
                </div>
              </div>
              <Button variant="primary" icon={<Icon name="plus" size={16} color="#fff" strokeWidth={2.2} />}>
                Registrar animal
              </Button>
            </div>

            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              <BigMetric label="Total activos" value={METRICS.totalActivos} suffix="cab." accent={GP.green} trend="+4 este mes" icon="cow" />
              <BigMetric label="Hembras" value={METRICS.hembras} suffix="cab." accent={GP.greenMid} trend={`${Math.round(METRICS.hembras / METRICS.totalActivos * 100)}% del hato`} icon="cow" />
              <BigMetric label="Peso total" value={(METRICS.pesoTotal / 1000).toFixed(1)} suffix="ton" accent={GP.amber} trend="Promedio 437 kg" icon="weight" />
              <BigMetric label="Salidas del mes" value={METRICS.salidasMes} suffix="cab." accent={GP.red} trend="2 ventas · 1 muerte" icon="arrowOut" />
            </div>

            {/* Controls row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
              <div style={{ flex: 1, maxWidth: 360 }}>
                <SearchInput value={query} onChange={setQuery} placeholder="Buscar por arete, nombre o raza" />
              </div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                {filterOpts.map(o => (
                  <Pill key={o.key} size="sm" active={filter === o.key} onClick={() => setFilter(o.key)}>
                    {o.label} <span style={{ opacity: 0.7, fontWeight: 500 }}>· {o.count}</span>
                  </Pill>
                ))}
              </div>
            </div>

            {/* Table */}
            <DataTable rows={filtered} selected={selected} onSelect={setSelected} />
          </div>

          {/* Right side panel */}
          {selected && <DetailSidePanel animal={selected} onClose={() => setSelected(null)} />}
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const modules = [
    { key: 'inv', label: 'Inventario', icon: 'cow', active: true },
    { key: 'rep', label: 'Reproducción', icon: 'sync', soon: true },
    { key: 'san', label: 'Sanidad', icon: 'droplet', soon: true },
    { key: 'pro', label: 'Producción', icon: 'chart', soon: true },
  ];
  const secondary = [
    { key: 'finca', label: 'Mis fincas', icon: 'leaf' },
    { key: 'config', label: 'Configuración', icon: 'settings' },
  ];
  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: GP.white,
      borderRight: `1px solid ${GP.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 24px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: GP.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="leaf" size={20} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: GP.text, letterSpacing: -0.2 }}>GanaderíaPro</div>
          <div style={{ fontSize: 10, color: GP.textSec, fontWeight: 500 }}>v0.4 · beta</div>
        </div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: GP.textSec, letterSpacing: 0.6, padding: '0 12px 6px', textTransform: 'uppercase' }}>Módulos</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {modules.map(m => (
          <SidebarItem key={m.key} {...m} />
        ))}
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: GP.textSec, letterSpacing: 0.6, padding: '20px 12px 6px', textTransform: 'uppercase' }}>Cuenta</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {secondary.map(m => <SidebarItem key={m.key} {...m} />)}
      </div>

      {/* Storage / sync card */}
      <div style={{ marginTop: 'auto', padding: 12, background: GP.greenLight, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="sync" size={14} color={GP.green} />
          <span style={{ fontSize: 12, fontWeight: 600, color: GP.greenDeep }}>Sincronizado</span>
        </div>
        <div style={{ fontSize: 11, color: GP.greenDeep, opacity: 0.8, lineHeight: 1.4 }}>
          Última sync: hace 4 min · 12 cambios pendientes en cola offline
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, icon, active, soon }) => (
  <button type="button" disabled={soon} style={{
    height: 40, padding: '0 12px', borderRadius: 10,
    background: active ? GP.greenLight : 'transparent',
    border: 'none', cursor: soon ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', gap: 10,
    color: soon ? '#D1D5DB' : (active ? GP.greenDeep : GP.text),
    fontFamily: GP.font, fontSize: 14, fontWeight: active ? 600 : 500,
    textAlign: 'left',
  }}>
    <Icon name={icon} size={17} color="currentColor" strokeWidth={active ? 2 : 1.75} />
    <span style={{ flex: 1 }}>{label}</span>
    {soon && (
      <span style={{
        fontSize: 9, padding: '2px 6px', borderRadius: 4,
        background: GP.borderSoft, color: GP.textSec, fontWeight: 700, letterSpacing: 0.3,
      }}>PRONTO</span>
    )}
  </button>
);

const DesktopHeader = ({ finca, setFinca }) => (
  <div style={{
    height: 64, flexShrink: 0,
    background: GP.white, borderBottom: `1px solid ${GP.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px',
  }}>
    {/* Finca selector */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon name="pin" size={16} color={GP.textSec} />
      <select
        value={finca.id}
        onChange={e => setFinca(FINCAS.find(f => f.id === e.target.value))}
        style={{
          fontFamily: GP.font, fontSize: 14, fontWeight: 600, color: GP.text,
          border: 'none', background: 'transparent', cursor: 'pointer',
          padding: 0, outline: 'none',
        }}>
        {FINCAS.map(f => <option key={f.id} value={f.id}>{f.nombre} · {f.hectareas} ha</option>)}
      </select>
    </div>

    {/* Right cluster */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button type="button" style={{
        width: 40, height: 40, borderRadius: 10, border: 'none',
        background: GP.borderSoft, cursor: 'pointer',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="bell" size={17} color={GP.text} />
        <span style={{
          position: 'absolute', top: 8, right: 9, width: 8, height: 8,
          borderRadius: 999, background: GP.amber, border: `1.5px solid ${GP.borderSoft}`,
        }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 6px', borderRadius: 999, background: GP.borderSoft }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: GP.green, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>CR</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: GP.text, lineHeight: 1 }}>Carlos Ramírez</div>
          <div style={{ fontSize: 11, color: GP.textSec, marginTop: 2 }}>Propietario</div>
        </div>
      </div>
    </div>
  </div>
);

const BigMetric = ({ label, value, suffix, accent, trend, icon }) => (
  <div style={{
    padding: 18,
    background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: GP.textSec, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</span>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: accent + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={16} color={accent} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 28, fontWeight: 700, color: GP.text, letterSpacing: -0.5 }}>{value}</span>
      <span style={{ fontSize: 13, color: GP.textSec, fontWeight: 500 }}>{suffix}</span>
    </div>
    <div style={{ fontSize: 11, color: GP.textSec, marginTop: 6, fontWeight: 500 }}>{trend}</div>
  </div>
);

const DataTable = ({ rows, selected, onSelect }) => (
  <div style={{
    background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`, overflow: 'hidden',
  }}>
    {/* Header */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '56px 110px 1fr 110px 130px 100px 90px 60px',
      gap: 12, padding: '12px 18px',
      background: '#FAFBFC',
      borderBottom: `1px solid ${GP.border}`,
      fontSize: 11, fontWeight: 700, color: GP.textSec, letterSpacing: 0.4, textTransform: 'uppercase',
    }}>
      <span></span>
      <span>Arete</span>
      <span>Nombre · Raza</span>
      <span>Categoría</span>
      <span>Estado</span>
      <span>Edad</span>
      <span style={{ textAlign: 'right' }}>Peso</span>
      <span></span>
    </div>

    {/* Rows */}
    {rows.map(a => {
      const isSel = selected?.id === a.id;
      return (
        <button key={a.id} type="button" onClick={() => onSelect(a)} style={{
          width: '100%', textAlign: 'left',
          display: 'grid',
          gridTemplateColumns: '56px 110px 1fr 110px 130px 100px 90px 60px',
          gap: 12, padding: '10px 18px',
          background: isSel ? GP.greenLight + '70' : 'transparent',
          border: 'none', borderBottom: `1px solid ${GP.borderSoft}`,
          cursor: 'pointer', alignItems: 'center',
          fontFamily: GP.font,
        }}>
          <AnimalAvatar animal={a} size={40} />
          <span style={{ fontSize: 13, fontWeight: 600, color: GP.text, letterSpacing: 0.3 }}>{a.arete}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{a.nombre || 'Sin nombre'}</div>
            <div style={{ fontSize: 12, color: GP.textSec, marginTop: 1 }}>{a.raza}</div>
          </div>
          <span style={{ fontSize: 12, color: GP.text }}>{a.categoria}</span>
          <span><StatusBadge status={a.estado} /></span>
          <span style={{ fontSize: 13, color: GP.text }}>{a.edad}</span>
          <span style={{ fontSize: 13, color: GP.text, textAlign: 'right', fontWeight: 600 }}>{a.peso ? a.peso + ' kg' : '—'}</span>
          <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Icon name="chevR" size={14} color={GP.textSec} />
          </span>
        </button>
      );
    })}
  </div>
);

const DetailSidePanel = ({ animal, onClose }) => {
  const isActive = animal.estado === 'activo';
  return (
    <div style={{
      width: 400, flexShrink: 0,
      background: GP.white,
      borderLeft: `1px solid ${GP.border}`,
      overflowY: 'auto',
    }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        height: 200,
        background: `linear-gradient(135deg, ${animal.color || (animal.sexo === 'M' ? '#E9D8C4' : '#D8F3DC')} 0%, ${animal.sexo === 'M' ? '#C9A87D' : '#A7DEC0'} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <path d="M5 8c0-1.5 1-3 2.5-3S10 6 10 8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M14 8c0-1.5 1-3 2.5-3S19 6.5 19 8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M5 8h14v5a7 7 0 0 1-14 0Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/>
          <circle cx="9.5" cy="11" r="0.7" fill="#fff"/>
          <circle cx="14.5" cy="11" r="0.7" fill="#fff"/>
        </svg>
        <div style={{ position: 'absolute', top: 14, left: 14 }}><StatusBadge status={animal.estado} size="md" /></div>
        <button type="button" onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          width: 32, height: 32, borderRadius: 999,
          background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="x" size={14} color={GP.text} />
        </button>
      </div>

      <div style={{ padding: '18px 22px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: GP.textSec, letterSpacing: 0.6 }}>ARETE · {animal.arete}</div>
        <h2 style={{ margin: '4px 0 4px', fontSize: 22, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>{animal.nombre || 'Sin nombre'}</h2>
        <div style={{ fontSize: 13, color: GP.textSec, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{animal.raza}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: GP.textSec, opacity: 0.5 }} />
          <span>{animal.sexo === 'M' ? 'Macho' : 'Hembra'}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: GP.textSec, opacity: 0.5 }} />
          <span>{animal.edad}</span>
        </div>

        {/* facts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          <Fact label="Categoría" value={animal.categoria} />
          <Fact label="Propósito" value={animal.proposito} />
          <Fact label="Lote actual" value={animal.lote} icon="pin" />
          <Fact label="Peso actual" value={animal.peso ? `${animal.peso} kg` : '—'} accent={GP.amber} />
        </div>

        {isActive && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <Button variant="amber" icon={<Icon name="weight" size={16} color="#fff" />} fullWidth>Pesaje</Button>
            <Button variant="danger" icon={<Icon name="arrowOut" size={16} color="#fff" />} fullWidth>Salida</Button>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: GP.text }}>Historial</h3>
            <span style={{ fontSize: 11, color: GP.textSec }}>4 eventos</span>
          </div>
          <Timeline events={[
            { tipo: 'pesaje', fecha: '2026-04-12', peso: animal.peso, motivo: 'Control rutinario' },
            { tipo: 'pesaje', fecha: '2026-01-18', peso: Math.max(0, animal.peso - 16), motivo: 'Post-vacunación' },
            { tipo: 'pesaje', fecha: '2025-10-04', peso: Math.max(0, animal.peso - 24), motivo: 'Control rutinario' },
            { tipo: 'ingreso', fecha: animal.ingreso || '2022-03-14', peso: Math.max(60, animal.peso - 160), origen: animal.origen || 'Compra', precio: animal.precio },
          ]} />
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DesktopApp });
