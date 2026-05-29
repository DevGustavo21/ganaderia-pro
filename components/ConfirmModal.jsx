'use client';

import { useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button } from './ui';
import { Modal } from './Modal';

const VARIANTS = {
  danger: { bg: GP.redLight,   fg: GP.red,    icon: 'warn',  btn: 'danger' },
  warn:   { bg: GP.amberLight, fg: GP.amber,  icon: 'warn',  btn: 'amber'  },
  info:   { bg: GP.greenLight, fg: GP.green,  icon: 'info',  btn: 'primary'},
};

// Diálogo de confirmación / alerta estilizado.
//   - mode="confirm" → muestra Cancelar + acción primaria, ejecuta onConfirm.
//   - mode="alert"   → solo botón de cerrar (útil para reemplazar window.alert).
export const ConfirmModal = ({
  open = true,
  variant = 'danger',
  mode = 'confirm',
  title,
  description,
  details = null,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onClose,
}) => {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const v = VARIANTS[variant] || VARIANTS.danger;

  const handleConfirm = async () => {
    if (!onConfirm) {
      onClose?.();
      return;
    }
    try {
      setBusy(true);
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={busy ? undefined : onClose}>
      <div style={{
        padding: '20px 22px 8px',
        display: 'flex', gap: 14, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: v.bg, color: v.fg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={v.icon} size={22} color={v.fg} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <h2 style={{
              margin: 0, fontSize: 17, fontWeight: 700, color: GP.text,
              letterSpacing: -0.2,
            }}>
              {title}
            </h2>
          )}
          {description && (
            <p style={{
              margin: '6px 0 0', fontSize: 13, color: GP.textSec, lineHeight: 1.5,
            }}>
              {description}
            </p>
          )}
          {details && (
            <div style={{
              marginTop: 10, padding: '10px 12px',
              background: GP.borderSoft, borderRadius: 10,
              fontSize: 12, color: GP.text, lineHeight: 1.5,
              wordBreak: 'break-word',
            }}>
              {details}
            </div>
          )}
        </div>
      </div>

      <div style={{
        padding: '14px 18px 18px',
        display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap',
      }}>
        {mode === 'confirm' && (
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
        )}
        <Button
          variant={mode === 'alert' ? 'primary' : v.btn}
          onClick={mode === 'alert' ? onClose : handleConfirm}
          disabled={busy}
        >
          {busy ? 'Procesando…' : (mode === 'alert' ? 'Entendido' : confirmLabel)}
        </Button>
      </div>
    </Modal>
  );
};
