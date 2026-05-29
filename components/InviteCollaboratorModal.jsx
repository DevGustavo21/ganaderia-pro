'use client';

import { useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button, Field, Input, Textarea } from './ui';
import { Modal } from './Modal';
import { createInvitationAction } from '@/app/actions/farms';

const ROLE_OPTIONS = [
  {
    key: 'editor',
    label: 'Editor',
    desc: 'Puede registrar y editar animales, pesajes y fotos. No puede invitar ni administrar la finca.',
    icon: 'settings',
    color: GP.green,
    bg: GP.greenLight,
    fg: GP.greenDeep,
  },
  {
    key: 'lector',
    label: 'Lector',
    desc: 'Solo puede ver inventario, fichas y reportes. No modifica datos.',
    icon: 'chart',
    color: '#3B82F6',
    bg: '#DBEAFE',
    fg: '#1E3A8A',
  },
];

export const InviteCollaboratorModal = ({ farmId, farmName, onClose, onInvited }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    setError(null);
    setSaving(true);
    const res = await createInvitationAction({ farmId, email: email || null, role, message: message || null });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'No se pudo crear la invitación.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/invitacion?token=${encodeURIComponent(res.invitation.token)}`;
    setCreated({ invitation: res.invitation, link });
    onInvited?.(res.invitation);
  };

  const copyLink = async () => {
    if (!created?.link) return;
    try {
      await navigator.clipboard.writeText(created.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles. Selecciona el link y cópialo manualmente.');
    }
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
          <Icon name="user" size={18} color={GP.green} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: GP.text }}>Invitar colaborador</h2>
          <div style={{ fontSize: 12, color: GP.textSec, marginTop: 1 }}>
            {farmName || 'Finca'}
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
        {!created && (
          <>
            <Field label="Rol del colaborador" required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {ROLE_OPTIONS.map((r) => {
                  const active = role === r.key;
                  return (
                    <button
                      key={r.key} type="button" onClick={() => setRole(r.key)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: 14, borderRadius: 14, cursor: 'pointer',
                        border: `1.5px solid ${active ? r.color : GP.border}`,
                        background: active ? r.bg : GP.white,
                        fontFamily: GP.font, textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: active ? r.color : GP.borderSoft,
                        color: active ? '#fff' : GP.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon name={r.icon} size={18} color="currentColor" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: active ? r.fg : GP.text }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: 12, color: GP.textSec, marginTop: 3, lineHeight: 1.4 }}>
                          {r.desc}
                        </div>
                      </div>
                      {active && (
                        <Icon name="check" size={18} color={r.color} strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field
              label="Correo del invitado"
              hint="Opcional. Si lo dejas vacío, se genera un link abierto que puedes compartir con cualquier persona."
            >
              <Input
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="colaborador@correo.com"
              />
            </Field>

            <Field label="Mensaje" hint="Texto opcional que verá el invitado al abrir el link.">
              <Textarea
                value={message}
                onChange={setMessage}
                placeholder="Te invito a la finca para que registres los animales del lote norte."
                rows={3}
              />
            </Field>

            {error && (
              <div style={{
                padding: 12, background: GP.redLight, borderRadius: 12,
                color: '#7B2D17', fontSize: 13,
              }}>{error}</div>
            )}
          </>
        )}

        {created && (
          <>
            <div style={{
              padding: 14, borderRadius: 14, background: GP.greenLight,
              border: `1px solid ${GP.green}`,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <Icon name="check" size={20} color={GP.green} strokeWidth={2.5} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: GP.greenDeep }}>Invitación creada</div>
                <div style={{ fontSize: 12, color: GP.greenDeep, marginTop: 3, lineHeight: 1.4 }}>
                  Comparte el link de abajo con el colaborador. Tiene vigencia de 14 días.
                </div>
              </div>
            </div>

            <Field
              label="Link de invitación"
              hint={created.invitation.email
                ? `Solo el correo ${created.invitation.email} podrá aceptarla.`
                : 'Cualquier usuario con este link podrá unirse a la finca.'}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: GP.white,
                border: `1.5px solid ${GP.border}`, borderRadius: 12,
                padding: '6px 6px 6px 12px',
                fontFamily: GP.font,
              }}>
                <input
                  readOnly
                  value={created.link}
                  onFocus={(e) => e.target.select()}
                  style={{
                    flex: 1, height: 34, border: 'none', outline: 'none',
                    fontFamily: GP.font, fontSize: 13, color: GP.text,
                    background: 'transparent', minWidth: 0,
                  }}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  style={{
                    height: 34, padding: '0 12px', borderRadius: 8, border: 'none',
                    background: copied ? GP.green : GP.greenLight,
                    color: copied ? '#fff' : GP.greenDeep,
                    fontFamily: GP.font, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Icon name={copied ? 'check' : 'doc'} size={14} color="currentColor" />
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </Field>

            <div style={{
              padding: 12, borderRadius: 12,
              background: GP.borderSoft,
              fontSize: 12, color: GP.textSec, lineHeight: 1.5,
            }}>
              <strong style={{ color: GP.text }}>Tip:</strong> envía este link por WhatsApp, email o cualquier
              canal. Cuando el invitado lo abra, podrá crear su cuenta (nombre, correo, teléfono y contraseña) y
              quedará automáticamente como <strong style={{ color: GP.text }}>
                {ROLE_OPTIONS.find(r => r.key === created.invitation.role)?.label || created.invitation.role}
              </strong> de la finca.
            </div>
          </>
        )}
      </div>

      <div style={{
        padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
        borderTop: `1px solid ${GP.border}`,
        display: 'flex', gap: 10, flexShrink: 0, background: GP.white,
      }}>
        {!created ? (
          <>
            <Button variant="outline" onClick={onClose} disabled={saving} style={{ flex: '0 0 auto' }}>
              Cancelar
            </Button>
            <Button variant="primary" disabled={saving} onClick={submit} fullWidth style={{ flex: 1 }}>
              {saving ? 'Generando…' : (<><Icon name="plus" size={16} color="#fff" /> Generar invitación</>)}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onClose} fullWidth>
            <Icon name="check" size={16} color="#fff" /> Listo
          </Button>
        )}
      </div>
    </Modal>
  );
};
