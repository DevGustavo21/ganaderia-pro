'use client';

import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import { Button } from './ui';

export const EmptyFincaState = ({
  title = 'Selecciona una finca',
  description = 'Esta sección trabaja sobre una finca específica.',
  ctaLabel = 'Ir a Mis fincas',
  onCta,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      background: GP.white,
      border: `1.5px dashed ${GP.border}`,
      borderRadius: 18,
      maxWidth: 520,
      margin: '0 auto',
      gap: 12,
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 999,
        background: GP.greenLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="leaf" size={24} color={GP.green} strokeWidth={2} />
    </div>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: GP.text }}>{title}</h2>
    <p style={{ margin: 0, fontSize: 14, color: GP.textSec, lineHeight: 1.5, maxWidth: 380 }}>
      {description}
    </p>
    {onCta && (
      <Button
        variant="primary"
        onClick={onCta}
        icon={<Icon name="chevR" size={16} color="#fff" />}
        style={{ marginTop: 8 }}
      >
        {ctaLabel}
      </Button>
    )}
  </div>
);
