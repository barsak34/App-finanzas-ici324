'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

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

      {/* LISTA DE CATEGORÍAS (Figura 7) */}
      {cargando ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">
          Cargando categorías...
        </div>
      ) : (
        <div className="space-y-2">
          {categorias.map((cat) => (
            <div
              key={cat.id_categoria}
              className="bg-white rounded-xl p-3.5 px-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EEF0EA] text-[#12241F] font-bold text-sm flex items-center justify-center shrink-0">
                  {cat.nombre_categoria.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{cat.nombre_categoria}</h4>
                  {cat.descripcion && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{cat.descripcion}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => abrirEditar(cat)}
                className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-lg transition"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL / FORMULARIO EDITAR CATEGORÍA (Figura 8 del informe) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl border border-gray-100">
            {/* Cabecera modal resaltada */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={cerrarModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition active:scale-95 shadow-xs"
              >
                <span className="text-gray-500 font-bold">✕</span>
                <span>Cancelar</span>
              </button>
              <h3 className="text-xl font-serif font-bold text-[#12241F] tracking-tight">
                {modoEdicion ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <div className="w-20"></div>
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
