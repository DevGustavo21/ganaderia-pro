'use client';

import { useEffect, useState, useCallback } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button } from './ui';
import { InviteCollaboratorModal } from './InviteCollaboratorModal';
import { ConfirmModal } from './ConfirmModal';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import {
  changeMemberRoleAction,
  removeMemberAction,
  revokeInvitationAction,
} from '@/app/actions/farms';

const ROLE_META = {
  owner:  { label: 'Propietario',   color: GP.amber,  bg: GP.amberLight, fg: '#8A4F1B' },
  admin:  { label: 'Administrador', color: GP.green,  bg: GP.greenLight, fg: GP.greenDeep },
  editor: { label: 'Editor',        color: GP.green,  bg: GP.greenLight, fg: GP.greenDeep },
  worker: { label: 'Editor',        color: GP.green,  bg: GP.greenLight, fg: GP.greenDeep },
  lector: { label: 'Lector',        color: '#3B82F6', bg: '#DBEAFE',     fg: '#1E3A8A' },
};

const STATUS_META = {
  pending:  { label: 'Pendiente', color: GP.amber,   bg: GP.amberLight, fg: '#8A4F1B' },
  accepted: { label: 'Aceptada',  color: GP.green,   bg: GP.greenLight, fg: GP.greenDeep },
  revoked:  { label: 'Revocada',  color: GP.textSec, bg: GP.borderSoft, fg: GP.text },
  expired:  { label: 'Expirada',  color: GP.red,     bg: GP.redLight,   fg: '#7B2D17' },
};

const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();

const ROLE_OPTIONS_ASSIGNABLE = ['editor', 'lector', 'admin'];

