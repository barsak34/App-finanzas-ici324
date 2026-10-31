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
  description: 'Aplicación de finanzas del hogar con MongoDB, Next.js y TypeScript (Grupo 23)',
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
