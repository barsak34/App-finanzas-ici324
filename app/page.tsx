'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, CheckCircle, ArrowDownCircle, ArrowUpCircle, Calendar, Home, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Transaccion {
  id_transaccion: string;
  id_miembro: string;
  nombre_miembro: string;
  id_categoria: string;
  nombre_categoria: string;
  tipo_movimiento: 'Ingreso' | 'Egreso';
  monto: number;
  medio_pago: string;
  descripcion_gasto: string;
  fecha_registro: string;
}

interface Balance {
  totalIngresos: number;
  totalGastos: number;
  balanceNeto: number;
}

function HistorialContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mensajeGuardado = searchParams ? searchParams.get('guardado') : null;

  const [usuario, setUsuario] = useState<any>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [balance, setBalance] = useState<Balance>({ totalIngresos: 0, totalGastos: 0, balanceNeto: 0 });
  const [cargando, setCargando] = useState(true);

  // Filtros interactivos
  const [tipoFiltro, setTipoFiltro] = useState<'Todos' | 'Ingreso' | 'Egreso'>('Todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [mostrarAviso, setMostrarAviso] = useState(!!mensajeGuardado);

  // Gestión de múltiples hogares
  const [listaHogares, setListaHogares] = useState<any[]>([]);
  const [modalHogarAbierto, setModalHogarAbierto] = useState(false);
  const [nombreNuevoHogar, setNombreNuevoHogar] = useState('');
  const [creandoHogar, setCreandoHogar] = useState(false);

  const cargarHogares = async () => {
    try {
      const res = await fetch('/api/mongo/hogares');
      if (res.ok) {
        const data = await res.json();
        setListaHogares(data.hogares || []);
      }
    } catch (err) {
      console.error('Error cargando hogares:', err);
    }
  };

  const cambiarHogarActivo = (h: any) => {
    if (!usuario) return;
    const nuevaSesion = {
      ...usuario,
      id_hogar: h.id_hogar,
      nombre_hogar: h.nombre_hogar
    };
    localStorage.setItem('usuario_sesion', JSON.stringify(nuevaSesion));
    setUsuario(nuevaSesion);
    setModalHogarAbierto(false);
    cargarDatos(h.id_hogar);
  };

  const handleCrearHogar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevoHogar.trim()) return;
    setCreandoHogar(true);
    try {
      const res = await fetch('/api/mongo/hogares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_hogar: nombreNuevoHogar,
          miembro_inicial: usuario ? {
            nombre_completo: usuario.nombre_completo,
            correo: usuario.correo,
            contrasena: '123456'
          } : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setNombreNuevoHogar('');
        await cargarHogares();
        cambiarHogarActivo(data.hogar);
      }
    } catch (err) {
      console.error('Error al crear hogar:', err);
    } finally {
      setCreandoHogar(false);
    }
  };

  const cargarDatos = useCallback(async (idHogar?: string) => {
    setCargando(true);
    try {
      const queryParams = new URLSearchParams();
      if (idHogar) queryParams.set('id_hogar', idHogar);
      if (tipoFiltro !== 'Todos') queryParams.set('tipo', tipoFiltro);
      if (fechaDesde) queryParams.set('desde', fechaDesde);
      if (fechaHasta) queryParams.set('hasta', fechaHasta);

      const res = await fetch(`/api/mongo/transacciones?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransacciones(data.transacciones || []);
        setBalance(data.balance || { totalIngresos: 0, totalGastos: 0, balanceNeto: 0 });
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setCargando(false);
    }
  }, [tipoFiltro, fechaDesde, fechaHasta]);

  useEffect(() => {
    // Verificar si hay sesión
    const sesionStr = localStorage.getItem('usuario_sesion');
    if (!sesionStr) {
      router.push('/login');
      return;
    }
    const sesion = JSON.parse(sesionStr);
    setUsuario(sesion);
    cargarDatos(sesion.id_hogar);
    cargarHogares();
  }, [router, cargarDatos]);

  useEffect(() => {
    if (mostrarAviso) {
      const timer = setTimeout(() => setMostrarAviso(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [mostrarAviso]);

  const formatearMonto = (num: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getInicial = (nombre: string) => {
    return nombre ? nombre.charAt(0).toUpperCase() : 'T';
  };

  const formatearFecha = (fechaIso: string) => {
    const f = new Date(fechaIso);
    return f.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* MENSAJE DE CONFIRMACIÓN (Figura 3: "Transacción guardada") */}
      {mostrarAviso && (
        <div className="bg-[#1F5C4D] text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between shadow transition-all animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
            <span>Transacción guardada</span>
          </div>
          <button onClick={() => setMostrarAviso(false)} className="text-white text-xs opacity-80 hover:opacity-100">✕</button>
        </div>
      )}

      {/* HEADER CON BOTÓN ESCRITORIO Y SELECTOR DE HOGAR */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#12241F]">Historial</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">Hogar:</span>
            <button
              type="button"
              onClick={() => setModalHogarAbierto(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#1F5C4D] text-xs font-semibold text-gray-800 shadow-2xs transition active:scale-95"
            >
              <Home className="w-3.5 h-3.5 text-[#1F5C4D]" />
              <span>{usuario?.nombre_hogar || 'Departamento'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
        <Link
          href="/transacciones/nueva"
          className="hidden md:inline-flex items-center gap-2 bg-[#1F5C4D] hover:bg-[#18473c] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nueva transacción
        </Link>
      </div>

      {/* TARJETAS DE BALANCE CON COLORES REMARCADOS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50/80 rounded-xl p-4 shadow-xs border border-emerald-200/80">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-1">
            <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
            <span>Ingresos</span>
          </div>
          <p className="font-monto text-2xl md:text-3xl font-extrabold text-emerald-700">
            {formatearMonto(balance.totalIngresos)}
          </p>
        </div>

        <div className="bg-red-50/80 rounded-xl p-4 shadow-xs border border-red-200/80">
          <div className="flex items-center gap-1.5 text-xs text-red-800 font-bold mb-1">
            <ArrowDownCircle className="w-4 h-4 text-red-600" />
            <span>Gastos</span>
          </div>
          <p className="font-monto text-2xl md:text-3xl font-extrabold text-red-600">
            {formatearMonto(balance.totalGastos)}
          </p>
        </div>
      </div>

      {/* FILTROS INTERACTIVOS EN FORMA DE PÍLDORA (Figuras 3 y 11) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['Todos', 'Ingreso', 'Egreso'] as const).map((tipo) => {
            const label = tipo === 'Ingreso' ? 'Ingresos' : tipo === 'Egreso' ? 'Egresos' : 'Todos';
            const activo = tipoFiltro === tipo;
            return (
              <button
                key={tipo}
                onClick={() => setTipoFiltro(tipo)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activo
                    ? 'bg-[#12241F] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* FILTROS POR FECHA CON CALENDARIO DESPLEGABLE */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-gray-500 mb-1 font-medium">Desde</label>
            <div className="relative">
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs cursor-pointer focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 mb-1 font-medium">Hasta</label>
            <div className="relative">
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs cursor-pointer focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DE TRANSACCIONES */}
      {cargando ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">
          Cargando movimientos desde MongoDB...
        </div>
      ) : transacciones.length === 0 ? (
        /* ESTADO VACÍO (Figura 6: "Aún no hay movimientos") */
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 space-y-4 my-8">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Aún no hay movimientos</h3>
            <p className="text-xs text-gray-500 mt-1">Registra tu primer gasto o ingreso</p>
          </div>
          <div>
            <Link
              href="/transacciones/nueva"
              className="inline-block bg-[#1F5C4D] hover:bg-[#18473c] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
            >
              Nueva transacción
            </Link>
          </div>
        </div>
      ) : (
        /* LISTADO DE TARJETAS (Figuras 3 y 11) */
        <div className="space-y-2">
          {transacciones.map((tx) => {
            const esIngreso = tx.tipo_movimiento === 'Ingreso';
            return (
              <div
                key={tx.id_transaccion}
                className="bg-white rounded-xl p-3.5 px-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
              >
                {/* Lado izquierdo: Avatar con letra coloreado y datos */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shrink-0 border ${
                      esIngreso
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {getInicial(tx.nombre_categoria)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                      {tx.nombre_categoria}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tx.nombre_miembro} • {formatearFecha(tx.fecha_registro)}
                      {tx.descripcion_gasto ? ` • ${tx.descripcion_gasto}` : ''}
                    </p>
                  </div>
                </div>

                {/* Lado derecho: Monto con color diferenciado nítido */}
                <div className="text-right">
                  <span
                    className={`font-monto text-base md:text-lg font-bold ${
                      esIngreso ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {esIngreso ? '+' : '-'} {formatearMonto(tx.monto)}
                  </span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{tx.medio_pago}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CAMBIAR / CREAR HOGAR */}
      {modalHogarAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setModalHogarAbierto(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition active:scale-95 shadow-xs"
              >
                <span>✕</span>
                <span>Cerrar</span>
              </button>
              <h3 className="text-xl font-serif font-bold text-[#12241F] tracking-tight">Hogares</h3>
              <div className="w-16"></div>
            </div>

            {/* LISTA DE HOGARES DISPONIBLES */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <p className="text-xs font-medium text-gray-500 mb-1">Seleccionar hogar activo:</p>
              {listaHogares.map((h) => {
                const esActivo = h.id_hogar === usuario?.id_hogar;
                return (
                  <div
                    key={h.id_hogar}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      esActivo
                        ? 'bg-emerald-50/70 border-[#1F5C4D]'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className={`w-4 h-4 ${esActivo ? 'text-[#1F5C4D]' : 'text-gray-400'}`} />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{h.nombre_hogar}</h4>
                        <p className="text-[10px] text-gray-400">
                          {h.cantidad_miembros} {h.cantidad_miembros === 1 ? 'miembro' : 'miembros'}
                        </p>
                      </div>
                    </div>
                    {esActivo ? (
                      <span className="text-[11px] font-bold text-[#1F5C4D] bg-[#E8F2EF] px-2.5 py-1 rounded-full">
                        Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cambiarHogarActivo(h)}
                        className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition active:scale-95"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FORMULARIO PARA CREAR NUEVO HOGAR */}
            <form onSubmit={handleCrearHogar} className="pt-3 border-t border-gray-100 space-y-3">
              <label className="block text-xs font-semibold text-gray-700">Crear un nuevo hogar</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nombreNuevoHogar}
                  onChange={(e) => setNombreNuevoHogar(e.target.value)}
                  placeholder="Ej: Casa de Playa"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                  required
                />
                <button
                  type="submit"
                  disabled={creandoHogar}
                  className="px-4 py-2 bg-[#1F5C4D] hover:bg-[#18473c] text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50 active:scale-95"
                >
                  {creandoHogar ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistorialPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Cargando Historial...</div>}>
      <HistorialContenido />
    </Suspense>
  );
}
