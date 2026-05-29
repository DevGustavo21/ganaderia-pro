'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { useFinca } from './FincaProvider';
import styles from './AppShell.module.css';

const TABS = [
  { key: 'inicio',     label: 'Inicio',     icon: 'chart', href: '/inicio' },
  { key: 'inventario', label: 'Inventario', icon: 'cow',   href: '/inventario' },
  { key: 'fincas',     label: 'Fincas',     icon: 'leaf',  href: '/fincas' },
  { key: 'perfil',     label: 'Perfil',     icon: 'user',  href: '/perfil' },
];

const tabFromPath = (path) => {
  if (!path) return 'inicio';
  if (path.startsWith('/inventario')) return 'inventario';
  if (path.startsWith('/fincas'))     return 'fincas';
  if (path.startsWith('/perfil'))     return 'perfil';
  return 'inicio';
};

export const AppShell = ({ onPrimaryAction, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const active = tabFromPath(pathname);

  const { finca, fincas, setFincaId, clearFinca, user } = useFinca();
  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || '';
  const userPlan = user?.plan || 'Free';
  const userAvatar = user?.avatarUrl || null;

  const [fincaOpen, setFincaOpen] = useState(false);
  const fincaRef = useRef(null);

  useEffect(() => {
    const h = e => { if (fincaRef.current && !fincaRef.current.contains(e.target)) setFincaOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0])
    .join('')
    .toUpperCase();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/inicio" className={styles.brand}>
          <div className={styles.brandMark}>
            <Icon name="cow" size={20} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div className={styles.brandName}>GanaderíaPro</div>
            <div className={styles.brandSub}>Plan {userPlan}</div>
          </div>
        </Link>

        <nav className={styles.nav}>
          {TABS.map(t => (
            <Link
              key={t.key}
              href={t.href}
              className={`${styles.navItem} ${active === t.key ? styles.navItemActive : ''}`}
            >
              <Icon name={t.icon} size={20} color="currentColor" strokeWidth={active === t.key ? 2 : 1.75} />
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <Link href="/perfil" className={styles.userChip}>
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatar}
                alt={userName}
                referrerPolicy="no-referrer"
                className={styles.userAvatar}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className={styles.userAvatar}>{initials}</div>
            )}
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userMail}>{userEmail}</div>
            </div>
          </Link>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <Link href="/inicio" className={styles.brandMobile}>
              <div className={styles.brandMark} style={{ width: 36, height: 36, borderRadius: 10 }}>
                <Icon name="cow" size={18} color="#fff" strokeWidth={2} />
              </div>
              <div className={styles.brandName} style={{ fontSize: 15 }}>GanaderíaPro</div>
            </Link>

            <div className={styles.fincaSelectorWrap} ref={fincaRef}>
              <button
                type="button"
                className={styles.fincaSelector}
                onClick={() => setFincaOpen(o => !o)}
                aria-expanded={fincaOpen}
              >
                <div className={styles.fincaIcon}>
                  <Icon name="leaf" size={16} color={GP.green} />
                </div>
                <div className={styles.fincaTxt}>
                  <div className={styles.fincaCaption}>Finca activa</div>
                  <div className={styles.fincaName}>
                    {finca ? finca.nombre : 'Ninguna seleccionada'}
                    <Icon name="chevD" size={14} color={GP.textSec} />
                  </div>
                </div>
              </button>

              {fincaOpen && (
                <div className={styles.fincaMenu}>
                  <button
                    type="button"
                    className={`${styles.fincaItem} ${!finca ? styles.fincaItemActive : ''}`}
                    onClick={() => { clearFinca(); setFincaOpen(false); router.push('/inicio'); }}
                  >
                    <Icon name="chart" size={16} color={!finca ? GP.green : GP.textSec} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>Vista global</div>
                      <div style={{ fontSize: 11, color: GP.textSec }}>Todas las fincas en Inicio</div>
                    </div>
                    {!finca && <Icon name="check" size={16} color={GP.green} />}
                  </button>

                  <div style={{ height: 1, background: GP.border, margin: '4px 0' }} />

                  {fincas.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      className={`${styles.fincaItem} ${finca?.id === f.id ? styles.fincaItemActive : ''}`}
                      onClick={() => {
                        setFincaId(f.id);
                        setFincaOpen(false);
                        if (active === 'inicio' || active === 'fincas') {
                          router.push('/inventario');
                        }
                      }}
                    >
                      <Icon name="pin" size={16} color={finca?.id === f.id ? GP.green : GP.textSec} />
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{f.nombre}</div>
                        <div style={{ fontSize: 11, color: GP.textSec }}>{f.hectareas} ha · {f.ubicacion}</div>
                      </div>
                      {finca?.id === f.id && <Icon name="check" size={16} color={GP.green} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.topbarRight}>
            {onPrimaryAction && (
              <button
                type="button"
                onClick={onPrimaryAction}
                className={`${styles.iconBtn} ${styles.primaryCta}`}
              >
                <Icon name="plus" size={18} color="#fff" strokeWidth={2.2} />
                <span className={styles.ctaLabel}>Registrar animal</span>
              </button>
            )}
            <button type="button" className={styles.iconBtn} aria-label="Notificaciones">
              <Icon name="bell" size={18} color={GP.green} />
              <span className={styles.bellDot} />
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>

        <nav className={`${styles.bottomNav} gp-hide-desktop`}>
          {TABS.map(t => {
            const isActive = active === t.key;
            const color = isActive ? GP.green : GP.textSec;
            return (
              <Link key={t.key} href={t.href} className={styles.bottomNavItem}>
                <Icon name={t.icon} size={22} color={color} strokeWidth={isActive ? 2 : 1.75} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color, letterSpacing: 0.1 }}>{t.label}</span>
                {isActive && <span className={styles.bottomNavActive} />}
              </Link>
            );
          })}
        </nav>

        {onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className={`${styles.fab} gp-hide-desktop`}
            aria-label="Registrar animal"
          >
            <Icon name="plus" size={24} color="#fff" strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  );
};
