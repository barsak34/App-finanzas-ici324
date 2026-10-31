'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, CheckCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

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
    sesion.nombre_hogar = 'Departamento';
    localStorage.setItem('usuario_sesion', JSON.stringify(sesion));
    setUsuario(sesion);
    cargarDatos(sesion.id_hogar);
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

      {/* HEADER CON BOTÓN ESCRITORIO (Figura 11) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#12241F]">Historial</h1>
          <p className="text-xs text-gray-500 mt-1">
            Hogar: <span className="font-medium text-gray-700">Departamento</span>
          </p>
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

        {/* FILTROS POR FECHA */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-gray-500 mb-1 font-medium">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>
          <div>
            <label className="block text-gray-500 mb-1 font-medium">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
            />
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
