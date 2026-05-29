'use client';

import { useState } from 'react';
import { GP } from '@/lib/theme';
import { CATEGORIAS_H, CATEGORIAS_M } from '@/lib/data';
import { Icon } from './Icon';
import { Button, Field, Input, Pill } from './ui';
import { Modal } from './Modal';
import { PhotoSlot } from './PhotoSlot';

const PROPOSITOS = [
  { key: 'Leche',            color: GP.green,   bg: GP.greenLight, fg: GP.greenDeep, icon: 'droplet' },
  { key: 'Carne',            color: GP.earth,   bg: GP.earthLight, fg: '#5C3D1F',    icon: 'cow' },
  { key: 'Doble propósito',  color: '#8B5CF6',  bg: '#F3E8FF',     fg: '#5B21B6',    icon: 'sync' },
  { key: 'Reproductor',      color: GP.amber,   bg: GP.amberLight, fg: '#8A4F1B',    icon: 'bull' },
];

export const EditAnimalForm = ({ animal, saving = false, onClose, onConfirm }) => {
  const [categoria, setCategoria] = useState(animal?.categoria || '');
  const [proposito, setProposito] = useState(animal?.proposito || '');
  const [peso, setPeso] = useState(animal?.peso ? String(animal.peso) : '');
  const [photoFile, setPhotoFile] = useState(null);

  const cats = animal?.sexo === 'M' ? CATEGORIAS_M : CATEGORIAS_H;
  const originalPeso = Number(animal?.peso || 0);
  const newPeso = Number(peso || 0);
  const pesoChanged = Number.isFinite(newPeso) && newPeso > 0 && newPeso !== originalPeso;

  const canSave = !!categoria && !!proposito && newPeso > 0;

  const submit = () => {
    if (!canSave || saving) return;
    onConfirm?.({
      categoria,
      proposito,
      peso: newPeso,
      pesoChanged,
      motivo: pesoChanged ? 'Edición manual' : null,
      photoFile,
    });
  };

  return (
    <Modal onClose={onClose}>
      <div style={{
        padding: '12px 20px 14px',
        background: GP.white,
        borderBottom: `1px solid ${GP.border}`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: GP.greenLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="settings" size={18} color={GP.green} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: GP.text }}>Editar animal</h2>
          <div style={{ fontSize: 12, color: GP.textSec, marginTop: 1 }}>
            {animal?.arete}{animal?.nombre ? ` · ${animal.nombre}` : ''}
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Categoría" required>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {cats.map(c => (
              <Pill key={c} active={categoria === c} onClick={() => setCategoria(c)}>{c}</Pill>
            ))}
          </div>
        </Field>

        <Field label="Propósito" required>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PROPOSITOS.map(p => {
              const active = proposito === p.key;
              return (
                <button key={p.key} type="button" onClick={() => setProposito(p.key)}
                  style={{
                    height: 64, borderRadius: 14, cursor: 'pointer',
                    border: `1.5px solid ${active ? p.color : GP.border}`,
                    background: active ? p.bg : GP.white,
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
                    padding: '0 14px', gap: 4,
                    fontFamily: GP.font,
                  }}>
                  <Icon name={p.icon} size={18} color={active ? p.color : GP.textSec} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: active ? p.fg : GP.text }}>{p.key}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label="Peso actual"
          required
          hint={pesoChanged
            ? `Se registrará un pesaje nuevo · anterior: ${originalPeso} kg`
            : 'Sin cambios desde el último registro'}>
          <Input value={peso} onChange={setPeso} type="number" placeholder="0" suffix="kg" />
        </Field>

        <Field
          label="Foto"
          hint={photoFile
            ? 'Se guardará como nuevo registro de la galería y reemplazará el placeholder.'
            : 'Toma una foto nueva para actualizar la imagen del animal y dejar evidencia de su crecimiento.'}
        >
          <PhotoSlot
            value={photoFile}
            current={animal?.photoUrl || null}
            onChange={setPhotoFile}
            label={photoFile ? 'Cambiar foto' : 'Tomar foto'}
          />
        </Field>
      </div>

      <div style={{
        padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
        borderTop: `1px solid ${GP.border}`,
        display: 'flex', gap: 10, flexShrink: 0, background: GP.white,
      }}>
        <Button variant="outline" onClick={onClose} disabled={saving} style={{ flex: '0 0 auto' }}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!canSave || saving}
          onClick={submit}
          fullWidth
          style={{ flex: 1 }}
        >
          {saving ? 'Guardando…' : (<><Icon name="check" size={16} color="#fff" /> Guardar cambios</>)}
        </Button>
      </div>
    </Modal>
  );
};
