'use client';

import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button } from './ui';
import styles from './InicioScreen.module.css';

export const InicioScreen = ({
  userName = '',
  finca,
  fincas = [],
  counts = {},
  recent = [],
  onOpenFinca,
  onGoTo,
  onCreateFinca,
}) => {
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  // Totales agregados de todas las fincas que vemos.
  const totals = fincas.reduce(
    (acc, f) => {
      const m = counts[f.id] || { activos: 0, hembras: 0, machos: 0, pesoTotal: 0, salidas: 0, total: 0 };
      acc.activos += m.activos;
      acc.hembras += m.hembras;
      acc.machos += m.machos;
      acc.pesoTotal += m.pesoTotal;
      acc.salidas += m.salidas;
      acc.hectareas += Number(f.hectareas || 0);
      return acc;
    },
    { activos: 0, hembras: 0, machos: 0, pesoTotal: 0, salidas: 0, hectareas: 0 }
  );

  const firstName = (userName || '').split(' ')[0] || 'hola';

  if (fincas.length === 0) {
    return (
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <div className={styles.kicker}>{saludo}</div>
            <h1 className={styles.title}>
              {firstName}, comencemos con tu <span className={styles.titleAccent}>primera finca</span>
            </h1>
            <p className={styles.lead}>
              Aún no tienes fincas registradas. Crea una para empezar a administrar
              tu inventario, lotes y personal.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Button
              variant="primary"
              onClick={onCreateFinca}
              icon={<Icon name="plus" size={16} color="#fff" strokeWidth={2.2} />}
            >
              Crear mi primera finca
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.kicker}>{saludo}</div>
          <h1 className={styles.title}>
            {firstName}, tienes{' '}
            <span className={styles.titleAccent}>{totals.activos}</span> animales activos
          </h1>
          <p className={styles.lead}>
            Resumen de tus <strong>{fincas.length}</strong> fincas en{' '}
            <strong>{totals.hectareas.toLocaleString('es-CO')}</strong> hectáreas
            administradas.{' '}
            {!finca && (
              <span style={{ opacity: 0.85 }}>
                Elige una finca abajo para empezar a trabajar.
              </span>
            )}
          </p>
        </div>

        <div className={styles.heroActions}>
          <Button
            variant="outline"
            onClick={() => onGoTo?.('fincas')}
            icon={<Icon name="leaf" size={16} color={GP.green} />}
          >
            Administrar fincas
          </Button>
        </div>
      </section>

      <section className={styles.kpis}>
        <Kpi icon="leaf"     label="Fincas"     value={fincas.length}                            accent={GP.green}     sub="administradas" />
        <Kpi icon="cow"      label="Activos"    value={totals.activos}                           accent={GP.greenMid}  sub="cabezas" />
        <Kpi icon="weight"   label="Peso total" value={(totals.pesoTotal / 1000).toFixed(1)}     accent={GP.amber}     sub="toneladas" />
        <Kpi icon="arrowOut" label="Salidas"    value={totals.salidas}                           accent={GP.red}       sub="acumuladas" />
        <Kpi icon="pin"      label="Hectáreas"  value={totals.hectareas.toLocaleString('es-CO')} accent={GP.greenDeep} sub="ha totales" />
      </section>

      <section>
        <header className={styles.sectionHead}>
          <div>
            <h2 className={styles.sectionTitle}>Mis fincas</h2>
            <p className={styles.sectionSub}>
              Cada finca tiene inventario, lotes y personal independientes.
            </p>
          </div>
          <button type="button" className={styles.linkBtn} onClick={() => onGoTo?.('fincas')}>
            Ver todas <Icon name="chevR" size={14} color={GP.green} />
          </button>
        </header>

        <div className={styles.fincaGrid}>
          {fincas.map(f => {
            const m = counts[f.id] || { activos: 0, hembras: 0 };
            const isActive = f.id === finca?.id;
            return (
              <article
                key={f.id}
                className={`${styles.fincaCard} ${isActive ? styles.fincaCardActive : ''}`}
              >
                <div
                  className={styles.fincaBanner}
                  style={{ background: `linear-gradient(135deg, ${f.color} 0%, ${shade(f.color, -25)} 100%)` }}
                >
                  <div className={styles.fincaBadgeRow}>
                    {isActive && (
                      <span className={styles.activeBadge}>
                        <Icon name="check" size={11} color="#fff" strokeWidth={3} /> Activa
                      </span>
                    )}
                    <span className={styles.purposeBadge}>{f.proposito}</span>
                  </div>
                  <Icon name={f.icono || 'leaf'} size={36} color="rgba(255,255,255,0.85)" strokeWidth={1.4} />
                </div>

                <div className={styles.fincaBody}>
                  <h3 className={styles.fincaName}>{f.nombre}</h3>
                  <div className={styles.fincaMeta}>
                    <Icon name="pin" size={12} color={GP.textSec} />
                    <span>{f.ubicacion}</span>
                    <span className={styles.dot} />
                    <span>{f.hectareas} ha</span>
                  </div>

                  <div className={styles.fincaStats}>
                    <FincaStat label="Activos" value={m.activos} />
                    <FincaStat label="Hembras" value={m.hembras} />
                    <FincaStat label="Salidas" value={m.salidas} />
                  </div>

                  <div className={styles.fincaFoot}>
                    <Button
                      variant={isActive ? 'softGreen' : 'primary'}
                      size="sm"
                      onClick={() => onOpenFinca?.(f)}
                      fullWidth
                    >
                      {isActive ? 'Ya estás aquí' : 'Abrir finca'}{' '}
                      {!isActive && <Icon name="chevR" size={14} color="#fff" />}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}

          <button type="button" className={styles.addCard} onClick={onCreateFinca}>
            <div className={styles.addIcon}>
              <Icon name="plus" size={20} color={GP.green} strokeWidth={2.2} />
            </div>
            <div className={styles.addTitle}>Agregar nueva finca</div>
            <div className={styles.addSub}>Administra otra propiedad desde la misma cuenta</div>
          </button>
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <header className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Actividad reciente</h2>
              <p className={styles.sectionSub}>Últimos movimientos en todas tus fincas.</p>
            </div>
          </header>

          <ul className={styles.activityList}>
            {recent.map(ev => {
              const f = fincas.find(x => x.id === ev.farm_id);
              const meta = eventMeta(ev);
              return (
                <li key={ev.id} className={styles.activityItem}>
                  <div
                    className={styles.activityIcon}
                    style={{ background: `${meta.color}1F`, color: meta.color }}
                  >
                    <Icon name={meta.icon} size={16} color={meta.color} />
                  </div>
                  <div className={styles.activityBody}>
                    <div className={styles.activityTitle}>{meta.title(ev)}</div>
                    <div className={styles.activityMeta}>
                      <span>{meta.detail(ev)}</span>
                      {f && (
                        <>
                          <span className={styles.dot} />
                          <span>{f.nombre}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={styles.activityDate}>{fmtDate(ev.event_date)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

const Kpi = ({ icon, label, value, sub, accent }) => (
  <div className={styles.kpiCard}>
    <div className={styles.kpiIcon} style={{ background: `${accent}1A`, color: accent }}>
      <Icon name={icon} size={18} color={accent} />
    </div>
    <div className={styles.kpiBody}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValueRow}>
        <span className={styles.kpiValue} style={{ color: accent }}>{value}</span>
        {sub && <span className={styles.kpiSub}>{sub}</span>}
      </div>
    </div>
  </div>
);

const FincaStat = ({ label, value }) => (
  <div className={styles.statCol}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const eventMeta = (ev) => {
  const an = ev.animals?.name || ev.animals?.tag || 'animal';
  switch (ev.type) {
    case 'ingreso':
      return { icon: 'arrowUp', color: '#2D6A4F', title: () => `Ingreso · ${an}`, detail: () => ev.description || 'Nuevo animal registrado' };
    case 'pesaje':
      return { icon: 'weight',  color: '#F4A261', title: () => `Pesaje · ${an}`, detail: () => `${ev.weight_kg ?? '—'} kg` };
    case 'traslado':
      return { icon: 'sync',    color: '#3B82F6', title: () => `Traslado · ${an}`, detail: () => ev.description || 'Cambio de lote' };
    case 'tratamiento':
      return { icon: 'doc',     color: '#8B5CF6', title: () => `Tratamiento · ${an}`, detail: () => ev.description || '—' };
    case 'salida':
      return { icon: 'arrowOut', color: '#E76F51', title: () => `Salida · ${an}`, detail: () => ev.exit_cause || ev.description || '—' };
    default:
      return { icon: 'doc', color: '#6B7280', title: () => an, detail: () => ev.description || '—' };
  }
};

function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function shade(hex, pct) {
  const f = parseInt(hex.slice(1), 16);
  const t = pct < 0 ? 0 : 255;
  const p = Math.abs(pct) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}
