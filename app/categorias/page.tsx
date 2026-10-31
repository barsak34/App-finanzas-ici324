'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, ShoppingCart, Zap, Car, UtensilsCrossed, HeartPulse, Briefcase, GraduationCap, Tag as TagIcon,
  Home as HomeIcon, PawPrint, Package
} from 'lucide-react';

interface Categoria {
  id_categoria: string;
  nombre_categoria: string;
  descripcion: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados del modal de edición / creación (Figura 8 del informe)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState<Categoria | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarCategorias = async () => {
    try {
      const res = await fetch('/api/mongo/categorias');
      const data = await res.json();
      setCategorias(data.categorias || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirCrear = () => {
    setModoEdicion(false);
    setCategoriaActual(null);
    setNombre('');
    setDescripcion('');
    setErrorEliminar(null);
    setModalAbierto(true);
  };

  const abrirEditar = (cat: Categoria) => {
    setModoEdicion(true);
    setCategoriaActual(cat);
    setNombre(cat.nombre_categoria);
    setDescripcion(cat.descripcion);
    setErrorEliminar(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setErrorEliminar(null);
  };

  const getCategoriaConfig = (nombre: string) => {
    const n = (nombre || '').toLowerCase();
    if (n.includes('ingres') || n.includes('sueldo') || n.includes('remun')) {
      return { icon: Briefcase, bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
    }
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

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setGuardando(true);
    setErrorEliminar(null);

    try {
      if (modoEdicion && categoriaActual) {
        // Actualizar
        const res = await fetch(`/api/mongo/categorias/${categoriaActual.id_categoria}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_categoria: nombre, descripcion })
        });
        if (res.ok) {
          await cargarCategorias();
          cerrarModal();
        }
      } else {
        // Crear
        const res = await fetch('/api/mongo/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre_categoria: nombre, descripcion })
        });
        if (res.ok) {
          await cargarCategorias();
          cerrarModal();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!categoriaActual) return;
    setErrorEliminar(null);
    setGuardando(true);

    try {
      const res = await fetch(`/api/mongo/categorias/${categoriaActual.id_categoria}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!res.ok) {
        // Mostrar exactamente el aviso de la Figura 8: "No se puede eliminar: tiene transacciones asociadas."
        setErrorEliminar(data.mensaje || 'No se puede eliminar: tiene transacciones asociadas.');
        setGuardando(false);
        return;
      }

      await cargarCategorias();
      cerrarModal();
    } catch (err) {
      setErrorEliminar('Error al intentar eliminar');
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE CATEGORÍAS (Figura 7) */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-[#12241F]">Categorías</h1>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-1.5 bg-[#12241F] hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva
        </button>
      </div>

      {/* LISTA DE CATEGORÍAS (CON SKELETON PREVIO) */}
      {cargando ? (
        <div className="space-y-2 animate-fadeIn">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3.5 px-4 shadow-xs border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full skeleton-shimmer shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-28 h-4 rounded-md skeleton-shimmer" />
                  <div className="w-36 h-3 rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="w-14 h-7 rounded-lg skeleton-shimmer shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categorias.map((cat) => {
            const config = getCategoriaConfig(cat.nombre_categoria);
            const IconoCat = config.icon;
            return (
              <div
                key={cat.id_categoria}
                className="bg-white rounded-xl p-3.5 px-4 shadow-xs border border-gray-100 flex items-center justify-between gap-3 hover:border-gray-200 hover:shadow-sm transition-all interactive-card"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center shrink-0 border ${config.bg}`}
                  >
                    <IconoCat className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{cat.nombre_categoria}</h4>
                    {cat.descripcion && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{cat.descripcion}</p>
                    )}
                  </div>
                </div>

              <button
                onClick={() => abrirEditar(cat)}
                className="shrink-0 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-lg transition active:scale-95"
              >
                Editar
              </button>
            </div>
            );
          })}
        </div>
      )}

      {/* MODAL / FORMULARIO EDITAR CATEGORÍA (Figura 8 del informe) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl border border-gray-100">
            {/* Cabecera modal centrada armoniosamente */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center pb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={cerrarModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition active:scale-95 shadow-xs"
              >
                <span className="text-gray-500 font-bold">✕</span>
                <span>Cancelar</span>
              </button>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#12241F] tracking-tight text-center px-2">
                {modoEdicion ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <div className="w-[88px]"></div>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoCapitalize="sentences"
                  placeholder="Ej: Supermercado"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  autoCapitalize="sentences"
                  placeholder="Compras de despensa y artículos del hogar"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              {/* Botón Guardar cambios (Verde oscuro, Figura 8) */}
              <button
                type="submit"
                disabled={guardando}
                className="w-full py-3 bg-[#1F5C4D] hover:bg-[#18473c] text-white font-medium rounded-xl text-xs transition shadow-sm active:scale-[0.99]"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>

              {/* Botón Eliminar categoría (Solo en modo edición) */}
              {modoEdicion && (
                <button
                  type="button"
                  onClick={handleEliminar}
                  disabled={guardando}
                  className="w-full py-2.5 text-[#8F3F2B] border border-[#8F3F2B]/40 hover:bg-[#FDEEEB] font-medium rounded-xl text-xs transition"
                >
                  Eliminar categoría
                </button>
              )}

              {/* AVISO DE ERROR AL ELIMINAR (Figura 8: "No se puede eliminar: tiene transacciones asociadas.") */}
              {errorEliminar && (
                <div className="p-3 bg-[#FDEEEB] border border-[#8F3F2B]/50 rounded-xl text-center text-xs text-[#8F3F2B] font-medium animate-fadeIn">
                  {errorEliminar}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
