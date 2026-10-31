'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, CheckCircle, ArrowDownCircle, ArrowUpCircle, Calendar, Home, ChevronDown,
  ShoppingCart, Zap, Car, UtensilsCrossed, HeartPulse, Briefcase, GraduationCap,
  Sparkles, Wallet, Tag as TagIcon, ArrowUpRight, ArrowDownRight, Layers,
  Home as HomeIcon, PawPrint, Package
} from 'lucide-react';

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

  const getCategoriaConfig = (nombre: string, esIngreso: boolean) => {
    if (esIngreso) {
      return {
        icon: Briefcase,
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }
    const n = (nombre || '').toLowerCase();
    if (n.includes('super') || n.includes('despensa') || n.includes('alim')) {
      return { icon: ShoppingCart, bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
    }
    if (n.includes('arriendo') || n.includes('renta') || n.includes('hogar') || n.includes('depa') || n.includes('casa')) {
      return { icon: HomeIcon, bg: 'bg-teal-50 text-teal-900 border-teal-200' };
    }
    if (n.includes('cuenta') || n.includes('serv') || n.includes('luz') || n.includes('agua') || n.includes('gas') || n.includes('basic') || n.includes('internet')) {
      return { icon: Zap, bg: 'bg-amber-50 text-amber-900 border-amber-200' };
    }
    if (n.includes('mascota') || n.includes('perro') || n.includes('gato') || n.includes('vet')) {
      return { icon: PawPrint, bg: 'bg-purple-50 text-purple-900 border-purple-200' };
    }
    if (n.includes('trans') || n.includes('bencina') || n.includes('auto') || n.includes('micro') || n.includes('metro')) {
      return { icon: Car, bg: 'bg-blue-50 text-blue-900 border-blue-200' };
    }
    if (n.includes('comida') || n.includes('restauran') || n.includes('salida') || n.includes('caf')) {
      return { icon: UtensilsCrossed, bg: 'bg-orange-50 text-orange-900 border-orange-200' };
    }
    if (n.includes('salud') || n.includes('farm') || n.includes('medic') || n.includes('doctor')) {
      return { icon: HeartPulse, bg: 'bg-rose-50 text-rose-900 border-rose-200' };
    }
    if (n.includes('educ') || n.includes('coleg') || n.includes('uni') || n.includes('curso')) {
      return { icon: GraduationCap, bg: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
    }
    if (n.includes('otro') || n.includes('vari')) {
      return { icon: Package, bg: 'bg-sky-50 text-sky-900 border-sky-200' };
    }
    return { icon: TagIcon, bg: 'bg-emerald-50/60 text-[#1F5C4D] border-emerald-200' };
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

      {/* TARJETA DE BALANCE PRINCIPAL ESTILO FINTECH */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#12241F] via-[#16332B] to-[#1F5C4D] rounded-2xl p-6 text-white shadow-md border border-emerald-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Lado izquierdo: Balance Neto */}
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">
              <Wallet className="w-4 h-4 text-emerald-300" />
              <span>Balance neto disponible</span>
            </div>
            <p className="font-monto text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {formatearMonto(balance.balanceNeto)}
            </p>
          </div>

          {/* Lado derecho: Desglose Ingresos y Gastos */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium mb-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                <span>Ingresos</span>
              </div>
              <p className="font-monto text-lg sm:text-xl font-bold text-white">
                {formatearMonto(balance.totalIngresos)}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium mb-0.5">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
                <span>Gastos</span>
              </div>
              <p className="font-monto text-lg sm:text-xl font-bold text-white">
                {formatearMonto(balance.totalGastos)}
              </p>
            </div>
          </div>
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
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs cursor-pointer focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>
          <div>
            <label className="block text-gray-500 mb-1 font-medium">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs cursor-pointer focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>
        </div>
      </div>

      {/* LISTA DE TRANSACCIONES (CON SKELETON PREVIO EN VEZ DE TEXTO) */}
      {cargando ? (
        <div className="space-y-2.5 animate-fadeIn">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3.5 px-4 shadow-xs border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-28 h-4 rounded-md skeleton-shimmer" />
                  <div className="w-40 h-3 rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="text-right space-y-1.5">
                <div className="w-20 h-5 rounded-md skeleton-shimmer ml-auto" />
                <div className="w-12 h-3 rounded-md skeleton-shimmer ml-auto" />
              </div>
            </div>
          ))}
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
            const catConfig = getCategoriaConfig(tx.nombre_categoria, esIngreso);
            const IconoCat = catConfig.icon;
            return (
              <div
                key={tx.id_transaccion}
                className="bg-white rounded-xl p-3.5 px-4 shadow-xs border border-gray-100 flex items-center justify-between hover:border-gray-200 hover:shadow-sm transition-all interactive-card"
              >
                {/* Lado izquierdo: Icono temático vectorial y datos */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 border ${catConfig.bg}`}
                  >
                    <IconoCat className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                      {tx.nombre_categoria}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
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
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setModalHogarAbierto(false)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition active:scale-95 shadow-xs"
              >
                <span>✕</span>
                <span>Cerrar</span>
              </button>
              <h3 className="text-lg md:text-xl font-serif font-bold text-[#12241F] tracking-tight whitespace-nowrap text-right">
                Hogares
              </h3>
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
                  autoCapitalize="words"
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
