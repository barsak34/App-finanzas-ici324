'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await res.json();

      if (!res.ok) {
        // En caso de error, se muestra el aviso y se conservan los datos escritos (Figura 2 del informe)
        setError(data.mensaje || 'Correo o contraseña incorrectos');
        setCargando(false);
        return;
      }

      // Guardar sesión en cliente
      localStorage.setItem('usuario_sesion', JSON.stringify(data.usuario));
      router.push('/');
    } catch (err: any) {
      setError('Error al conectar con el servidor');
      setCargando(false);
    }
  };

  const llenarCredencial = (email: string) => {
    setCorreo(email);
    setContrasena('123456');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#EEF0EA]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Finanzas del Hogar</p>
          <h1 className="text-3xl font-serif font-bold text-[#12241F] mt-1">Bienvenido</h1>
        </div>

        {/* Banner de Error (Figura 2 del informe: aviso terracota con bordes redondeados) */}
        {error && (
          <div className="mb-6 p-3 bg-[#FDEEEB] border border-[#8F3F2B] rounded-lg text-sm text-[#8F3F2B] font-medium animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@correo.cl"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] focus:ring-1 focus:ring-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] focus:ring-1 focus:ring-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 bg-[#1F5C4D] hover:bg-[#18473c] text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 mt-4 active:scale-[0.99]"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Acceso rápido para la presentación */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2 font-medium">Acceso rápido para exposición:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => llenarCredencial('maximiliano@ejemplo.com')}
              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 py-1.5 px-2 rounded border border-gray-200 transition"
            >
              Maximiliano
            </button>
            <button
              type="button"
              onClick={() => llenarCredencial('gladys@ejemplo.com')}
              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 py-1.5 px-2 rounded border border-gray-200 transition"
            >
              Gladys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
