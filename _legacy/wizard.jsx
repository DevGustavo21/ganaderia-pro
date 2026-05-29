// Registration wizard — 3 steps
const RegisterWizard = ({ onClose, onSubmit }) => {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    arete: '', nombre: '', raza: '', sexo: '', fechaNac: '', color: '',
    categoria: '', proposito: '', lote: '',
    tipoIngreso: '', fechaIngreso: '', proveedor: '', madre: '', peso: '', precio: '', documento: '', notas: '',
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const steps = ['Identificación', 'Categoría', 'Origen'];
  const canNext = (
    (step === 0 && data.arete && data.raza && data.sexo && data.fechaNac) ||
    (step === 1 && data.categoria && data.proposito) ||
    (step === 2 && data.tipoIngreso && data.fechaIngreso && data.peso)
  );

  return (
    <div style={{
      position: 'absolute', inset: 0, background: GP.bg,
      display: 'flex', flexDirection: 'column', zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        background: GP.white,
        padding: '16px 16px 0',
        borderBottom: `1px solid ${GP.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: GP.borderSoft, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={18} color={GP.text} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: GP.textSec, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Paso {step + 1} de 3
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: GP.text }}>
              {steps[step]}
            </h2>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 8, paddingBottom: 14 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                height: 3, borderRadius: 999,
                background: i <= step ? GP.green : GP.border,
                transition: 'background .2s',
              }} />
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: i <= step ? GP.green : GP.textSec,
                letterSpacing: 0.3, textTransform: 'uppercase',
              }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step body — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>
        {step === 0 && <Step1 data={data} set={set} />}
        {step === 1 && <Step2 data={data} set={set} />}
        {step === 2 && <Step3 data={data} set={set} />}
      </div>

      {/* Footer actions */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: GP.white, borderTop: `1px solid ${GP.border}`,
        padding: '12px 16px 28px',
        display: 'flex', gap: 10,
      }}>
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} style={{ flex: '0 0 auto' }}>
            <Icon name="chevL" size={16} /> Anterior
          </Button>
        )}
        <Button
          variant="primary"
          disabled={!canNext}
          onClick={() => {
            if (step < 2) setStep(s => s + 1);
            else onSubmit(data);
          }}
          fullWidth
          style={{ flex: 1 }}>
          {step < 2 ? <>Siguiente <Icon name="chevR" size={16} color="#fff" /></> : <><Icon name="check" size={16} color="#fff" /> Guardar animal</>}
        </Button>
      </div>
    </div>
  );
};

// ─── Step 1 — Identification
const Step1 = ({ data, set }) => {
  const edad = data.fechaNac ? calcAge(data.fechaNac) : '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Número de arete" required hint="Identificador único del animal">
        <Input value={data.arete} onChange={v => set('arete', v.toUpperCase())} placeholder="CO-0000" large prefix="🏷" />
      </Field>

      <Field label="Nombre / alias" hint="Opcional — facilita reconocimiento">
        <Input value={data.nombre} onChange={v => set('nombre', v)} placeholder="Ej. Margarita" />
      </Field>

      <Field label="Sexo" required>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <SexPill active={data.sexo === 'H'} sex="H" onClick={() => set('sexo', 'H')} />
          <SexPill active={data.sexo === 'M'} sex="M" onClick={() => set('sexo', 'M')} />
        </div>
      </Field>

      <Field label="Raza" required>
        <Select value={data.raza} onChange={v => set('raza', v)} options={RAZAS} placeholder="Seleccionar raza" />
      </Field>

      <Field label="Fecha de nacimiento" required hint={edad ? `Edad calculada: ${edad}` : 'Aproximada si no se conoce'}>
        <Input value={data.fechaNac} onChange={v => set('fechaNac', v)} placeholder="DD/MM/AAAA" type="date" />
      </Field>

      <Field label="Color y señas" hint="Marcas, manchas, características distintivas">
        <Textarea value={data.color} onChange={v => set('color', v)} placeholder="Ej. Blanco con manchas negras en cuello y patas traseras" rows={2} />
      </Field>

      <Field label="Foto">
        <PhotoSlot />
      </Field>
    </div>
  );
};

// ─── Step 2 — Category
const Step2 = ({ data, set }) => {
  const cats = data.sexo === 'M' ? CATEGORIAS_M : CATEGORIAS_H;
  const propositos = ['Leche', 'Carne', 'Doble propósito', 'Reproductor'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Recap card */}
      <div style={{
        padding: '12px', background: GP.greenLight, borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="info" size={18} color={GP.green} />
        <div style={{ fontSize: 12, color: GP.greenDeep, lineHeight: 1.4 }}>
          Categorías filtradas para <strong>{data.sexo === 'M' ? 'macho' : 'hembra'}</strong>. Cambia el sexo en el paso anterior si es necesario.
        </div>
      </div>

      <Field label="Categoría" required>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cats.map(c => (
            <Pill key={c} active={data.categoria === c} onClick={() => set('categoria', c)}>
              {c}
            </Pill>
          ))}
        </div>
      </Field>

      <Field label="Propósito" required>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {propositos.map(p => (
            <PurposeCard key={p} active={data.proposito === p} onClick={() => set('proposito', p)} label={p} />
          ))}
        </div>
      </Field>

      <Field label="Lote / potrero" hint="Opcional — puedes asignarlo después">
        <Select value={data.lote} onChange={v => set('lote', v)} options={LOTES} placeholder="Sin asignar" />
      </Field>
    </div>
  );
};

// ─── Step 3 — Origin
const Step3 = ({ data, set }) => {
  const tipos = [
    { key: 'Nacimiento', icon: 'leaf' },
    { key: 'Compra', icon: 'doc' },
    { key: 'Donación', icon: 'sync' },
    { key: 'Traslado', icon: 'arrowOut' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Tipo de ingreso" required>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {tipos.map(t => (
            <button key={t.key} type="button" onClick={() => set('tipoIngreso', t.key)}
              style={{
                height: 64, borderRadius: 14, cursor: 'pointer',
                border: `1.5px solid ${data.tipoIngreso === t.key ? GP.green : GP.border}`,
                background: data.tipoIngreso === t.key ? GP.greenLight : GP.white,
                display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
                fontFamily: GP.font,
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: data.tipoIngreso === t.key ? GP.green : GP.borderSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: data.tipoIngreso === t.key ? '#fff' : GP.text,
              }}>
                <Icon name={t.icon} size={18} color="currentColor" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: data.tipoIngreso === t.key ? GP.greenDeep : GP.text }}>
                {t.key}
              </span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Fecha de ingreso" required>
        <Input value={data.fechaIngreso} onChange={v => set('fechaIngreso', v)} type="date" />
      </Field>

      {/* Conditional fields with smooth reveal */}
      <ConditionalField show={data.tipoIngreso === 'Nacimiento'}>
        <Field label="Madre" hint="Selecciona del inventario o ingresa manualmente">
          <Input value={data.madre} onChange={v => set('madre', v)} placeholder="Arete o nombre de la madre" />
        </Field>
      </ConditionalField>

      <ConditionalField show={['Compra', 'Donación', 'Traslado'].includes(data.tipoIngreso)}>
        <Field label={data.tipoIngreso === 'Donación' ? 'Donante' : data.tipoIngreso === 'Traslado' ? 'Finca de origen' : 'Proveedor'} required>
          <Input value={data.proveedor} onChange={v => set('proveedor', v)} placeholder="Nombre o NIT" />
        </Field>
      </ConditionalField>

      <Field label="Peso al ingreso" required>
        <Input value={data.peso} onChange={v => set('peso', v)} type="number" placeholder="0" suffix="kg" />
      </Field>

      <ConditionalField show={data.tipoIngreso === 'Compra'}>
        <Field label="Precio de compra">
          <Input value={data.precio} onChange={v => set('precio', v)} type="number" placeholder="0" prefix="$" />
        </Field>
      </ConditionalField>

      <ConditionalField show={['Compra', 'Traslado'].includes(data.tipoIngreso)}>
        <Field label="Documento / guía" hint="Guía de movilización o factura">
          <Input value={data.documento} onChange={v => set('documento', v)} placeholder="N° de guía" />
        </Field>
      </ConditionalField>

      <Field label="Observaciones">
        <Textarea value={data.notas} onChange={v => set('notas', v)} placeholder="Notas adicionales sobre el ingreso del animal…" rows={3} />
      </Field>
    </div>
  );
};

// ─── Helpers
const ConditionalField = ({ show, children }) => (
  <div style={{
    maxHeight: show ? 200 : 0,
    overflow: 'hidden',
    opacity: show ? 1 : 0,
    transition: 'max-height .25s ease, opacity .2s ease, margin .25s ease',
    marginTop: show ? 0 : -16,
  }}>
    {children}
  </div>
);

const SexPill = ({ active, sex, onClick }) => {
  const isH = sex === 'H';
  return (
    <button type="button" onClick={onClick} style={{
      height: 64, borderRadius: 14, cursor: 'pointer',
      border: `1.5px solid ${active ? (isH ? GP.green : GP.earth) : GP.border}`,
      background: active ? (isH ? GP.greenLight : GP.earthLight) : GP.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontFamily: GP.font,
    }}>
      <Icon name={isH ? 'cow' : 'bull'} size={26} color={active ? (isH ? GP.green : GP.earth) : GP.textSec} strokeWidth={2} />
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: active ? (isH ? GP.greenDeep : '#5C3D1F') : GP.text }}>
          {isH ? 'Hembra' : 'Macho'}
        </div>
        <div style={{ fontSize: 11, color: GP.textSec, marginTop: 1 }}>
          {isH ? 'Vaca / Vaquillona' : 'Toro / Novillo'}
        </div>
      </div>
    </button>
  );
};

const PurposeCard = ({ active, onClick, label }) => {
  const colors = {
    'Leche':           { bg: GP.greenLight, fg: GP.greenDeep, accent: GP.green, icon: 'droplet' },
    'Carne':           { bg: GP.earthLight, fg: '#5C3D1F', accent: GP.earth, icon: 'cow' },
    'Doble propósito': { bg: '#F3E8FF', fg: '#5B21B6', accent: '#8B5CF6', icon: 'sync' },
    'Reproductor':     { bg: GP.amberLight, fg: '#8A4F1B', accent: GP.amber, icon: 'bull' },
  };
  const c = colors[label];
  return (
    <button type="button" onClick={onClick} style={{
      height: 72, borderRadius: 14, cursor: 'pointer',
      border: `1.5px solid ${active ? c.accent : GP.border}`,
      background: active ? c.bg : GP.white,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
      padding: '0 14px', gap: 4,
      fontFamily: GP.font,
    }}>
      <Icon name={c.icon} size={20} color={active ? c.accent : GP.textSec} />
      <span style={{ fontSize: 13, fontWeight: 600, color: active ? c.fg : GP.text }}>
        {label}
      </span>
    </button>
  );
};

const PhotoSlot = () => (
  <button type="button" style={{
    width: '100%', height: 120, borderRadius: 14,
    border: `1.5px dashed ${GP.border}`, background: GP.borderSoft,
    cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
    fontFamily: GP.font,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 999, background: GP.greenLight,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name="camera" size={22} color={GP.green} />
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: GP.text }}>Tomar foto</div>
    <div style={{ fontSize: 11, color: GP.textSec }}>o seleccionar de galería</div>
  </button>
);

function calcAge(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years === 0) return `${months}m`;
  return `${years}a ${months}m`;
}

Object.assign(window, { RegisterWizard });
