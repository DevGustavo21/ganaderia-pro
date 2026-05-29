'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';

// PhotoSlot — abre la cámara en móvil (capture="environment") o galería
// en desktop. Soporta archivo nuevo (File) o URL preexistente (current).
export const PhotoSlot = ({ value, current, onChange, height = 160, label = 'Tomar foto', hint = 'o seleccionar de galería' }) => {
  const inputCameraRef = useRef(null);
  const inputFileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const objectUrl = useMemo(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      return url;
    }
    return null;
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    setPreviewUrl(objectUrl || current || null);
  }, [objectUrl, current]);

  const openCamera = () => inputCameraRef.current?.click();
  const openLibrary = () => inputFileRef.current?.click();
  const clear = () => onChange?.(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange?.(file);
    e.target.value = '';
  };

  if (previewUrl) {
    return (
      <div style={{
        position: 'relative', width: '100%', height, borderRadius: 14,
        overflow: 'hidden', background: GP.borderSoft,
        border: `1px solid ${GP.border}`,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Foto del animal"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6,
        }}>
          <SquareIcon onClick={openCamera} title="Tomar otra foto"><Icon name="camera" size={14} color={GP.text} /></SquareIcon>
          <SquareIcon onClick={openLibrary} title="Elegir otra"><Icon name="plus" size={14} color={GP.text} /></SquareIcon>
          <SquareIcon onClick={clear} title="Quitar"><Icon name="x" size={14} color={GP.text} /></SquareIcon>
        </div>
        {value instanceof File && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(255,255,255,0.92)', padding: '4px 8px', borderRadius: 999,
            fontSize: 11, fontWeight: 600, color: GP.greenDeep,
          }}>
            Lista para subir
          </div>
        )}
        <CameraInput inputRef={inputCameraRef} onChange={handleFile} />
        <LibraryInput inputRef={inputFileRef} onChange={handleFile} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button type="button" onClick={openCamera} style={{
        width: '100%', height, borderRadius: 14,
        border: `1.5px dashed ${GP.border}`, background: GP.borderSoft,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: GP.font,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 999, background: GP.greenLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="camera" size={22} color={GP.green} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: GP.text }}>{label}</div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openLibrary(); }}
          style={{
            fontSize: 11, color: GP.green, fontWeight: 600,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: GP.font,
          }}
        >
          {hint}
        </button>
      </button>
      <CameraInput inputRef={inputCameraRef} onChange={handleFile} />
      <LibraryInput inputRef={inputFileRef} onChange={handleFile} />
    </div>
  );
};

const SquareIcon = ({ children, onClick, title }) => (
  <button type="button" onClick={onClick} title={title} style={{
    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  }}>
    {children}
  </button>
);

const CameraInput = ({ inputRef, onChange }) => (
  <input
    ref={inputRef}
    type="file"
    accept="image/*"
    capture="environment"
    onChange={onChange}
    style={{ display: 'none' }}
  />
);

const LibraryInput = ({ inputRef, onChange }) => (
  <input
    ref={inputRef}
    type="file"
    accept="image/*"
    onChange={onChange}
    style={{ display: 'none' }}
  />
);
