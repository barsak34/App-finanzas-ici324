'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

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

  // Errores de validación en vivo (Figura 5 del informe)
  const [errorMonto, setErrorMonto] = useState<string | null>(null);
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);

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

  const mediosPagoOpciones = ['Débito', 'Efectivo', 'Crédito'];

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* CABECERA RESALTADA (Título prominente y botón Cancelar visible) */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <Link
          href="/"
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition active:scale-95 shadow-xs"
        >
          <span className="text-gray-500 font-bold">✕</span>
          <span>Cancelar</span>
        </Link>
        <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-[#12241F] tracking-tight whitespace-nowrap text-right">
          Nueva transacción
        </h2>
      </div>

      {/* CONMUTADOR GASTO / INGRESO */}
      <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setTipoMovimiento('Egreso');
            setErrorMonto(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            tipoMovimiento === 'Egreso'
              ? 'bg-[#8F3F2B] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoMovimiento('Ingreso');
            setErrorMonto(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            tipoMovimiento === 'Ingreso'
              ? 'bg-[#1F5C4D] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Ingreso
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN MONTO (Figura 4 y 5) */}
        <div className="text-center pt-2">
          <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
            MONTO
          </label>
          <div className="flex items-center justify-center">
            <span className="font-monto text-3xl font-bold text-gray-900 mr-1">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={monto}
              onChange={handleMontoChange}
              placeholder="0"
              className="font-monto text-3xl md:text-4xl font-bold text-gray-900 w-52 text-center focus:outline-none bg-transparent"
              autoFocus
            />
          </div>
          {/* Mensaje de validación en rojo (Figura 5) */}
          {errorMonto && (
            <p className="text-xs text-[#8F3F2B] font-medium mt-1 animate-fadeIn">
              {errorMonto}
            </p>
          )}
        </div>

        {/* SECCIÓN CATEGORÍA (Píldoras interactivas en cuadrícula) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Categoría</label>
          <div className="grid grid-cols-3 gap-2">
            {categorias.map((cat) => {
              const seleccionado = categoriaSeleccionada === cat.id_categoria;
              return (
                <button
                  type="button"
                  key={cat.id_categoria}
                  onClick={() => {
                    setCategoriaSeleccionada(cat.id_categoria);
                    setErrorCategoria(null);
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all truncate ${
                    seleccionado
                      ? 'bg-[#12241F] text-white border-[#12241F] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.nombre_categoria}
                </button>
              );
            })}
          </div>
          {/* Mensaje de validación (Figura 5) */}
          {errorCategoria && (
            <p className="text-xs text-[#8F3F2B] font-medium mt-1 animate-fadeIn">
              {errorCategoria}
            </p>
          )}
        </div>

        {/* SECCIÓN MEDIO DE PAGO */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Medio de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {mediosPagoOpciones.map((medio) => {
              const seleccionado = medioPago === medio;
              return (
                <button
                  type="button"
                  key={medio}
                  onClick={() => setMedioPago(medio)}
                  className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    seleccionado
                      ? 'bg-[#12241F] text-white border-[#12241F]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {medio}
                </button>
              );
            })}
          </div>
        </div>

        {/* INTEGRANTE RESPONSABLE */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Responsable</label>
          <select
            value={idMiembro}
            onChange={(e) => setIdMiembro(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-[#FAFAFA] focus:outline-none focus:border-[#1F5C4D]"
          >
            {miembros.map((m) => (
              <option key={m.id_miembro} value={m.id_miembro}>
                {m.nombre_completo} {m.id_miembro === usuario?.id_miembro ? '(Tú)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* FECHA DEL MOVIMIENTO CON CALENDARIO DESPLEGABLE */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha del movimiento</label>
          <input
            type="date"
            value={fechaRegistro}
            onChange={(e) => setFechaRegistro(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs cursor-pointer focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
          />
        </div>

        {/* DESCRIPCIÓN OPCIONAL */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción (opcional)</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            autoCapitalize="sentences"
            placeholder="Ej: Compra mensual supermercado"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
          />
        </div>

        {/* BOTÓN GUARDAR (Figura 4: botón verde ancho completo al final) */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full py-3.5 bg-[#1F5C4D] hover:bg-[#18473c] text-white font-medium rounded-xl text-sm transition shadow-sm active:scale-[0.99] disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
