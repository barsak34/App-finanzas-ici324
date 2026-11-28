import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navegacion from '@/componentes/Navegacion';

export const viewport: Viewport = {
  themeColor: '#12241F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Finanzas del Hogar',
  description: 'Aplicación colaborativa de finanzas del hogar para gestión de presupuestos familiares',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Finanzas',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Navegacion>{children}</Navegacion>
      </body>
    </html>
  );
}
