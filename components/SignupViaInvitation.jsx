'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button, Field, Input } from './ui';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const ROLE_LABEL = {
  editor: 'Editor',
  lector: 'Lector',
  admin: 'Administrador',
  worker: 'Editor',
};

const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isExpired = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
};

export const SignupViaInvitation = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [mode, setMode] = useState('signup'); // 'signup' | 'signin'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setLoadError('Falta el token de invitación en el link.');
      return;
    }
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setLoadError('Supabase no está configurado en este entorno.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const [{ data, error }, sessionRes] = await Promise.all([
          supabase.rpc('get_invitation_info', { invitation_token: token }),
          supabase.auth.getUser(),
        ]);
        if (cancelled) return;
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error('No encontramos esta invitación. Revisa el link.');
        setInvitation(row);
        setEmail(row.email || '');
        const user = sessionRes?.data?.user || null;
        setCurrentUser(user);
        if (user) setMode('signin');
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || 'No se pudo leer la invitación.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const status = invitation?.status;
  const expired = invitation && (status === 'expired' || isExpired(invitation.expires_at));
  const usable = invitation && status === 'pending' && !expired;

  const emailMismatch = useMemo(() => {
    if (!currentUser || !invitation?.email) return false;
    return (currentUser.email || '').toLowerCase() !== invitation.email.toLowerCase();
  }, [currentUser, invitation?.email]);

  const acceptInvitation = async () => {
    const supabase = supabaseBrowser();
    const { error } = await supabase.rpc('accept_farm_invitation', { invitation_token: token });
    if (error) throw error;
  };

  const handleSignup = async () => {
    setActionError(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signUp({
        email: (invitation?.email || email).trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
          },
          emailRedirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/invitacion?token=${encodeURIComponent(token)}`
            : undefined,
        },
      });
      if (error) throw error;

      if (!data.session) {
        setInfo('Te enviamos un correo de confirmación. Después de confirmar, vuelve a abrir el link de la invitación para entrar a la finca.');
        setBusy(false);
        return;
      }

      // Si la sesión ya está activa (auto-confirm), aceptar invitación.
      await acceptInvitation();
      router.replace('/inicio');
    } catch (err) {
      setActionError(err?.message || 'No se pudo crear la cuenta.');
      setBusy(false);
    }
  };

  const handleSignInExisting = async () => {
    setActionError(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email: (invitation?.email || email).trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      await acceptInvitation();
      router.replace('/inicio');
    } catch (err) {
      setActionError(err?.message || 'No se pudo iniciar sesión.');
      setBusy(false);
    }
  };

  const handleAcceptAsCurrentUser = async () => {
    setActionError(null);
    setInfo(null);
    setBusy(true);
    try {
      await acceptInvitation();
      router.replace('/inicio');
    } catch (err) {
      setActionError(err?.message || 'No se pudo aceptar la invitación.');
      setBusy(false);
    }
  };

  const handleSwitchAccount = async () => {
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
      setCurrentUser(null);
      setMode('signup');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, background: GP.borderSoft, fontFamily: GP.font,
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        background: GP.white, borderRadius: 18,
        border: `1px solid ${GP.border}`,
        boxShadow: '0 20px 50px -20px rgba(27,67,50,0.25)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '22px 24px 18px',
          background: `linear-gradient(135deg, ${GP.green} 0%, ${GP.greenDeep} 100%)`,
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="leaf" size={20} color="#fff" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.85 }}>
              GanaderíaPro
            </div>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
            Te invitaron a una finca
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>
            Crea tu cuenta o inicia sesión para unirte como colaborador.
          </p>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 20, color: GP.textSec, fontSize: 14 }}>
              Cargando invitación…
            </div>
          )}

          {!loading && loadError && (
            <div style={{
              padding: 14, background: GP.redLight, borderRadius: 12,
              color: '#7B2D17', fontSize: 13,
            }}>
              {loadError}
              <div style={{ marginTop: 10 }}>
                <Link href="/login" style={{ color: GP.green, fontWeight: 600, textDecoration: 'none' }}>
                  Volver a inicio de sesión →
                </Link>
              </div>
            </div>
          )}

          {!loading && invitation && (
            <>
              <div style={{
                padding: 14, borderRadius: 14, background: GP.greenLight, border: `1px solid ${GP.green}`,
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <Icon name="leaf" size={18} color={GP.green} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GP.greenDeep, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                    Finca
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: GP.text, marginTop: 2 }}>
                    {invitation.farm_name}
                  </div>
                  <div style={{ fontSize: 12, color: GP.textSec, marginTop: 4 }}>
                    Rol asignado: <strong style={{ color: GP.text }}>{ROLE_LABEL[invitation.role] || invitation.role}</strong>
                    {invitation.email && <> · Para <strong style={{ color: GP.text }}>{invitation.email}</strong></>}
                  </div>
                  {invitation.expires_at && status === 'pending' && (
                    <div style={{ fontSize: 11, color: GP.textSec, marginTop: 4 }}>
                      Expira el {fmtDate(invitation.expires_at)}
                    </div>
                  )}
                  {invitation.message && (
                    <div style={{
                      marginTop: 10, padding: '8px 10px', borderRadius: 8,
                      background: GP.white, fontSize: 12, color: GP.text, lineHeight: 1.5,
                    }}>
                      &ldquo;{invitation.message}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {!usable && (
                <div style={{
                  padding: 14, borderRadius: 12, background: GP.redLight,
                  color: '#7B2D17', fontSize: 13,
                }}>
                  {expired
                    ? 'Esta invitación expiró. Pide al propietario que te envíe una nueva.'
                    : status === 'accepted'
                      ? 'Esta invitación ya fue aceptada. Inicia sesión para entrar a la finca.'
                      : status === 'revoked'
                        ? 'Esta invitación fue revocada por el propietario.'
                        : 'Esta invitación ya no está disponible.'}
                </div>
              )}

              {usable && currentUser && (
                <>
                  <div style={{
                    padding: 12, borderRadius: 12,
                    background: GP.borderSoft, fontSize: 13, color: GP.text,
                  }}>
                    Estás autenticado como <strong>{currentUser.email}</strong>.
                  </div>
                  {emailMismatch ? (
                    <>
                      <div style={{ fontSize: 13, color: GP.red }}>
                        Esta invitación es para <strong>{invitation.email}</strong>. Cierra sesión y vuelve
                        a abrir el link con ese correo.
                      </div>
                      <Button variant="outline" onClick={handleSwitchAccount} disabled={busy} fullWidth>
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={handleAcceptAsCurrentUser} disabled={busy} fullWidth>
                      {busy ? 'Aceptando…' : (<><Icon name="check" size={16} color="#fff" /> Aceptar invitación</>)}
                    </Button>
                  )}
                </>
              )}

              {usable && !currentUser && (
                <>
                  <div style={{ display: 'flex', gap: 6, background: GP.borderSoft, padding: 4, borderRadius: 10 }}>
                    <TabButton active={mode === 'signup'} onClick={() => setMode('signup')}>Crear cuenta</TabButton>
                    <TabButton active={mode === 'signin'} onClick={() => setMode('signin')}>Ya tengo cuenta</TabButton>
                  </div>

                  {mode === 'signup' && (
                    <>
                      <Field label="Nombre completo" required>
                        <Input value={fullName} onChange={setFullName} placeholder="Ej. Juan Pérez" />
                      </Field>
                      <Field label="Correo" required hint={invitation.email ? 'Este es el correo invitado y no puede cambiarse.' : null}>
                        <Input
                          value={email}
                          onChange={setEmail}
                          type="email"
                          placeholder="colaborador@correo.com"
                        />
                      </Field>
                      <Field label="Teléfono" hint="Opcional, ayuda a tu equipo a contactarte.">
                        <Input value={phone} onChange={setPhone} type="tel" placeholder="+57 300 000 0000" />
                      </Field>
                      <Field label="Contraseña" required hint="Mínimo 8 caracteres">
                        <Input value={password} onChange={setPassword} type="password" placeholder="••••••••" />
                      </Field>
                      <Button
                        variant="primary"
                        onClick={handleSignup}
                        disabled={busy || !fullName || !password || password.length < 8 || (!invitation.email && !email)}
                        fullWidth
                      >
                        {busy ? 'Creando cuenta…' : (<><Icon name="check" size={16} color="#fff" /> Crear cuenta y aceptar</>)}
                      </Button>
                    </>
                  )}

                  {mode === 'signin' && (
                    <>
                      <Field label="Correo" required>
                        <Input
                          value={email}
                          onChange={setEmail}
                          type="email"
                          placeholder="tucorreo@correo.com"
                        />
                      </Field>
                      <Field label="Contraseña" required>
                        <Input value={password} onChange={setPassword} type="password" placeholder="••••••••" />
                      </Field>
                      <Button
                        variant="primary"
                        onClick={handleSignInExisting}
                        disabled={busy || !email || !password}
                        fullWidth
                      >
                        {busy ? 'Entrando…' : (<><Icon name="check" size={16} color="#fff" /> Entrar y aceptar invitación</>)}
                      </Button>
                    </>
                  )}
                </>
              )}

              {actionError && (
                <div style={{ padding: 12, background: GP.redLight, borderRadius: 12, color: '#7B2D17', fontSize: 13 }}>
                  {actionError}
                </div>
              )}
              {info && (
                <div style={{ padding: 12, background: GP.greenLight, borderRadius: 12, color: GP.greenDeep, fontSize: 13 }}>
                  {info}
                </div>
              )}

              <div style={{ fontSize: 11, color: GP.textSec, textAlign: 'center' }}>
                ¿Problemas? <Link href="/login" style={{ color: GP.green, fontWeight: 600 }}>Ir al login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: active ? GP.white : 'transparent',
      color: active ? GP.greenDeep : GP.textSec,
      fontWeight: 700, fontSize: 13, fontFamily: GP.font,
      boxShadow: active ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
    }}
  >
    {children}
  </button>
);
