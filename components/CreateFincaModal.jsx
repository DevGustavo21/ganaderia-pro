'use client';

import { useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { Button, Field, Input, Select } from './ui';
import { createFarmAction } from '@/app/actions/farms';

const PURPOSES = ['Leche', 'Carne', 'Doble propósito', 'Reproducción', 'Otro'];

const PALETTE = [
  '#2D6A4F', '#1B4332', '#52B788',
  '#F4A261', '#A47148', '#3B82F6',
  '#8B5CF6', '#E76F51',
];

export const CreateFincaModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [hectares, setHectares] = useState('');
  const [purpose, setPurpose] = useState('');
  const [color, setColor] = useState('#2D6A4F');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim().length >= 2 && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    const res = await createFarmAction({
      name: name.trim(),
      location: location.trim(),
      hectares: Number(hectares) || null,
      purpose,
      color,
      icon: 'leaf',
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'No se pudo crear la finca.');
      return;
    }
    onCreated?.(res.farm);
  };

  return (
    <Modal onClose={onClose}>
      <div
        style={{
          padding: '14px 20px',
          background: GP.white,
          borderBottom: `1px solid ${GP.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: GP.greenLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="leaf" size={20} color={GP.green} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: GP.text }}>Crear finca</h2>
          <div style={{ fontSize: 12, color: GP.textSec, marginTop: 1 }}>
            Define los datos básicos para empezar
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            width: 32, height: 32, borderRadius: 999, border: 'none',
            background: GP.borderSoft, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="x" size={16} color={GP.text} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nombre de la finca" required>
          <Input value={name} onChange={setName} placeholder="Ej. Hacienda La Esperanza" large />
        </Field>

        <Field label="Ubicación" hint="Municipio o departamento">
          <Input value={location} onChange={setLocation} placeholder="Casanare" />
        </Field>

        <Field label="Hectáreas">
          <Input value={hectares} onChange={setHectares} type="number" placeholder="0" suffix="ha" />
        </Field>

        <Field label="Propósito">
          <Select value={purpose} onChange={setPurpose} options={PURPOSES} placeholder="Seleccionar" />
        </Field>

        <Field label="Color de identificación" hint="Para distinguirla en el dashboard">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PALETTE.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: c, cursor: 'pointer',
                  border: color === c ? `3px solid ${GP.text}` : `2px solid ${GP.border}`,
                }}
              />
            ))}
          </div>
        </Field>

        {error && (
          <div
            style={{
              padding: '10px 12px',
              background: '#FEF2F2',
              border: `1px solid ${GP.red}`,
              borderRadius: 10,
              fontSize: 12,
              color: '#7B2D17',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}
          >
            <Icon name="warn" size={14} color={GP.red} style={{ marginTop: 1 }} />
            {error}
          </div>
        )}
      </div>

      <div
        style={{
          background: GP.white, borderTop: `1px solid ${GP.border}`,
          padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
          display: 'flex', gap: 10, flexShrink: 0,
        }}
      >
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!canSubmit}
          onClick={submit}
          icon={!saving ? <Icon name="check" size={16} color="#fff" strokeWidth={2.2} /> : null}
          style={{ flex: 1 }}
        >
          {saving ? 'Creando…' : 'Crear finca'}
        </Button>
      </div>
    </Modal>
  );
};
