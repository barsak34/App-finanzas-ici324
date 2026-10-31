'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { History, Plus, Tag, User, LogOut } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function Navegacion({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Si está en login, no mostrar barras de navegación
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario_sesion');
    router.push('/login');
  };

  const navItems = [
    { label: 'Historial', href: '/', icon: History },
    { label: 'Categorías', href: '/categorias', icon: Tag },
    { label: 'Miembros', href: '/miembros', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#EEF0EA] flex flex-col md:flex-row">
      {/* SIDEBAR DE ESCRITORIO (Fig. 11 del informe) */}
      <aside className="hidden md:flex md:w-64 bg-[#12241F] text-white flex-col justify-between p-6 min-h-screen">
        <div>
          <div className="mb-10">
            <h1 className="text-xl font-bold tracking-tight text-white">Finanzas del Hogar</h1>
            <p className="text-xs text-gray-400 mt-1">Control 2 - MongoDB</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const activo = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activo
                      ? 'bg-[#1F5C4D] text-white shadow'
                      : 'text-gray-300 hover:bg-[#1A332C] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-red-300 hover:bg-[#1A332C] rounded-lg w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 pb-24 md:pb-8 max-w-4xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      {/* BOTTOM NAVIGATION PARA MÓVIL (Fig. 3, 7, 9 del informe) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 px-4 grid grid-cols-4 items-center z-50 shadow-md">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center text-xs font-medium ${
            pathname === '/' ? 'text-[#1F5C4D]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Historial</span>
        </Link>

        {/* Botón "+" para Nueva Transacción centrado en la barra */}
        <div className="flex items-center justify-center">
          <Link
            href="/transacciones/nueva"
            className="w-10 h-10 bg-[#1F5C4D] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#18473c] transition-transform active:scale-90"
            title="Nueva transacción"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>

        <Link
          href="/categorias"
          className={`flex flex-col items-center justify-center text-xs font-medium ${
            pathname === '/categorias' ? 'text-[#1F5C4D]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Tag className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Categorías</span>
        </Link>

        <Link
          href="/miembros"
          className={`flex flex-col items-center justify-center text-xs font-medium ${
            pathname === '/miembros' ? 'text-[#1F5C4D]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
