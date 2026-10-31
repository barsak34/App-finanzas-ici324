'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LogOut } from 'lucide-react';

interface Miembro {
  id_miembro: string;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  estado_activo: boolean;
}

export default function MiembrosPerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [nombreHogar, setNombreHogar] = useState('');
  const [cargando, setCargando] = useState(true);

  // Modal para agregar nuevo miembro
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [correoNuevo, setCorreoNuevo] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [telefonoNuevo, setTelefonoNuevo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const cargarHogarYMiembros = useCallback(async (idHogar: string) => {
    try {
      const res = await fetch(`/api/mongo/hogar?id_hogar=${idHogar}`);
      if (res.ok) {
        const data = await res.json();
        setNombreHogar(data.nombre_hogar);
        setMiembros(data.miembros || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const sesionStr = localStorage.getItem('usuario_sesion');
    if (!sesionStr) {
      router.push('/login');
      return;
    }
    const sesion = JSON.parse(sesionStr);
    setUsuario(sesion);
    cargarHogarYMiembros(sesion.id_hogar);
  }, [router, cargarHogarYMiembros]);

  const handleToggleEstado = async (idMiembro: string, estadoActual: boolean) => {
    if (!usuario) return;
    try {
      const res = await fetch('/api/mongo/hogar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_hogar: usuario.id_hogar,
          id_miembro: idMiembro,
          estado_activo: !estadoActual
        })
      });

      if (res.ok) {
        // Actualizar estado localmente
        setMiembros((prev) =>
          prev.map((m) =>
            m.id_miembro === idMiembro ? { ...m, estado_activo: !estadoActual } : m
          )
        );
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleAgregarMiembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !nombreNuevo.trim() || !correoNuevo.trim() || !claveNueva.trim()) return;

    setGuardando(true);
    setErrorModal(null);

    try {
      const res = await fetch('/api/mongo/hogar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_hogar: usuario.id_hogar,
          nombre_completo: nombreNuevo,
          correo: correoNuevo,
          contrasena: claveNueva,
          telefono: telefonoNuevo
        })
      });

      const data = await res.json();
      if (res.ok) {
        await cargarHogarYMiembros(usuario.id_hogar);
        setModalAbierto(false);
        setNombreNuevo('');
        setCorreoNuevo('');
        setClaveNueva('');
        setTelefonoNuevo('');
      } else {
        setErrorModal(data.mensaje || 'Error al agregar integrante');
      }
    } catch (err) {
      setErrorModal('Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario_sesion');
    router.push('/login');
  };

  const getIniciales = (nombre: string) => {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* TARJETA DE PERFIL (Figura 9 del informe) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F2EF] text-[#1F5C4D] font-bold text-base flex items-center justify-center shrink-0">
            {usuario ? getIniciales(usuario.nombre_completo) : 'US'}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {usuario?.nombre_completo || 'Usuario'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {nombreHogar || usuario?.nombre_hogar || 'Departamento'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-[#1F5C4D] bg-[#E8F2EF] px-2.5 py-1 rounded-full">
          Sesión activa
        </span>
      </div>

      {/* SECCIÓN MIEMBROS (Figura 10 del informe) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-serif font-bold text-[#12241F]">Miembros</h3>
            <p className="text-xs text-gray-500">Integrantes con acceso al registro del hogar</p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-1.5 bg-[#12241F] hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        {cargando ? (
          <div className="space-y-2 animate-fadeIn">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3.5 px-4 shadow-xs border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
                  <div className="space-y-1.5">
                    <div className="w-32 h-4 rounded-md skeleton-shimmer" />
                    <div className="w-44 h-3 rounded-md skeleton-shimmer" />
                  </div>
                </div>
                <div className="w-16 h-6 rounded-full skeleton-shimmer shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {miembros.map((m) => {
              const esActivo = m.estado_activo;
              return (
                <div
                  key={m.id_miembro}
                  className="bg-white rounded-xl p-3.5 px-4 shadow-xs border border-gray-100 flex items-center justify-between hover:border-gray-200 hover:shadow-sm transition-all interactive-card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${
                        esActivo ? 'bg-[#EEF0EA] text-[#12241F]' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {m.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">{m.nombre_completo}</h4>
                        {m.id_miembro === usuario?.id_miembro && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Tú</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {esActivo ? (
                          <span className="text-emerald-700 font-medium">Activo</span>
                        ) : (
                          <span className="text-gray-400">Inactivo</span>
                        )}
                        {m.correo ? ` • ${m.correo}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Botón Activar / Desactivar (Figura 10) */}
                  <button
                    onClick={() => handleToggleEstado(m.id_miembro, esActivo)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                      esActivo
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-[#1F5C4D] hover:bg-[#18473c] text-white shadow-sm'
                    }`}
                  >
                    {esActivo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTÓN CERRAR SESIÓN RESALTADO */}
      <div className="pt-4">
        <button
          onClick={handleCerrarSesion}
          className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4 text-red-600 stroke-[2.5]" />
          Cerrar sesión
        </button>
      </div>

      {/* MODAL NUEVO MIEMBRO RESALTADO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition active:scale-95 shadow-xs"
              >
                <span className="text-gray-500 font-bold">✕</span>
                <span>Cancelar</span>
              </button>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#12241F] tracking-tight whitespace-nowrap truncate">
                Agregar integrante
              </h3>
            </div>

            {errorModal && (
              <div className="p-3 bg-[#FDEEEB] text-[#8F3F2B] rounded-lg text-xs font-medium">
                {errorModal}
              </div>
            )}

            <form onSubmit={handleAgregarMiembro} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  autoCapitalize="words"
                  placeholder="Ej: Camila Soto"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={correoNuevo}
                  onChange={(e) => setCorreoNuevo(e.target.value)}
                  placeholder="camila@ejemplo.com"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={claveNueva}
                  onChange={(e) => setClaveNueva(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono (opcional)</label>
                <input
                  type="text"
                  value={telefonoNuevo}
                  onChange={(e) => setTelefonoNuevo(e.target.value)}
                  placeholder="+56912345678"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full py-3 bg-[#1F5C4D] hover:bg-[#18473c] text-white font-medium rounded-xl text-xs transition shadow-sm active:scale-[0.99] mt-2"
              >
                {guardando ? 'Guardando...' : 'Agregar miembro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
