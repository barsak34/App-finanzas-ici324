'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, Zap, Car, UtensilsCrossed, HeartPulse, Briefcase, 
  GraduationCap, Package, Home as HomeIcon, PawPrint, Tag as TagIcon, 
  ChevronDown, CreditCard, Banknote, Calendar, Check,
  ArrowDownRight, ArrowUpRight
} from 'lucide-react';

export default function NuevaTransaccionPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState<'Egreso' | 'Ingreso'>('Egreso');
  const [monto, setMonto] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [medioPago, setMedioPago] = useState<string>('Débito');
  const [descripcion, setDescripcion] = useState<string>('');
  const [idMiembro, setIdMiembro] = useState<string>('');
  const [fechaRegistro, setFechaRegistro] = useState<string>(new Date().toISOString().split('T')[0]);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  // Estados de desplegables interactivos para ahorrar espacio en pantalla
  const [desplegableCatAbierto, setDesplegableCatAbierto] = useState(false);
  const [desplegablePagoAbierto, setDesplegablePagoAbierto] = useState(false);
  const [mostrarDetallesExtra, setMostrarDetallesExtra] = useState(false);

  // Errores de validación en vivo
  const [errorMonto, setErrorMonto] = useState<string | null>(null);
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);

  const getCategoriaConfig = (nombre: string, esIngreso: boolean) => {
    if (esIngreso) {
      return {
        icon: Briefcase,
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      };
    }
    const n = (nombre || '').toLowerCase();
    if (n.includes('super') || n.includes('despensa') || n.includes('alim')) {
      return { icon: ShoppingCart, bg: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
    if (n.includes('arriendo') || n.includes('renta') || n.includes('hogar') || n.includes('depa') || n.includes('casa')) {
      return { icon: HomeIcon, bg: 'bg-[#FBEBE8] text-[#8F3F2B] border-[#8F3F2B]/40' };
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
    return { icon: TagIcon, bg: 'bg-emerald-50 text-[#1F5C4D] border-emerald-200' };
  };

  const mediosPagoOpciones = [
    { nombre: 'Débito', icon: CreditCard },
    { nombre: 'Efectivo', icon: Banknote },
    { nombre: 'Crédito', icon: CreditCard }
  ];

  useEffect(() => {
    const sesionStr = localStorage.getItem('usuario_sesion');
    if (!sesionStr) {
      router.push('/login');
      return;
    }
    const sesion = JSON.parse(sesionStr);
    setUsuario(sesion);
    setIdMiembro(sesion.id_miembro);

    // Cargar categorías disponibles
    fetch('/api/mongo/categorias')
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data.categorias || []);
        if (data.categorias && data.categorias.length > 0) {
          setCategoriaSeleccionada(data.categorias[0].id_categoria);
        }
      });

    // Cargar integrantes del hogar
    fetch(`/api/mongo/hogar?id_hogar=${sesion.id_hogar}`)
      .then((res) => res.json())
      .then((data) => {
        setMiembros(data.miembros || []);
      });
  }, [router]);

  const formatearMontoInput = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '');
    if (!soloNumeros) return '';
    return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formateado = formatearMontoInput(e.target.value);
    setMonto(formateado);
    const num = Number(formateado.replace(/\./g, ''));
    if (num > 0) setErrorMonto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hayError = false;

    // Validación 1: Monto > 0 (Figura 5)
    const montoNum = Number(monto.replace(/\./g, ''));
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setErrorMonto('Ingresa un monto mayor a 0');
      hayError = true;
    } else {
      setErrorMonto(null);
    }

    // Validación 2: Categoría seleccionada (Figura 5)
    if (!categoriaSeleccionada) {
      setErrorCategoria('Seleccione una categoría');
      hayError = true;
    } else {
      setErrorCategoria(null);
    }

    if (hayError) return;

    setCargando(true);
    try {
      const res = await fetch('/api/mongo/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_hogar: usuario.id_hogar,
          id_miembro: idMiembro || usuario.id_miembro,
          id_categoria: categoriaSeleccionada,
          tipo_movimiento: tipoMovimiento,
          monto: montoNum,
          medio_pago: medioPago,
          descripcion_gasto: descripcion,
          fecha_registro: fechaRegistro
        })
      });

      if (res.ok) {
        // Redirige al Historial con el aviso "Transacción guardada" (Figura 3)
        router.push('/?guardado=1');
      } else {
        const errorData = await res.json();
        alert(errorData.mensaje || 'Error al guardar');
        setCargando(false);
      }
    } catch (err) {
      alert('Error de conexión');
      setCargando(false);
    }
  };

  const catActual = categorias.find((c) => c.id_categoria === categoriaSeleccionada);
  const catConfig = catActual
    ? getCategoriaConfig(catActual.nombre_categoria, tipoMovimiento === 'Ingreso')
    : { icon: TagIcon, bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  const IconoCatActual = catConfig.icon;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-5 animate-fadeIn">
      {/* CABECERA EN UNA SOLA LÍNEA AL LADO DE CANCELAR */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <Link
          href="/"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition active:scale-95 shadow-xs"
        >
          <span className="text-gray-500 font-bold">✕</span>
          <span>Cancelar</span>
        </Link>
        <h2 className="text-base sm:text-lg font-serif font-bold text-[#12241F] tracking-tight whitespace-nowrap truncate">
          Nueva transacción
        </h2>
      </div>

      {/* CONMUTADOR ELEGANTE GASTO / INGRESO */}
      <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setTipoMovimiento('Egreso');
            setErrorMonto(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
            tipoMovimiento === 'Egreso'
              ? 'bg-[#8F3F2B] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>Gasto</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoMovimiento('Ingreso');
            setErrorMonto(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
            tipoMovimiento === 'Ingreso'
              ? 'bg-[#1F5C4D] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Ingreso</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECCIÓN MONTO PRINCIPAL ESTILO FINTECH */}
        <div className="bg-[#F8F9F8] rounded-2xl p-4 text-center border border-gray-100">
          <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
            Monto a registrar
          </label>
          <div className="flex items-center justify-center">
            <span className="font-monto text-3xl font-extrabold text-gray-800 mr-1">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={monto}
              onChange={handleMontoChange}
              placeholder="0"
              className="font-monto text-3xl md:text-4xl font-extrabold text-[#12241F] w-56 text-center focus:outline-none bg-transparent"
              autoFocus
            />
          </div>
          {errorMonto && (
            <p className="text-xs text-[#8F3F2B] font-medium mt-1 animate-fadeIn">
              {errorMonto}
            </p>
          )}
        </div>

        {/* CATEGORÍA: SELECTOR DESPLEGABLE COMPACTO */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Categoría
          </label>

          {/* Botón activador que muestra la categoría seleccionada sin ocupar la pantalla */}
          <button
            type="button"
            onClick={() => {
              setDesplegableCatAbierto(!desplegableCatAbierto);
              setDesplegablePagoAbierto(false);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              desplegableCatAbierto
                ? 'border-[#1F5C4D] ring-2 ring-[#1F5C4D]/10 bg-white'
                : 'border-gray-200 hover:border-gray-300 bg-[#FAFAFA]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${catConfig.bg}`}>
                <IconoCatActual className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-gray-900 truncate">
                {catActual ? catActual.nombre_categoria : 'Seleccionar categoría...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${desplegableCatAbierto ? 'rotate-180 text-[#1F5C4D]' : ''}`} />
          </button>

          {/* Lista desplegable compacta con scroll */}
          {desplegableCatAbierto && (
            <div className="mt-1.5 p-2 rounded-xl border border-gray-200 bg-white shadow-lg space-y-1 max-h-56 overflow-y-auto animate-fadeIn z-20">
              {categorias.map((cat) => {
                const config = getCategoriaConfig(cat.nombre_categoria, tipoMovimiento === 'Ingreso');
                const IconoItem = config.icon;
                const seleccionado = categoriaSeleccionada === cat.id_categoria;
                return (
                  <button
                    key={cat.id_categoria}
                    type="button"
                    onClick={() => {
                      setCategoriaSeleccionada(cat.id_categoria);
                      setErrorCategoria(null);
                      setDesplegableCatAbierto(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                      seleccionado
                        ? 'bg-emerald-50 text-[#1F5C4D] font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${config.bg}`}>
                        <IconoItem className="w-3 h-3" />
                      </div>
                      <span className="truncate">{cat.nombre_categoria}</span>
                    </div>
                    {seleccionado && <Check className="w-3.5 h-3.5 text-[#1F5C4D]" />}
                  </button>
                );
              })}
            </div>
          )}

          {errorCategoria && (
            <p className="text-xs text-[#8F3F2B] font-medium mt-1 animate-fadeIn">
              {errorCategoria}
            </p>
          )}
        </div>

        {/* MEDIO DE PAGO: SELECTOR DESPLEGABLE COMPACTO */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Medio de pago
          </label>

          <button
            type="button"
            onClick={() => {
              setDesplegablePagoAbierto(!desplegablePagoAbierto);
              setDesplegableCatAbierto(false);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              desplegablePagoAbierto
                ? 'border-[#1F5C4D] ring-2 ring-[#1F5C4D]/10 bg-white'
                : 'border-gray-200 hover:border-gray-300 bg-[#FAFAFA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-900">{medioPago}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${desplegablePagoAbierto ? 'rotate-180 text-[#1F5C4D]' : ''}`} />
          </button>

          {desplegablePagoAbierto && (
            <div className="mt-1.5 p-2 rounded-xl border border-gray-200 bg-white shadow-lg space-y-1 animate-fadeIn z-20">
              {mediosPagoOpciones.map((opcion) => {
                const IconoMedio = opcion.icon;
                const seleccionado = medioPago === opcion.nombre;
                return (
                  <button
                    key={opcion.nombre}
                    type="button"
                    onClick={() => {
                      setMedioPago(opcion.nombre);
                      setDesplegablePagoAbierto(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                      seleccionado
                        ? 'bg-emerald-50 text-[#1F5C4D] font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconoMedio className="w-3.5 h-3.5 text-gray-500" />
                      <span>{opcion.nombre}</span>
                    </div>
                    {seleccionado && <Check className="w-3.5 h-3.5 text-[#1F5C4D]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FECHA DEL MOVIMIENTO */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Fecha
          </label>
          <div className="relative">
            <input
              type="date"
              value={fechaRegistro}
              onChange={(e) => setFechaRegistro(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs cursor-pointer focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            autoCapitalize="sentences"
            placeholder="Ej: Compra mensual, almuerzo"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
          />
        </div>

        {/* DETALLES EXTRA OCULTOS: RESPONSABLE */}
        {miembros.length > 1 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setMostrarDetallesExtra(!mostrarDetallesExtra)}
              className="text-[11px] font-semibold text-gray-400 hover:text-[#1F5C4D] flex items-center gap-1 transition"
            >
              <span>{mostrarDetallesExtra ? 'Ocultar responsable' : 'Cambiar integrante responsable'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${mostrarDetallesExtra ? 'rotate-180' : ''}`} />
            </button>

            {mostrarDetallesExtra && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-fadeIn">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Registrado a nombre de
                </label>
                <select
                  value={idMiembro}
                  onChange={(e) => setIdMiembro(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#1F5C4D]"
                >
                  {miembros.map((m) => (
                    <option key={m.id_miembro} value={m.id_miembro}>
                      {m.nombre_completo} {m.id_miembro === usuario?.id_miembro ? '(Tú)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* BOTÓN GUARDAR PRINCIPAL */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full py-3.5 bg-[#1F5C4D] hover:bg-[#18473c] text-white font-semibold rounded-xl text-xs transition shadow-sm active:scale-[0.99] disabled:opacity-50 mt-4"
        >
          {cargando ? 'Guardando transacción...' : 'Guardar transacción'}
        </button>
      </form>
    </div>
  );
}
