'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GP } from '@/lib/theme';
import { RAZAS, CATEGORIAS_H, CATEGORIAS_M } from '@/lib/data';
import { Icon } from './Icon';
import { Button, Field, Input, Textarea, Select, Pill } from './ui';
import { Modal } from './Modal';

export const RegisterWizard = ({ finca, animals = [], onClose, onSubmit, saving = false }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    fincaId: finca?.id || '',
    arete: '', nombre: '', raza: '', sexo: '', fechaNac: '', color: '',
    categoria: '', proposito: '',
    tipoIngreso: '', fechaIngreso: '', proveedor: '',
    madreId: '', madre: '', padreId: '', padre: '',
    peso: '', precio: '', documento: '', notas: '',
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const steps = ['Identificación', 'Categoría', 'Origen'];
  const fechaIngresoOk = data.tipoIngreso === 'Nacimiento' ? !!data.fechaNac : !!data.fechaIngreso;
  const canNext = (
    (step === 0 && data.arete && data.raza && data.sexo && data.fechaNac) ||
    (step === 1 && data.categoria && data.proposito) ||
    (step === 2 && data.tipoIngreso && fechaIngresoOk && data.peso)
  );

  return (
    <Modal onClose={onClose} full>
      <div style={{
        background: GP.white,
        padding: '16px 20px 0',
        borderBottom: `1px solid ${GP.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
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
              {finca && <> · {finca.nombre}</>}
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: GP.text }}>{steps[step]}</h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, paddingBottom: 14 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ height: 3, borderRadius: 999, background: i <= step ? GP.green : GP.border, transition: 'background .2s' }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: i <= step ? GP.green : GP.textSec, letterSpacing: 0.3, textTransform: 'uppercase' }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px' }}>
        {step === 0 && <Step1 data={data} set={set} />}
        {step === 1 && <Step2 data={data} set={set} />}
        {step === 2 && <Step3 data={data} set={set} animals={animals} />}
      </div>

      <div style={{
        background: GP.white, borderTop: `1px solid ${GP.border}`,
        padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} style={{ flex: '0 0 auto' }}>
            <Icon name="chevL" size={16} /> Anterior
          </Button>
        )}
        <Button
          variant="primary"
          disabled={!canNext || saving}
          onClick={() => {
            if (step < 2) setStep(s => s + 1);
            else onSubmit && onSubmit(data);
          }}
          fullWidth
          style={{ flex: 1 }}>
          {step < 2
            ? (<>Siguiente <Icon name="chevR" size={16} color="#fff" /></>)
            : (saving
                ? (<>Guardando…</>)
                : (<><Icon name="check" size={16} color="#fff" /> Guardar animal</>))}
        </Button>
      </div>
    </Modal>
  );
};

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
      <Field label="Foto"><PhotoSlot /></Field>
    </div>
  );
};

const Step2 = ({ data, set }) => {
  const cats = data.sexo === 'M' ? CATEGORIAS_M : CATEGORIAS_H;
  const propositos = ['Leche', 'Carne', 'Doble propósito', 'Reproductor'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        padding: 12, background: GP.greenLight, borderRadius: 12,
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
            <Pill key={c} active={data.categoria === c} onClick={() => set('categoria', c)}>{c}</Pill>
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
    </div>
  );
};

const Step3 = ({ data, set, animals = [] }) => {
  const tipos = [
    { key: 'Nacimiento', icon: 'leaf' },
    { key: 'Compra',     icon: 'doc' },
    { key: 'Donación',   icon: 'sync' },
    { key: 'Traslado',   icon: 'arrowOut' },
  ];
  const isNacimiento = data.tipoIngreso === 'Nacimiento';
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

      {!isNacimiento && (
        <Field label="Fecha de ingreso" required>
          <Input value={data.fechaIngreso} onChange={v => set('fechaIngreso', v)} type="date" />
        </Field>
      )}

      {isNacimiento && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ParentPicker
            label="Madre"
            sex="H"
            animals={animals}
            valueId={data.madreId}
            valueText={data.madre}
            onSelect={(a) => {
              set('madreId', a.id || '');
              set('madre', a.id ? labelOf(a) : (a.arete || ''));
            }}
            onClear={() => { set('madreId', ''); set('madre', ''); }}
            onTextChange={(v) => { set('madre', v); if (data.madreId) set('madreId', ''); }}
          />
          <ParentPicker
            label="Padre"
            sex="M"
            animals={animals}
            valueId={data.padreId}
            valueText={data.padre}
            onSelect={(a) => {
              set('padreId', a.id || '');
              set('padre', a.id ? labelOf(a) : (a.arete || ''));
            }}
            onClear={() => { set('padreId', ''); set('padre', ''); }}
            onTextChange={(v) => { set('padre', v); if (data.padreId) set('padreId', ''); }}
          />
        </div>
      )}

      <ConditionalField show={['Compra', 'Donación', 'Traslado'].includes(data.tipoIngreso)}>
        <Field label={data.tipoIngreso === 'Donación' ? 'Donante' : data.tipoIngreso === 'Traslado' ? 'Finca de origen' : 'Proveedor'} required>
          <Input value={data.proveedor} onChange={v => set('proveedor', v)} placeholder="Nombre o NIT" />
        </Field>
      </ConditionalField>

      <Field label="Peso actual" required>
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
    'Carne':           { bg: GP.earthLight, fg: '#5C3D1F',    accent: GP.earth, icon: 'cow' },
    'Doble propósito': { bg: '#F3E8FF',     fg: '#5B21B6',    accent: '#8B5CF6', icon: 'sync' },
    'Reproductor':     { bg: GP.amberLight, fg: '#8A4F1B',    accent: GP.amber, icon: 'bull' },
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
      <span style={{ fontSize: 13, fontWeight: 600, color: active ? c.fg : GP.text }}>{label}</span>
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

const labelOf = (a) => {
  if (!a) return '';
  const tag = a.arete || '';
  const name = a.nombre ? ` · ${a.nombre}` : '';
  return `${tag}${name}`.trim();
};

const ParentPicker = ({
  label, sex, animals = [], valueId, valueText,
  onSelect, onClear, onTextChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  const pool = useMemo(
    () => (animals || []).filter(a => a.sexo === sex && a.estado !== 'muerto' && a.estado !== 'robado'),
    [animals, sex]
  );

  const filtered = useMemo(() => {
    const q = (query || valueText || '').trim().toLowerCase();
    if (!q) return pool.slice(0, 8);
    return pool.filter(a =>
      (a.arete || '').toLowerCase().includes(q) ||
      (a.nombre || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [pool, query, valueText]);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const selected = valueId ? pool.find(a => a.id === valueId) : null;
  const sexLabel = sex === 'H' ? 'hembras' : 'machos';
  const hint = selected
    ? 'Vinculado al inventario'
    : pool.length
      ? `Busca por arete o nombre · ${pool.length} ${sexLabel} en el inventario`
      : `No hay ${sexLabel} en el inventario · puedes escribirlo manualmente`;

  return (
    <Field label={label} hint={hint}>
      {selected ? (
        <SelectedParent animal={selected} onClear={onClear} />
      ) : (
        <div ref={wrapRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: GP.white,
            border: `1.5px solid ${open ? GP.green : GP.border}`,
            borderRadius: 12, height: 44, paddingLeft: 14, paddingRight: 8,
            fontFamily: GP.font,
          }}>
            <Icon name="search" size={16} color={GP.textSec} />
            <input
              type="text"
              value={valueText ?? ''}
              onChange={(e) => { setQuery(e.target.value); onTextChange?.(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={`Arete o nombre (${sexLabel})`}
              autoComplete="off"
              style={{
                flex: 1, height: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontFamily: GP.font, fontSize: 15, color: GP.text, paddingLeft: 10,
              }}
            />
            {(valueText || valueId) && (
              <button type="button" onClick={() => { onClear?.(); setQuery(''); setOpen(false); }}
                style={{
                  width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: GP.borderSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <Icon name="x" size={14} color={GP.textSec} />
              </button>
            )}
          </div>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 12,
              boxShadow: '0 12px 24px -12px rgba(0,0,0,.18)', zIndex: 30,
              maxHeight: 260, overflowY: 'auto',
            }}>
              {filtered.length === 0 && (
                <div style={{ padding: '12px 14px', fontSize: 13, color: GP.textSec, fontFamily: GP.font }}>
                  Sin coincidencias en el inventario.
                </div>
              )}
              {filtered.map(a => (
                <button
                  key={a.id} type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onSelect(a); setQuery(''); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${GP.borderSoft}`, cursor: 'pointer',
                    fontFamily: GP.font, textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: sex === 'H' ? GP.greenLight : GP.earthLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={sex === 'H' ? 'cow' : 'bull'} size={16} color={sex === 'H' ? GP.green : GP.earth} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: GP.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {labelOf(a) || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: GP.textSec }}>
                      {a.raza || '—'}{a.categoria ? ` · ${a.categoria}` : ''}
                    </div>
                  </div>
                </button>
              ))}
              {(valueText || '').trim() && (
                <button type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
                    background: GP.borderSoft, border: 'none', cursor: 'pointer',
                    fontFamily: GP.font, fontSize: 12, color: GP.text, textAlign: 'left',
                  }}>
                  <Icon name="plus" size={14} color={GP.text} />
                  Usar “{valueText}” como referencia manual
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Field>
  );
};

const SelectedParent = ({ animal, onClear }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    border: `1.5px solid ${GP.green}`, background: GP.greenLight, borderRadius: 12,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, background: GP.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={animal.sexo === 'H' ? 'cow' : 'bull'} size={18} color={animal.sexo === 'H' ? GP.green : GP.earth} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: GP.greenDeep, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {labelOf(animal) || '—'}
      </div>
      <div style={{ fontSize: 11, color: GP.textSec }}>
        {animal.raza || '—'}{animal.categoria ? ` · ${animal.categoria}` : ''}
      </div>
    </div>
    <button type="button" onClick={onClear} style={{
      width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: GP.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name="x" size={16} color={GP.text} />
    </button>
  </div>
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
