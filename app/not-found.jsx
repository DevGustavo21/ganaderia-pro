import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 14, padding: 24,
      background: '#F4F1EC', color: '#374151',
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: '#2D6A4F', letterSpacing: -2 }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Página no encontrada</div>
      <div style={{ fontSize: 14, color: '#9CA3AF', maxWidth: 360 }}>
        La página que buscas no existe o fue movida. Vuelve al inicio para continuar.
      </div>
      <Link href="/inicio" style={{
        marginTop: 8, padding: '12px 22px',
        background: '#2D6A4F', color: '#fff',
        borderRadius: 12, fontWeight: 600, fontSize: 14,
      }}>
        Ir al inicio
      </Link>
    </div>
  );
}