export const CollaboratorsPanel = ({
  farm,
  currentUserId,
  inviteOpen,
  onInviteOpenChange,
  onRoleResolved,
}) => {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [internalInviteOpen, setInternalInviteOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [alertDialog, setAlertDialog] = useState(null);

  const isControlled = inviteOpen !== undefined;
  const showInvite = isControlled ? inviteOpen : internalInviteOpen;
  const setShowInvite = (open) => {
    if (isControlled) onInviteOpenChange?.(open);
    else setInternalInviteOpen(open);
  };

  const load = useCallback(async () => {
    if (!farm?.id || !isSupabaseConfigured()) {
      setMembers([]);
      setInvitations([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const [{ data: mData, error: mErr }, { data: iData, error: iErr }] = await Promise.all([
        supabase
          .from('farm_members')
          .select(`
            role, joined_at, user_id,
            profiles:profiles!farm_members_user_id_fkey(id, full_name, email, phone, avatar_url)
          `)
          .eq('farm_id', farm.id),
        supabase
          .from('farm_invitations')
          .select('id, email, role, status, token, expires_at, created_at, accepted_at')
          .eq('farm_id', farm.id)
          .order('created_at', { ascending: false }),
      ]);
      if (mErr) throw mErr;
      if (iErr) throw iErr;
      setMembers(mData ?? []);
      setInvitations(iData ?? []);
    } catch (err) {
      console.error('[CollaboratorsPanel] load', err);
    } finally {
      setLoading(false);
    }
  }, [farm?.id]);

  useEffect(() => { load(); }, [load]);

  const myMember = members.find(m => m.user_id === currentUserId);
  const myRole = myMember?.role || null;
  const canAdminister = myRole === 'owner' || myRole === 'admin';

  useEffect(() => {
    onRoleResolved?.({ role: myRole, canAdminister });
  }, [myRole, canAdminister, onRoleResolved]);

  const handleChangeRole = async (member, newRole) => {
    if (member.role === 'owner') return;
    if (newRole === member.role) return;
    setBusy(`role-${member.user_id}`);
    const res = await changeMemberRoleAction({ farmId: farm.id, userId: member.user_id, role: newRole });
    setBusy(null);
    if (!res.ok) {
      setAlertDialog({
        title: 'No se pudo cambiar el rol',
        description: res.error || 'Ocurrió un error inesperado. Intenta nuevamente.',
      });
      return;
    }
    await load();
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const member = removeTarget;
    setBusy(`remove-${member.user_id}`);
    const res = await removeMemberAction({ farmId: farm.id, userId: member.user_id });
    setBusy(null);
    setRemoveTarget(null);
    if (!res.ok) {
      setAlertDialog({
        title: 'No se pudo eliminar',
        description: res.error || 'Ocurrió un error inesperado al quitar al colaborador.',
      });
      return;
    }
    await load();
  };

  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    const invitation = revokeTarget;
    setBusy(`revoke-${invitation.id}`);
    const res = await revokeInvitationAction({ invitationId: invitation.id });
    setBusy(null);
    setRevokeTarget(null);
    if (!res.ok) {
      setAlertDialog({
        title: 'No se pudo revocar',
        description: res.error || 'Ocurrió un error inesperado al revocar la invitación.',
      });
      return;
    }
    await load();
  };

  const copyInvitationLink = async (invitation) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/invitacion?token=${encodeURIComponent(invitation.token)}`;
    try {
      await navigator.clipboard.writeText(link);
      setBusy(`copied-${invitation.id}`);
      setTimeout(() => setBusy((v) => (v === `copied-${invitation.id}` ? null : v)), 1800);
    } catch {
      window.prompt('Copia el link manualmente:', link);
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const otherInvitations = invitations.filter(i => i.status !== 'pending');

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontSize: 13, fontWeight: 700, color: GP.textSec,
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            Colaboradores
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: GP.textSec }}>
            {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            {pendingInvitations.length > 0 && (
              <> · <strong style={{ color: GP.amber }}>{pendingInvitations.length} invitaciones pendientes</strong></>
            )}
          </p>
        </div>
        {canAdminister && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowInvite(true)}
            icon={<Icon name="plus" size={14} color="#fff" strokeWidth={2.2} />}
          >
            Invitar
          </Button>
        )}
      </header>

      <div style={{
        background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`,
        overflow: 'hidden',
      }}>
        {loading && members.length === 0 ? (
          <div style={{ padding: 18, fontSize: 13, color: GP.textSec, textAlign: 'center' }}>Cargando…</div>
        ) : members.length === 0 ? (
          <div style={{ padding: 18, fontSize: 13, color: GP.textSec, textAlign: 'center' }}>
            Sin miembros aún.
          </div>
        ) : members.map((m, i, arr) => {
          const profile = m.profiles || {};
          const meta = ROLE_META[m.role] || ROLE_META.editor;
          const isMe = m.user_id === currentUserId;
          const isOwner = m.role === 'owner';
          const canEditThis = canAdminister && !isOwner && !isMe;
          const busyKey = busy === `role-${m.user_id}` || busy === `remove-${m.user_id}`;
          return (
            <div key={m.user_id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${GP.borderSoft}` : 'none',
              opacity: busyKey ? 0.5 : 1,
              transition: 'opacity .15s',
            }}>
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || ''}
                  referrerPolicy="no-referrer"
                  style={{
                    width: 40, height: 40, borderRadius: 999, objectFit: 'cover',
                    flexShrink: 0, background: GP.borderSoft,
                  }}
                />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: GP.greenLight, color: GP.greenDeep,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>
                  {initials(profile.full_name || profile.email || '?')}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: GP.text }}>
                    {profile.full_name || profile.email || 'Sin nombre'}
                  </div>
                  {isMe && (
                    <span style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 999,
                      background: GP.borderSoft, color: GP.textSec, fontWeight: 700, letterSpacing: 0.3,
                    }}>TÚ</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>
                  {profile.email || '—'}
                  {profile.phone && <> · {profile.phone}</>}
                </div>
                <div style={{ fontSize: 11, color: GP.textSec, marginTop: 3 }}>
                  Desde {fmtDate(m.joined_at)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {canEditThis ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleChangeRole(m, e.target.value)}
                    disabled={busyKey}
                    style={{
                      height: 32, padding: '0 28px 0 10px',
                      borderRadius: 8, border: `1px solid ${GP.border}`,
                      fontFamily: GP.font, fontSize: 12, fontWeight: 600,
                      color: meta.fg, background: meta.bg, cursor: 'pointer',
                      appearance: 'none', WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23${meta.fg.replace('#','')}' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                    }}
                  >
                    {ROLE_OPTIONS_ASSIGNABLE.map((r) => (
                      <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: meta.bg, color: meta.fg,
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                  }}>
                    {meta.label}
                  </span>
                )}
                {canEditThis && (
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(m)}
                    disabled={busyKey}
                    title="Quitar de la finca"
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: `1px solid ${GP.border}`,
                      background: GP.white, color: GP.red, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Icon name="x" size={14} color={GP.red} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canAdminister && (pendingInvitations.length > 0 || otherInvitations.length > 0) && (
        <>
          <h4 style={{
            margin: '6px 0 -4px', fontSize: 12, fontWeight: 700, color: GP.textSec,
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            Invitaciones
          </h4>
          <div style={{
            background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`,
            overflow: 'hidden',
          }}>
            {[...pendingInvitations, ...otherInvitations].map((inv, i, arr) => {
              const rMeta = ROLE_META[inv.role] || ROLE_META.editor;
              const sMeta = STATUS_META[inv.status] || STATUS_META.pending;
              const isPending = inv.status === 'pending';
              const copiedThis = busy === `copied-${inv.id}`;
              return (
                <div key={inv.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${GP.borderSoft}` : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: rMeta.bg, color: rMeta.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon name="user" size={16} color="currentColor" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: GP.text }}>
                        {inv.email || 'Link abierto'}
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: sMeta.bg, color: sMeta.fg,
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                      }}>{sMeta.label}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: rMeta.bg, color: rMeta.fg,
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                      }}>{rMeta.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: GP.textSec, marginTop: 3 }}>
                      Creada {fmtDate(inv.created_at)}
                      {inv.expires_at && isPending && <> · Expira {fmtDate(inv.expires_at)}</>}
                      {inv.accepted_at && <> · Aceptada {fmtDate(inv.accepted_at)}</>}
                    </div>
                  </div>
                  {isPending && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => copyInvitationLink(inv)}
                        title="Copiar link"
                        style={{
                          height: 32, padding: '0 10px', borderRadius: 8,
                          border: `1px solid ${GP.border}`, background: copiedThis ? GP.green : GP.white,
                          color: copiedThis ? '#fff' : GP.text, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontFamily: GP.font, fontSize: 12, fontWeight: 600,
                        }}>
                        <Icon name={copiedThis ? 'check' : 'doc'} size={14} color="currentColor" />
                        {copiedThis ? 'Copiado' : 'Copiar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRevokeTarget(inv)}
                        disabled={busy === `revoke-${inv.id}`}
                        title="Revocar invitación"
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: `1px solid ${GP.border}`,
                          background: GP.white, color: GP.red, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        <Icon name="x" size={14} color={GP.red} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {showInvite && (
        <InviteCollaboratorModal
          farmId={farm.id}
          farmName={farm.nombre}
          onClose={() => setShowInvite(false)}
          onInvited={() => { load(); }}
        />
      )}

      {removeTarget && (
        <ConfirmModal
          variant="danger"
          title="Quitar colaborador"
          description="Esta persona perderá acceso a la finca de inmediato. Podrás volver a invitarla cuando quieras."
          details={removeTarget.profiles?.full_name || removeTarget.profiles?.email || 'Colaborador'}
          confirmLabel="Quitar de la finca"
          onConfirm={confirmRemove}
          onClose={() => setRemoveTarget(null)}
        />
      )}

      {revokeTarget && (
        <ConfirmModal
          variant="warn"
          title="Revocar invitación"
          description="El link dejará de funcionar y la persona ya no podrá usarlo para unirse a la finca."
          details={revokeTarget.email || 'Link abierto sin destinatario'}
          confirmLabel="Revocar invitación"
          onConfirm={confirmRevoke}
          onClose={() => setRevokeTarget(null)}
        />
      )}

      {alertDialog && (
        <ConfirmModal
          variant="danger"
          mode="alert"
          title={alertDialog.title}
          description={alertDialog.description}
          onClose={() => setAlertDialog(null)}
        />
      )}
    </section>
  );
};
