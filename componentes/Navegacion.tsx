'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { History, Plus, Tag, User, LogOut, Home, Sparkles } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function Navegacion({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Si está en login, no requerir sesión
    if (pathname === '/login') return;

    const sesionStr = localStorage.getItem('usuario_sesion');
    if (sesionStr) {
      try {
        setUsuario(JSON.parse(sesionStr));
      } catch (e) {
        // ignore
      }
    }
  }, [pathname]);

  // Si está en login, no mostrar barras de navegación
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleCerrarSesion = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('usuario_sesion');
    router.push('/login');
  };

  const navItems = [
    { label: 'Historial', href: '/', icon: History },
    { label: 'Categorías', href: '/categorias', icon: Tag },
    { label: 'Miembros', href: '/miembros', icon: User },
  ];

  const getIniciales = (nombre?: string) => {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#EEF0EA] flex flex-col md:flex-row">
      {/* SIDEBAR LATERAL PARA COMPUTADORA / DESKTOP (Fijo a la izquierda) */}
      <aside className="hidden md:flex md:fixed md:top-0 md:bottom-0 md:left-0 md:w-64 bg-[#12241F] text-white flex-col justify-between p-6 z-30 shadow-xl border-r border-[#1F5C4D]/30">
        <div className="space-y-6">
          {/* Logo y título de la aplicación */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-[#1F5C4D] flex items-center justify-center shadow-sm shrink-0 border border-white/10">
              <img src="/icon.svg" alt="Logo" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white font-serif leading-tight">
                Finanzas del Hogar
              </h1>
              <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
                Grupo 23 • ICI324
              </span>
            </div>
          </div>

          {/* Tarjeta del Usuario Conectado en PC */}
          {usuario && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1F5C4D] text-white text-xs font-bold flex items-center justify-center shrink-0 border border-white/20">
                {getIniciales(usuario.nombre_completo)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {usuario.nombre_completo || 'Usuario'}
                </p>
                <p className="text-[10px] text-gray-300 truncate flex items-center gap-1">
                  <Home className="w-2.5 h-2.5 text-emerald-400" />
                  {usuario.nombre_hogar || 'Hogar activo'}
                </p>
              </div>
            </div>
          )}

          {/* Botón Destacado: Nueva Transacción */}
          <Link
            href="/transacciones/nueva"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F5C4D] hover:bg-[#276e5d] text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] border border-emerald-400/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva transacción</span>
          </Link>

          {/* Enlaces de Navegación */}
          <nav className="space-y-1.5 pt-2">
            <p className="text-[10px] uppercase font-bold text-gray-400 px-3 tracking-wider mb-2">
              Menú Principal
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const activo = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activo
                      ? 'bg-[#1F5C4D] text-white font-semibold shadow-xs border border-emerald-400/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activo ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pie del Sidebar: Cerrar Sesión */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/30 rounded-xl w-full transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Con margen izquierdo en Desktop para el Sidebar) */}
      <main
        key={pathname}
        className="flex-1 md:ml-64 pb-24 md:pb-12 w-full p-4 md:p-8 max-w-7xl mx-auto animate-page-enter"
      >
        {children}
      </main>

      {/* BOTÓN FLOTANTE (+) MÓVIL */}
      <div className="md:hidden fixed bottom-20 right-5 z-50">
        <Link
          href="/transacciones/nueva"
          className="w-14 h-14 bg-[#1F5C4D] hover:bg-[#18473c] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
          title="Nueva transacción"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </Link>
      </div>

      {/* BOTTOM NAVIGATION PARA MÓVIL (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 h-16 px-4 grid grid-cols-3 items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        {/* 1. Historial */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 ${
            pathname === '/'
              ? 'text-[#1F5C4D] font-bold bg-[#E8F2EF]/60 scale-102'
              : 'text-gray-400 hover:text-gray-600 font-medium'
          }`}
        >
          <History className={`w-5 h-5 mb-0.5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] tracking-tight">Historial</span>
        </Link>

        {/* 2. Categorías */}
        <Link
          href="/categorias"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 ${
            pathname === '/categorias'
              ? 'text-[#1F5C4D] font-bold bg-[#E8F2EF]/60 scale-102'
              : 'text-gray-400 hover:text-gray-600 font-medium'
          }`}
        >
          <Tag className={`w-5 h-5 mb-0.5 ${pathname === '/categorias' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] tracking-tight">Categorías</span>
        </Link>

        {/* 3. Perfil */}
        <Link
          href="/miembros"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 ${
            pathname === '/miembros'
              ? 'text-[#1F5C4D] font-bold bg-[#E8F2EF]/60 scale-102'
              : 'text-gray-400 hover:text-gray-600 font-medium'
          }`}
        >
          <User className={`w-5 h-5 mb-0.5 ${pathname === '/miembros' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] tracking-tight">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
