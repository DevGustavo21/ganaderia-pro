import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'GanaderíaPro — Gestión multi-finca',
  description:
    'Plataforma de gestión ganadera multi-finca: inventario, pesajes, salidas y reportes.',
  applicationName: 'GanaderíaPro',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#2D6A4F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
