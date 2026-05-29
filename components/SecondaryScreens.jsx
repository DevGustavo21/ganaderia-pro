'use client';

import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button } from './ui';

// ─────────────────────────────────────────────────────────────
//  FincasScreen — listado de fincas + detalle de la activa
// ─────────────────────────────────────────────────────────────
export const FincasScreen = ({
  finca,
  fincas = [],
  counts = {},
  lots = [],
  personnel = [],
  onOpenFinca,
  onSwitchFinca,
  onCreateFinca,
  onInviteCollaborator = null,
  onInviteToFarm = null,
  manageableFarmIds = null,
  collaboratorsSlot = null,
}) => {
  const manageableSet = manageableFarmIds instanceof Set
    ? manageableFarmIds
    : new Set(manageableFarmIds || []);
  const canInviteAny = manageableSet.size > 0 && typeof onInviteToFarm === 'function';
  if (fincas.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <header>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>Fincas</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: GP.textSec }}>
            Aún no has creado ninguna finca.
          </p>
        </header>
        <div
          style={{
            padding: '32px 20px', background: GP.white,
            border: `1.5px dashed ${GP.border}`, borderRadius: 18,
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12,
            alignItems: 'center', maxWidth: 520,
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: 999, background: GP.greenLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="leaf" size={26} color={GP.green} />
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: GP.text }}>
            Crea tu primera finca
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: GP.textSec, lineHeight: 1.5, maxWidth: 380 }}>
            Cada finca tiene su propio inventario, lotes y personal. Puedes crear
            cuantas necesites y administrarlas desde la misma cuenta.
          </p>
          <Button
            variant="primary"
            onClick={onCreateFinca}
            icon={<Icon name="plus" size={16} color="#fff" strokeWidth={2.2} />}
            style={{ marginTop: 4 }}
          >
            Crear finca
          </Button>
        </div>
      </div>
    );
  }

  const activa = finca || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>Fincas</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: GP.textSec }}>
            Administras <strong>{fincas.length}</strong> fincas. Cada una tiene
            inventario, lotes y personal independientes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canInviteAny && (
            <Button
              variant="outline"
              onClick={() => onInviteToFarm(null)}
              icon={<Icon name="user" size={16} color={GP.green} strokeWidth={2.2} />}
              style={{ color: GP.green, borderColor: GP.border }}
            >
              Invitar colaborador
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onCreateFinca}
            icon={<Icon name="plus" size={16} color="#fff" strokeWidth={2.2} />}
          >
            Crear finca
          </Button>
        </div>
      </header>

      {/* Selector horizontal de fincas */}
      <div
        className="gp-no-scrollbar"
        style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          margin: '0 -16px', padding: '2px 16px',
        }}
      >
        {fincas.map(f => {
          const isActive = f.id === activa?.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSwitchFinca?.(f)}
              style={{
                flex: '0 0 auto',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: isActive ? GP.green : GP.white,
                color: isActive ? '#fff' : GP.text,
                border: `1.5px solid ${isActive ? GP.green : GP.border}`,
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: GP.font,
                fontSize: 13, fontWeight: 600,
              }}
            >
              <Icon name="leaf" size={14} color={isActive ? '#fff' : GP.green} />
              {f.nombre}
            </button>
          );
        })}
      </div>

      {activa ? (
        <ActiveFincaDetail
          activa={activa}
          metrics={counts[activa.id]}
          lots={lots}
          personnel={personnel}
          collaboratorsSlot={collaboratorsSlot}
          onInviteCollaborator={onInviteCollaborator}
        />
      ) : (
        <div
          style={{
            padding: '20px 18px', background: GP.greenLight,
            border: `1px solid ${GP.green}`, borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <Icon name="info" size={20} color={GP.green} />
          <div style={{ fontSize: 13, color: GP.greenDeep, lineHeight: 1.5 }}>
            Selecciona una finca arriba para ver sus lotes y personal.
          </div>
        </div>
      )}

      {/* Resumen de todas */}
      <section>
        <h3 style={SECTION_TITLE_STYLE}>Todas mis fincas</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {fincas.map(f => {
            const fm = counts[f.id] || { activos: 0 };
            const isActive = f.id === activa?.id;
            const canInviteHere = manageableSet.has(f.id) && typeof onInviteToFarm === 'function';
            const openFinca = () => onOpenFinca?.(f);
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={openFinca}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openFinca();
                  }
                }}
                style={{
                  textAlign: 'left',
                  background: GP.white,
                  border: `1.5px solid ${isActive ? GP.green : GP.border}`,
                  borderRadius: 14, padding: 14,
                  cursor: 'pointer', fontFamily: GP.font,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: f.color || GP.green,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="leaf" size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: GP.text }}>{f.nombre}</div>
                    <div style={{ fontSize: 11, color: GP.textSec, marginTop: 2 }}>
                      {f.ubicacion} · {f.hectareas} ha
                    </div>
                  </div>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                        padding: '3px 8px', borderRadius: 999,
                        background: GP.greenLight, color: GP.greenDeep,
                      }}
                    >
                      ACTIVA
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 8, fontSize: 12, color: GP.textSec,
                }}>
                  <span><strong style={{ color: GP.text }}>{fm.activos}</strong> animales</span>
                  {canInviteHere && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInviteToFarm(f);
                      }}
                      title={`Invitar colaborador a ${f.nombre}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 9px', borderRadius: 999,
                        border: `1px solid ${GP.border}`, background: GP.white,
                        color: GP.green, fontFamily: GP.font,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <Icon name="user" size={12} color={GP.green} strokeWidth={2.4} />
                      Invitar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const ActiveFincaDetail = ({
  activa, metrics, lots = [], personnel = [],
  collaboratorsSlot = null, onInviteCollaborator = null,
}) => {
  const m = metrics || { activos: 0, hembras: 0, machos: 0 };
  return (
    <>
      <div
        style={{
          background: `linear-gradient(135deg, ${activa.color || GP.green} 0%, ${GP.greenDeep} 100%)`,
          borderRadius: 20, padding: '24px 22px', color: '#fff',
          boxShadow: '0 12px 32px rgba(27,67,50,0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Finca activa
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, letterSpacing: -0.3 }}>{activa.nombre}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              {activa.ubicacion} · {activa.hectareas} ha · Propósito: {activa.proposito}
            </div>
          </div>
          {onInviteCollaborator && (
            <button
              type="button"
              onClick={onInviteCollaborator}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', height: 40,
                background: 'rgba(255,255,255,0.18)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 10, fontFamily: GP.font, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', backdropFilter: 'blur(6px)', flexShrink: 0,
              }}
            >
              <Icon name="plus" size={14} color="#fff" strokeWidth={2.2} />
              Invitar colaborador
            </button>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 16, marginTop: 22,
          }}
        >
          <Stat label="Animales" value={m.activos} />
          <Stat label="Hembras"  value={m.hembras} />
          <Stat label="Machos"   value={m.machos} />
          <Stat label="Lotes"    value={lots.length} />
          <Stat label="Personal" value={personnel.length} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <section>
          <h3 style={SECTION_TITLE_STYLE}>Lotes</h3>
          <div
            style={{
              display: 'flex', flexDirection: 'column',
              background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`,
              overflow: 'hidden',
            }}
          >
            {lots.length === 0 ? (
              <div style={{ padding: '20px 16px', fontSize: 13, color: GP.textSec }}>
                Aún no hay lotes registrados.
              </div>
            ) : lots.map((l, i, arr) => (
              <div
                key={l.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${GP.borderSoft}` : 'none',
                }}
              >
                <div style={{ width: 4, height: 28, borderRadius: 999, background: activa.color || GP.green }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{l.name}</div>
                  {l.area_ha && (
                    <div style={{ fontSize: 11, color: GP.textSec, marginTop: 2 }}>{l.area_ha} ha</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h3 style={SECTION_TITLE_STYLE}>Personal externo</h3>
            <span style={{ fontSize: 12, color: GP.textSec }}>{personnel.length} registrados</span>
          </div>
          <div
            style={{
              display: 'flex', flexDirection: 'column',
              background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`,
              overflow: 'hidden',
            }}
          >
            {personnel.length === 0 ? (
              <div style={{ padding: '20px 16px', fontSize: 13, color: GP.textSec }}>
                Aún no hay personal asignado.
              </div>
            ) : personnel.map((p, i, arr) => (
              <div
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${GP.borderSoft}` : 'none',
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 999,
                    background: GP.greenLight, color: GP.greenDeep,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                  }}
                >
                  {initials(p.full_name || p.nombre || '?')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{p.full_name || p.nombre}</div>
                  <div style={{ fontSize: 11, color: GP.textSec, marginTop: 2 }}>
                    {(p.role || p.rol || '—')} {p.phone || p.telefono ? `· ${p.phone || p.telefono}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {collaboratorsSlot}
    </>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, opacity: 0.75 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{value}</div>
  </div>
);

const SECTION_TITLE_STYLE = {
  fontSize: 13, fontWeight: 700, color: GP.textSec,
  letterSpacing: 0.4, textTransform: 'uppercase',
  margin: '0 0 10px',
};

function initials(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0])
    .join('')
    .toUpperCase();
}

// ─────────────────────────────────────────────────────────────
//  PerfilScreen
// ─────────────────────────────────────────────────────────────
export const PerfilScreen = ({ user, fincasCount = 0, onLogout }) => {
  const nombre = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '—';
  const plan = user?.plan || 'Free';
  const avatarUrl = user?.avatarUrl || null;
  const provider = user?.provider || 'email';

  return (
    <div
      style={{
        display: 'grid', gap: 18,
        gridTemplateColumns: 'minmax(0, 1fr)',
        maxWidth: 760,
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>Perfil</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: GP.textSec }}>
          Tu cuenta y preferencias
        </p>
      </header>

      <div
        style={{
          padding: '22px 20px',
          background: GP.white, borderRadius: 18, border: `1px solid ${GP.border}`,
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={nombre}
            referrerPolicy="no-referrer"
            style={{
              width: 64, height: 64, borderRadius: 999, objectFit: 'cover',
              flexShrink: 0, background: GP.borderSoft,
            }}
          />
        ) : (
          <div
            style={{
              width: 64, height: 64, borderRadius: 999, background: GP.green, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 22, flexShrink: 0,
            }}
          >
            {initials(nombre)}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: GP.text }}>{nombre}</div>
          <div style={{ fontSize: 13, color: GP.textSec, marginTop: 2 }}>{email}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 999, background: GP.greenLight,
                fontSize: 10, fontWeight: 700, color: GP.greenDeep, letterSpacing: 0.4,
              }}
            >
              <Icon name="check" size={10} color={GP.greenDeep} strokeWidth={2.5} /> PLAN {String(plan).toUpperCase()}
            </span>
            {provider !== 'email' && (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 9px', borderRadius: 999, background: GP.borderSoft,
                  fontSize: 10, fontWeight: 700, color: GP.textSec, letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {provider}
              </span>
            )}
          </div>
        </div>
      </div>

      <section>
        <h3 style={SECTION_TITLE_STYLE}>Cuenta</h3>
        <div
          style={{
            display: 'flex', flexDirection: 'column',
            background: GP.white, borderRadius: 14, border: `1px solid ${GP.border}`,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'Mis fincas',     icon: 'leaf',     meta: `${fincasCount}` },
            { label: 'Notificaciones', icon: 'bell' },
            { label: 'Configuración',  icon: 'settings' },
          ].map((row, i, arr) => (
            <button
              key={row.label}
              type="button"
              style={{
                height: 56, padding: '0 18px',
                background: 'transparent', border: 'none',
                borderBottom: i < arr.length - 1 ? `1px solid ${GP.borderSoft}` : 'none',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', fontFamily: GP.font, textAlign: 'left',
              }}
            >
              <Icon name={row.icon} size={18} color={GP.green} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: GP.text }}>{row.label}</span>
              {row.meta && <span style={{ fontSize: 12, color: GP.textSec }}>{row.meta}</span>}
              <Icon name="chevR" size={14} color={GP.textSec} />
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onLogout}
        style={{
          width: '100%', height: 48, borderRadius: 12,
          border: `1.5px solid ${GP.border}`, background: GP.white,
          color: GP.red, fontWeight: 600, fontSize: 14,
          cursor: 'pointer', fontFamily: GP.font,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <Icon name="arrowOut" size={16} color={GP.red} /> Cerrar sesión
      </button>
    </div>
  );
};
