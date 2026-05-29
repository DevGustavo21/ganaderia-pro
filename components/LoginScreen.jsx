'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button, Field, Input } from './ui';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import styles from './LoginScreen.module.css';

export const LoginScreen = () => {
  const router = useRouter();
  const loginDestination = '/inicio';

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [fullName, setFullName] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit =
    validEmail &&
    pass.length >= 6 &&
    (mode === 'signin' || fullName.trim().length >= 2) &&
    !loading;

  const supaConfigured = isSupabaseConfigured();

  const submit = async (e) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setInfo('');

    // Modo demo (sin Supabase configurado): salta directo a /inicio.
    if (!supaConfigured) {
      await new Promise(r => setTimeout(r, 500));
      setLoading(false);
      router.push(loginDestination);
      return;
    }

    try {
      const supabase = supabaseBrowser();

      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (err) throw err;
        router.push(loginDestination);
        router.refresh();
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (err) throw err;
        setInfo('Cuenta creada. Revisa tu correo para confirmar el registro.');
        setMode('signin');
      }
    } catch (err) {
      setError(traducirError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async () => {
    setError('');
    if (!supaConfigured) {
      setError('Configura Supabase para usar Google.');
      return;
    }
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
    } catch (err) {
      setError(traducirError(err?.message));
    }
  };

  return (
    <main className={styles.shell}>
      {/* Panel hero (izquierda en desktop, banner arriba en mobile) */}
      <aside className={styles.hero}>
        <DecorLeaf className={styles.leaf1} size={420} />
        <DecorLeaf className={styles.leaf2} size={300} rotate={-30} />
        <DecorLeaf className={styles.leaf3} size={260} rotate={140} />

        <div className={styles.heroContent}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>
              <Icon name="cow" size={26} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div className={styles.brandName}>
                Ganadería<span style={{ opacity: 0.85 }}>Pro</span>
              </div>
              <div className={styles.brandSub}>Gestión multi-finca</div>
            </div>
          </Link>

          <div className={styles.heroBody}>
            <h1 className={styles.heroTitle}>
              Toda tu hacienda,<br />en un solo lugar.
            </h1>
            <p className={styles.heroLead}>
              Controla el inventario, pesajes, salidas y reportes de tus fincas
              desde cualquier dispositivo.
            </p>

            <ul className={styles.bullets}>
              <Bullet icon="cow"    text="Inventario por animal con historial completo" />
              <Bullet icon="leaf"   text="Gestión multi-finca y lotes" />
              <Bullet icon="chart"  text="Pesajes, salidas y reportes" />
            </ul>
          </div>

          <div className={styles.heroFooter}>
            © {new Date().getFullYear()} GanaderíaPro · v1.0.0
          </div>
        </div>
      </aside>

      {/* Panel formulario */}
      <section className={styles.formPanel}>
        <form onSubmit={submit} className={styles.card}>
          <header className={styles.cardHead}>
            <h2 className={styles.cardTitle}>
              {mode === 'signin' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h2>
            <p className={styles.cardLead}>
              {mode === 'signin'
                ? 'Ingresa tus credenciales para continuar gestionando tu hato.'
                : 'Regístrate para administrar tus fincas y tu hato.'}
            </p>
            {!supaConfigured && (
              <p style={{
                marginTop: 8, fontSize: 11, color: GP.textSec, lineHeight: 1.4,
              }}>
                <strong style={{ color: GP.amber }}>Modo demo:</strong>{' '}
                Supabase aún no está configurado, las credenciales son ignoradas.
              </p>
            )}
          </header>

          {mode === 'signup' && (
            <Field label="Nombre completo" required>
              <Input
                type="text"
                name="fullName"
                id="login-fullname"
                autoComplete="name"
                value={fullName}
                onChange={setFullName}
                placeholder="Tu nombre"
                prefix={<Icon name="user" size={16} color={GP.textSec} />}
              />
            </Field>
          )}

          <Field label="Correo electrónico" required>
            <Input
              type="email"
              name="email"
              id="login-email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              placeholder="tucorreo@finca.co"
              prefix={<Icon name="mail" size={16} color={GP.textSec} />}
            />
          </Field>

          <Field label="Contraseña" required>
            <Input
              type={show ? 'text' : 'password'}
              name="password"
              id="login-password"
              autoComplete="current-password"
              value={pass}
              onChange={setPass}
              placeholder="••••••••"
              prefix={<Icon name="lock" size={16} color={GP.textSec} />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0, color: GP.textSec,
                  }}>
                  <Icon name={show ? 'eyeOff' : 'eye'} size={18} color={GP.textSec} />
                </button>
              }
            />
          </Field>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '10px 12px', background: '#FEF2F2',
              border: `1px solid ${GP.red}`, borderRadius: 10,
              fontSize: 12, color: '#7B2D17', lineHeight: 1.4,
            }}>
              <Icon name="warn" size={14} color={GP.red} style={{ marginTop: 1 }} />
              {error}
            </div>
          )}

          {info && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '10px 12px', background: GP.greenLight,
              border: `1px solid ${GP.green}`, borderRadius: 10,
              fontSize: 12, color: GP.greenDark, lineHeight: 1.4,
            }}>
              <Icon name="check" size={14} color={GP.green} strokeWidth={2.5} style={{ marginTop: 1 }} />
              {info}
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.check}>
              <span
                onClick={() => setRemember(r => !r)}
                role="checkbox"
                aria-checked={remember}
                tabIndex={0}
                onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRemember(r => !r); } }}
                className={styles.checkBox}
                data-checked={remember ? 'true' : 'false'}
              >
                {remember && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
              </span>
              <span className={styles.checkLabel}>Recordarme</span>
            </label>

            <button type="button" className={styles.link}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            onClick={submit}
            icon={loading ? <Spinner /> : null}
          >
            {loading
              ? (mode === 'signin' ? 'Ingresando…' : 'Creando cuenta…')
              : (mode === 'signin' ? 'Ingresar' : 'Crear cuenta')}
          </Button>

          <div className={styles.divider}>
            <span />
            <span className={styles.dividerLabel}>O continúa con</span>
            <span />
          </div>

          <button type="button" className={styles.googleBtn} onClick={signInGoogle}>
            <Icon name="google" size={18} strokeWidth={0} /> Continuar con Google
          </button>

          <div className={styles.bottom}>
            {mode === 'signin' ? '¿No tienes una cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              type="button"
              className={styles.linkStrong}
              onClick={() => {
                setMode(m => (m === 'signin' ? 'signup' : 'signin'));
                setError('');
                setInfo('');
              }}
            >
              {mode === 'signin' ? 'Crear cuenta' : 'Inicia sesión'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

const traducirError = (msg = '') => {
  if (!msg) return 'No pudimos completar la solicitud. Inténtalo de nuevo.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('user already registered')) return 'Ese correo ya está registrado.';
  if (m.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('network')) return 'Sin conexión con el servidor. Revisa tu internet.';
  return msg;
};

const Bullet = ({ icon, text }) => (
  <li>
    <span>
      <Icon name={icon} size={16} color="#fff" strokeWidth={2} />
    </span>
    {text}
  </li>
);

const DecorLeaf = ({ size = 120, rotate = 0, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ transform: `rotate(${rotate}deg)` }}
    aria-hidden
  >
    <path
      d="M11 20A7 7 0 0 1 4 13C4 8 8 5 13 4c2-.3 6-1 7-1-.1 4-1 8.5-2 10.5-1.5 3-4 5.5-7 6.5Z"
      stroke="#fff" strokeWidth="1.25" fill="#fff" fillOpacity="0.18"
      strokeLinecap="round" strokeLinejoin="round"
    />
    <path d="M2 22c4-4 8-7 14-12" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const Spinner = () => (
  <span
    style={{
      width: 16, height: 16, borderRadius: 999,
      border: '2px solid rgba(255,255,255,0.45)',
      borderTopColor: '#fff',
      display: 'inline-block',
      animation: 'gp-spin 0.7s linear infinite',
    }}
  />
);
