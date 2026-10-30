import type { Metadata } from 'next';
import './globals.css';
import Navegacion from '@/componentes/Navegacion';

export const metadata: Metadata = {
  title: 'Finanzas del Hogar - Control 2 MongoDB',
  description: 'Aplicación de finanzas del hogar con MongoDB, Next.js y TypeScript (Grupo 23)',
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
