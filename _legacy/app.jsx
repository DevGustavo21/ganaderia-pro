// Main mobile app shell — manages screen state and renders into iOS frame
const MobileApp = ({ initialScreen = 'inventory', initialAnimal = null, initialFinca = FINCAS[0] }) => {
  const [screen, setScreen] = React.useState(initialScreen);
  // screen: 'inventory' | 'wizard' | 'detail' | 'exit' | 'profile' | 'finca'
  const [selected, setSelected] = React.useState(initialAnimal);
  const [tab, setTab] = React.useState('inventario');
  const [finca, setFinca] = React.useState(initialFinca);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: GP.bg,
      fontFamily: GP.font, color: GP.text,
      overflow: 'hidden',
    }}>
      {/* Main scrollable area */}
      <div style={{ position: 'absolute', inset: 0, paddingBottom: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'inventario' && (
          <InventoryScreen
            finca={finca}
            fincas={FINCAS}
            onSwitchFinca={setFinca}
            onOpenAnimal={a => { setSelected(a); setScreen('detail'); }}
            onNewAnimal={() => setScreen('wizard')}
          />
        )}
        {tab === 'finca' && <FincaScreen finca={finca} />}
        {tab === 'perfil' && <PerfilScreen />}
      </div>

      {/* Bottom nav */}
      <BottomNav active={tab} onChange={setTab} />

      {/* Overlays */}
      {screen === 'wizard' && (
        <RegisterWizard
          onClose={() => setScreen('inventory')}
          onSubmit={() => setScreen('inventory')}
        />
      )}
      {screen === 'detail' && selected && (
        <AnimalDetail
          animal={selected}
          onClose={() => { setScreen('inventory'); }}
          onExit={() => setScreen('exit')}
          onWeigh={() => {}}
        />
      )}
      {screen === 'exit' && selected && (
        <ExitForm
          animal={selected}
          onClose={() => setScreen('detail')}
          onConfirm={() => setScreen('inventory')}
        />
      )}
    </div>
  );
};

// Light placeholder screens for Finca + Perfil tabs
const FincaScreen = ({ finca }) => (
  <div style={{ padding: '20px 16px 120px' }}>
    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>Mi finca</h1>
    <div style={{ fontSize: 13, color: GP.textSec, marginTop: 4, marginBottom: 18 }}>Información general y lotes</div>

    {/* Finca card */}
    <div style={{
      background: `linear-gradient(135deg, ${GP.green} 0%, ${GP.greenDeep} 100%)`,
      borderRadius: 18, padding: 20, color: '#fff',
      marginBottom: 16,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, letterSpacing: 0.6, textTransform: 'uppercase' }}>Finca activa</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: -0.3 }}>{finca.nombre}</div>
      <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{finca.ubicacion} · {finca.hectareas} hectáreas</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 18 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Animales</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{METRICS.totalActivos}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Lotes</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>5</div>
        </div>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Carga</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>0.8<span style={{ fontSize: 11, opacity: 0.7, fontWeight: 500 }}> ua/ha</span></div>
        </div>
      </div>
    </div>

    <h3 style={{ fontSize: 13, fontWeight: 700, color: GP.textSec, letterSpacing: 0.4, textTransform: 'uppercase', margin: '20px 0 10px' }}>Lotes</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { name: 'Potrero Norte', animals: 5, ha: 38, color: GP.greenMid },
        { name: 'Potrero Sur',   animals: 1, ha: 42, color: GP.greenMid },
        { name: 'Cerca del río', animals: 2, ha: 31, color: GP.amber },
        { name: 'Maternidad',    animals: 2, ha: 18, color: GP.green },
      ].map(l => (
        <div key={l.name} style={{
          padding: '14px 14px',
          background: GP.white, borderRadius: 12, border: `1px solid ${GP.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 4, height: 36, borderRadius: 999, background: l.color }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{l.name}</div>
            <div style={{ fontSize: 11, color: GP.textSec, marginTop: 2 }}>{l.ha} ha · {l.animals} animales</div>
          </div>
          <Icon name="chevR" size={14} color={GP.textSec} />
        </div>
      ))}
    </div>
  </div>
);

const PerfilScreen = () => (
  <div style={{ padding: '20px 16px 120px' }}>
    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>Perfil</h1>

    <div style={{
      marginTop: 18, padding: '20px 16px',
      background: GP.white, borderRadius: 16, border: `1px solid ${GP.border}`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 999, background: GP.green, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 20,
      }}>CR</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: GP.text }}>Carlos Ramírez</div>
        <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>carlos@hacienda-esperanza.co</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
          padding: '2px 8px', borderRadius: 999, background: GP.greenLight,
          fontSize: 10, fontWeight: 700, color: GP.greenDeep, letterSpacing: 0.4,
        }}>
          <Icon name="check" size={10} color={GP.greenDeep} strokeWidth={2.5} /> PLAN PRO
        </div>
      </div>
    </div>

    <h3 style={{ fontSize: 13, fontWeight: 700, color: GP.textSec, letterSpacing: 0.4, textTransform: 'uppercase', margin: '20px 0 10px' }}>Cuenta</h3>
    <div style={{ display: 'flex', flexDirection: 'column', background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`, overflow: 'hidden' }}>
      {[
        { label: 'Mis fincas', icon: 'leaf', meta: '3' },
        { label: 'Suscripción', icon: 'doc', meta: 'Pro' },
        { label: 'Notificaciones', icon: 'bell', meta: '8 nuevas' },
        { label: 'Configuración', icon: 'settings' },
      ].map((row, i, arr) => (
        <button key={row.label} type="button" style={{
          height: 52, padding: '0 16px',
          background: 'transparent', border: 'none',
          borderBottom: i < arr.length - 1 ? `1px solid ${GP.borderSoft}` : 'none',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', fontFamily: GP.font,
          textAlign: 'left',
        }}>
          <Icon name={row.icon} size={18} color={GP.green} />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: GP.text }}>{row.label}</span>
          {row.meta && <span style={{ fontSize: 12, color: GP.textSec }}>{row.meta}</span>}
          <Icon name="chevR" size={14} color={GP.textSec} />
        </button>
      ))}
    </div>
  </div>
);

Object.assign(window, { MobileApp });
