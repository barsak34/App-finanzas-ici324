import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'App de Finanzas del Hogar - Backend API',
  description: 'Backend con Next.js, PostgreSQL y Swagger para ICI324 Bases de Datos y Programación Web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
