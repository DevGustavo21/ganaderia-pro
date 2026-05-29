'use client';

import { useEffect, useMemo, useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button, StatusBadge } from './ui';
import { Modal } from './Modal';
import { GrowthGalleryModal } from './GrowthGalleryModal';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const rowToTimelineEvent = (row, animal) => {
  const base = { id: row.id, fecha: row.event_date, tipo: row.type };
  if (row.type === 'pesaje') {
    return {
      ...base,
      peso: row.weight_kg != null ? Number(row.weight_kg) : null,
      motivo: row.weight_reason || 'Pesaje',
      nota: row.description || null,
    };
  }
  if (row.type === 'ingreso') {
    const origen = row.description
      || (animal?.origen ? animal.origen : null)
      || '—';
    return {
      ...base,
      origen,
      peso: row.weight_kg != null ? Number(row.weight_kg) : null,
      precio: animal?.precio || null,
    };
  }
  if (row.type === 'salida') {
    const detalle = row.exit_buyer || row.exit_destination || row.description || '—';
    return {
      ...base,
      causa: capitalize(row.exit_cause || ''),
      detalle,
      monto: row.exit_amount != null ? Number(row.exit_amount) : null,
    };
  }
  return { ...base, detalle: row.description || '' };
};

export const AnimalDetail = ({ animal, onClose, onExit, onEdit }) => {
  const isActive = animal?.estado === 'activo';
  const [events, setEvents] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (!animal?.id || !isSupabaseConfigured()) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    setLoadingEvents(true);
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase
          .from('animal_events')
          .select('*')
          .eq('animal_id', animal.id)
          .order('event_date', { ascending: false })
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error) {
          console.error('Error cargando eventos:', error);
          setEvents([]);
        } else {
          setEvents((data || []).map((r) => rowToTimelineEvent(r, animal)));
        }
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    })();
    return () => { cancelled = true; };
  }, [animal]);

  const timeline = useMemo(() => events ?? [], [events]);

  if (!animal) return null;

  return (
    <Modal onClose={onClose} full>
      <button type="button" onClick={onClose} style={{
        position: 'absolute', top: 14, right: 14, zIndex: 5,
        width: 32, height: 32, borderRadius: 999,
        background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <Icon name="x" size={16} color={GP.text} />
      </button>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        <div style={{ position: 'relative', padding: '12px 20px 16px' }}>
          <div style={{
            position: 'relative',
            height: 220, borderRadius: 18,
            background: animal.photoUrl
              ? GP.borderSoft
              : `linear-gradient(135deg, ${animal.color || (animal.sexo === 'M' ? '#E9D8C4' : '#D8F3DC')} 0%, ${animal.sexo === 'M' ? '#C9A87D' : '#A7DEC0'} 100%)`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {animal.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={animal.photoUrl}
                alt={`${animal.arete} · ${animal.nombre || ''}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <svg width="160" height="160" viewBox="0 0 24 24" fill="none">
                <path d="M5 8c0-1.5 1-3 2.5-3S10 6 10 8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M14 8c0-1.5 1-3 2.5-3S19 6.5 19 8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M5 8h14v5a7 7 0 0 1-14 0Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                <circle cx="9.5" cy="11" r="0.7" fill="rgba(255,255,255,0.9)" />
                <circle cx="14.5" cy="11" r="0.7" fill="rgba(255,255,255,0.9)" />
                <path d="M10 16c.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <StatusBadge status={animal.estado} size="md" />
            </div>
            {!animal.photoUrl && (
              <div style={{
                position: 'absolute', bottom: 12, right: 12,
                background: 'rgba(255,255,255,0.92)', padding: '6px 10px', borderRadius: 999,
                fontSize: 11, fontWeight: 600, color: GP.text,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Icon name="camera" size={12} color={GP.textSec} /> Foto placeholder
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            style={{
              width: '100%', marginTop: 10,
              height: 40, borderRadius: 12,
              border: `1px solid ${GP.border}`, background: GP.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', fontFamily: GP.font, fontSize: 13, fontWeight: 600, color: GP.greenDeep,
            }}
          >
            <Icon name="chart" size={16} color={GP.green} />
            Ver crecimiento
          </button>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: GP.textSec, letterSpacing: 0.6 }}>
              ARETE · {animal.arete}
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, color: GP.text, letterSpacing: -0.4 }}>
              {animal.nombre || 'Sin nombre'}
            </h2>
            <div style={{ fontSize: 13, color: GP.textSec, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{animal.raza}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: GP.textSec, opacity: 0.5 }} />
              <span>{animal.sexo === 'M' ? 'Macho' : 'Hembra'}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: GP.textSec, opacity: 0.5 }} />
              <span>{animal.edad}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            <Fact label="Categoría" value={animal.categoria} />
            <Fact label="Propósito" value={animal.proposito} />
            <Fact label="Lote actual" value={animal.lote} icon="pin" />
            <Fact label="Peso actual" value={animal.peso ? `${animal.peso} kg` : '—'} accent={GP.amber} />
          </div>
        </div>

        {isActive && (
          <div style={{ padding: '16px 20px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Button variant="primary" onClick={onEdit} icon={<Icon name="settings" size={16} color="#fff" />} fullWidth>Editar</Button>
            <Button variant="danger" onClick={onExit} icon={<Icon name="arrowOut" size={16} color="#fff" />} fullWidth>Salida</Button>
          </div>
        )}

        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: GP.text }}>Historial de movimientos</h3>
            <span style={{ fontSize: 12, color: GP.textSec }}>
              {loadingEvents ? 'Cargando…' : `${timeline.length} ${timeline.length === 1 ? 'evento' : 'eventos'}`}
            </span>
          </div>
          {loadingEvents && timeline.length === 0 ? (
            <div style={{
              padding: 18, textAlign: 'center', fontSize: 13, color: GP.textSec,
              background: GP.white, border: `1px dashed ${GP.border}`, borderRadius: 12,
            }}>
              Cargando movimientos…
            </div>
          ) : timeline.length === 0 ? (
            <div style={{
              padding: 18, textAlign: 'center', fontSize: 13, color: GP.textSec,
              background: GP.white, border: `1px dashed ${GP.border}`, borderRadius: 12,
            }}>
              Aún no hay movimientos registrados.
            </div>
          ) : (
            <Timeline events={timeline} />
          )}
        </div>
      </div>

      {galleryOpen && (
        <GrowthGalleryModal
          animal={animal}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </Modal>
  );
};

const Fact = ({ label, value, accent, icon }) => (
  <div style={{ padding: '10px 12px', background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 12 }}>
    <div style={{ fontSize: 10, fontWeight: 600, color: GP.textSec, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
      {icon && <Icon name={icon} size={13} color={GP.textSec} />}
      <span style={{ fontSize: 14, fontWeight: 600, color: accent || GP.text }}>{value || '—'}</span>
    </div>
  </div>
);

const Timeline = ({ events }) => (
  <div style={{ position: 'relative' }}>
    {events.map((e, i) => (
      <TimelineEvent key={i} event={e} last={i === events.length - 1} />
    ))}
  </div>
);

const TimelineEvent = ({ event, last }) => {
  const metaMap = {
    ingreso:     { color: GP.green, bg: GP.greenLight, label: 'Ingreso',     icon: 'arrowUp' },
    pesaje:      { color: GP.amber, bg: GP.amberLight, label: 'Pesaje',      icon: 'weight' },
    salida:      { color: GP.red,   bg: GP.redLight,   label: 'Salida',      icon: 'arrowOut' },
    traslado:    { color: '#3B82F6', bg: '#DBEAFE',    label: 'Traslado',    icon: 'sync' },
    tratamiento: { color: '#8B5CF6', bg: '#F3E8FF',    label: 'Tratamiento', icon: 'droplet' },
    parto:       { color: GP.green,  bg: GP.greenLight, label: 'Parto',      icon: 'cow' },
    nota:        { color: GP.textSec, bg: GP.borderSoft, label: 'Nota',      icon: 'info' },
  };
  const meta = metaMap[event.tipo] || { color: GP.textSec, bg: GP.borderSoft, label: 'Evento', icon: 'dot' };
  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: last ? 0 : 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: meta.bg, border: `2px solid ${meta.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}>
          <Icon name={meta.icon} size={14} color={meta.color} strokeWidth={2.2} />
        </div>
        {!last && <div style={{ width: 2, flex: 1, background: GP.border, marginTop: 2 }} />}
      </div>

      <div style={{
        flex: 1, padding: '10px 12px',
        background: GP.white, border: `1px solid ${GP.border}`, borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, letterSpacing: 0.3, textTransform: 'uppercase' }}>
            {event.tipo === 'salida' ? `Salida · ${event.causa}` : meta.label}
          </span>
          <span style={{ fontSize: 11, color: GP.textSec, fontWeight: 500 }}>{fmtDate(event.fecha)}</span>
        </div>
        {event.tipo === 'pesaje' && (
          <>
            {event.peso != null && (
              <div style={{ fontSize: 18, fontWeight: 700, color: GP.text }}>
                {event.peso} <span style={{ fontSize: 12, color: GP.textSec, fontWeight: 500 }}>kg</span>
              </div>
            )}
            <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>{event.motivo}</div>
            {event.nota && <div style={{ fontSize: 12, color: GP.text, marginTop: 4, padding: '6px 8px', background: GP.borderSoft, borderRadius: 6 }}>{event.nota}</div>}
          </>
        )}
        {event.tipo === 'ingreso' && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{event.origen}</div>
            {(event.peso != null || event.precio != null) && (
              <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>
                {event.peso != null && <>Peso ingreso: <strong style={{ color: GP.text }}>{event.peso} kg</strong></>}
                {event.peso != null && event.precio != null && ' · '}
                {event.precio != null && <>Precio: <strong style={{ color: GP.text }}>{fmtMoney(event.precio)}</strong></>}
              </div>
            )}
          </>
        )}
        {event.tipo === 'salida' && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: GP.text }}>{event.detalle}</div>
            {event.monto != null && <div style={{ fontSize: 12, color: GP.textSec, marginTop: 2 }}>Monto: <strong style={{ color: GP.text }}>{fmtMoney(event.monto)}</strong></div>}
          </>
        )}
        {event.tipo !== 'pesaje' && event.tipo !== 'ingreso' && event.tipo !== 'salida' && event.detalle && (
          <div style={{ fontSize: 12, color: GP.text, marginTop: 2 }}>{event.detalle}</div>
        )}
      </div>
    </div>
  );
};

function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMoney(n) {
  if (n == null) return '';
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}K`;
  return `$${v.toLocaleString('es-CO')}`;
}
