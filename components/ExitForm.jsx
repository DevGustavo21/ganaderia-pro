'use client';

import { useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button, Field, Input, Textarea, Select } from './ui';
import { Modal } from './Modal';
import { useFinca } from './FincaProvider';

export const ExitForm = ({ animal, onClose, onConfirm, saving = false }) => {
  const { fincas } = useFinca();
  const [causa, setCausa] = useState('');
  const [fecha, setFecha] = useState('');
  const [comprador, setComprador] = useState('');
  const [precio, setPrecio] = useState('');
  const [destino, setDestino] = useState('');
  const [documento, setDocumento] = useState('');
  const [causaMuerte, setCausaMuerte] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [denuncia, setDenuncia] = useState('');
  const [fincaDestino, setFincaDestino] = useState('');
  const [guia, setGuia] = useState('');

  const causas = [
    { key: 'Venta',    icon: 'doc',      color: GP.green,   bg: GP.greenLight, fg: GP.greenDeep },
    { key: 'Muerte',   icon: 'warn',     color: GP.red,     bg: GP.redLight,   fg: '#7B2D17' },
    { key: 'Robo',     icon: 'arrowOut', color: '#DC2626',  bg: '#FEE2E2',     fg: '#7F1D1D' },
    { key: 'Traslado', icon: 'sync',     color: '#3B82F6',  bg: '#DBEAFE',     fg: '#1E3A8A' },
  ];

  const canConfirm = causa && fecha && (
    (causa === 'Venta' && comprador && precio) ||
    (causa === 'Muerte' && causaMuerte) ||
    (causa === 'Robo') ||
    (causa === 'Traslado' && fincaDestino)
  );

  return (
    <Modal onClose={onClose}>
      <div style={{
        padding: '12px 20px 14px',
        background: GP.white,
        borderBottom: `1px solid ${GP.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: GP.redLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="arrowOut" size={18} color={GP.red} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: GP.text }}>Registrar salida</h2>
            <div style={{ fontSize: 12, color: GP.textSec, marginTop: 1 }}>
              {animal?.arete} · {animal?.nombre || 'Sin nombre'}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 999, border: 'none',
            background: GP.borderSoft, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={16} color={GP.text} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px' }}>
        <Field label="Causa de salida" required>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {causas.map(c => (
              <button key={c.key} type="button" onClick={() => setCausa(c.key)}
                style={{
                  height: 76, borderRadius: 14, cursor: 'pointer',
                  border: `1.5px solid ${causa === c.key ? c.color : GP.border}`,
                  background: causa === c.key ? c.bg : GP.white,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
                  padding: '0 14px', gap: 6,
                  fontFamily: GP.font,
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: causa === c.key ? c.color : GP.borderSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={c.icon} size={16} color={causa === c.key ? '#fff' : GP.textSec} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: causa === c.key ? c.fg : GP.text }}>
                  {c.key}
                </span>
              </button>
            ))}
          </div>
        </Field>

        <div style={{ height: 16 }} />

        <Field label="Fecha de salida" required>
          <Input value={fecha} onChange={setFecha} type="date" />
        </Field>

        <div style={{ height: 16 }} />

        {causa === 'Venta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'gp-fade-in .25s ease' }}>
            <Field label="Comprador" required><Input value={comprador} onChange={setComprador} placeholder="Nombre o NIT" /></Field>
            <Field label="Precio de venta" required><Input value={precio} onChange={setPrecio} type="number" prefix="$" placeholder="0" /></Field>
            <Field label="Destino" hint="Finca o destino del animal"><Input value={destino} onChange={setDestino} placeholder="Hacienda…" /></Field>
            <Field label="Documento / factura"><Input value={documento} onChange={setDocumento} placeholder="N° de factura o guía" /></Field>
          </div>
        )}

        {causa === 'Muerte' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'gp-fade-in .25s ease' }}>
            <Field label="Causa de muerte" required>
              <Select value={causaMuerte} onChange={setCausaMuerte}
                options={['Enfermedad', 'Accidente', 'Parto', 'Depredador', 'Vejez', 'Otra']}
                placeholder="Seleccionar causa" />
            </Field>
            <Field label="Descripción"><Textarea value={descripcion} onChange={setDescripcion} placeholder="Detalles del evento…" rows={3} /></Field>
          </div>
        )}

        {causa === 'Robo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'gp-fade-in .25s ease' }}>
            <Field label="Número de denuncia" hint="Opcional — N° de radicado policial"><Input value={denuncia} onChange={setDenuncia} placeholder="2026-…" /></Field>
            <Field label="Descripción"><Textarea value={descripcion} onChange={setDescripcion} placeholder="Circunstancias del robo…" rows={3} /></Field>
          </div>
        )}

        {causa === 'Traslado' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'gp-fade-in .25s ease' }}>
            <Field label="Finca destino" required>
              <Select value={fincaDestino} onChange={setFincaDestino}
                options={[...fincas.map(f => f.nombre), 'Finca externa']} placeholder="Seleccionar finca" />
            </Field>
            <Field label="Guía de movilización" hint="Documento ICA"><Input value={guia} onChange={setGuia} placeholder="N° de guía" /></Field>
          </div>
        )}

        {causa && (
          <div style={{
            marginTop: 18, padding: '12px 14px',
            background: '#FEF2F2', border: `1px solid ${GP.red}`, borderRadius: 12,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <Icon name="warn" size={18} color={GP.red} style={{ marginTop: 1 }} />
            <div style={{ fontSize: 12, color: '#7B2D17', lineHeight: 1.45 }}>
              <strong style={{ display: 'block', fontSize: 13, marginBottom: 2, color: '#7B2D17' }}>Acción permanente</strong>
              Esta acción actualizará el estado del animal a <strong>{causa.toLowerCase()}</strong> y no podrá deshacerse. El animal saldrá del inventario activo.
            </div>
          </div>
        )}
      </div>

      <div style={{
        background: GP.white, borderTop: `1px solid ${GP.border}`,
        padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="danger"
          disabled={!canConfirm || saving}
          onClick={() => onConfirm && onConfirm({
            causa, fecha, comprador, precio, destino, documento,
            causaMuerte, descripcion, denuncia, fincaDestino, guia,
          })}
          fullWidth
          style={{ flex: 1 }}
          icon={!saving ? <Icon name="warn" size={16} color="#fff" /> : null}>
          {saving ? 'Guardando…' : 'Confirmar salida'}
        </Button>
      </div>
    </Modal>
  );
};
