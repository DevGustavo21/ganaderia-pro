'use client';

import { useEffect, useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { listAnimalPhotos } from '@/lib/storage/animalPhotos';

const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const GrowthGalleryModal = ({ animal, onClose }) => {
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState(null);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (!animal?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await listAnimalPhotos({ animalId: animal.id });
        if (!cancelled) setPhotos(list);
      } catch (err) {
        if (!cancelled) {
          console.error('Error cargando galería:', err);
          setError(err?.message || 'No se pudieron cargar las fotos.');
          setPhotos([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [animal?.id]);

  const loading = photos === null;
  const empty = !loading && photos.length === 0;

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
          <Icon name="chart" size={18} color={GP.green} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: GP.text }}>Crecimiento</h2>
          <div style={{ fontSize: 12, color: GP.textSec, marginTop: 1 }}>
            {animal?.arete}{animal?.nombre ? ` · ${animal.nombre}` : ''}
            {!loading && !empty && (
              <> · {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</>
            )}
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

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {error && (
          <div style={{
            padding: 12, background: GP.redLight, borderRadius: 12,
            color: '#7B2D17', fontSize: 13, marginBottom: 14,
          }}>{error}</div>
        )}

        {loading && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10,
          }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                aspectRatio: '1 / 1', background: GP.borderSoft, borderRadius: 12,
              }} />
            ))}
          </div>
        )}

        {empty && (
          <div style={{
            padding: '28px 18px', textAlign: 'center',
            border: `1px dashed ${GP.border}`, borderRadius: 14,
            background: GP.white,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 999, background: GP.greenLight, margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="camera" size={22} color={GP.green} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: GP.text }}>Aún no hay fotos</div>
            <div style={{ fontSize: 12, color: GP.textSec, marginTop: 4 }}>
              Las fotos que tomes al editar el animal aparecerán aquí ordenadas por fecha.
            </div>
          </div>
        )}

        {!loading && !empty && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10,
          }}>
            {photos.map((p) => (
              <button
                key={p.id} type="button"
                onClick={() => setViewer(p)}
                style={{
                  position: 'relative', aspectRatio: '1 / 1',
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  background: GP.borderSoft, border: 'none', padding: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={`Foto ${fmtDate(p.taken_at)}`}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  padding: '14px 8px 6px',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
                  color: '#fff', fontFamily: GP.font,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{fmtDate(p.taken_at)}</div>
                  {p.weight_kg != null && (
                    <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.9 }}>{p.weight_kg} kg</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewer && (
        <PhotoViewer photo={viewer} onClose={() => setViewer(null)} />
      )}
    </Modal>
  );
};

const PhotoViewer = ({ photo, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
  >
    <button type="button" onClick={onClose} style={{
      position: 'absolute', top: 16, right: 16,
      width: 36, height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: 'rgba(255,255,255,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name="x" size={18} color={GP.text} />
    </button>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={photo.url}
      alt="Foto"
      onClick={(e) => e.stopPropagation()}
      style={{
        maxWidth: '100%', maxHeight: '90vh',
        borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}
    />
    <div style={{
      position: 'absolute', bottom: 24, left: 0, right: 0,
      textAlign: 'center', color: '#fff', fontFamily: GP.font, fontSize: 12,
    }}>
      {photo.taken_at && fmtDate(photo.taken_at)}
      {photo.weight_kg != null && <> · {photo.weight_kg} kg</>}
      {photo.notes && <> · {photo.notes}</>}
    </div>
  </div>
);
