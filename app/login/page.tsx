'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [nombreHogar, setNombreHogar] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [modalGoogleAbierto, setModalGoogleAbierto] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNombreInput, setGoogleNombreInput] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const endpoint = esRegistro ? '/api/auth/register' : '/api/auth/login';
      const payload = esRegistro
        ? { nombre_completo: nombreCompleto, correo, contrasena, nombre_hogar: nombreHogar }
        : { correo, contrasena };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || 'Error en las credenciales ingresadas');
        setContrasena('');
        setCargando(false);
        return;
      }

      // Guardar información pública de sesión
      localStorage.setItem('usuario_sesion', JSON.stringify(data.usuario));
      router.push('/');
    } catch (err: any) {
      setError('Error al conectar con el servidor');
      setCargando(false);
    }
  };

  const handleGoogleAuth = async (emailOverride?: string, nameOverride?: string) => {
    setError(null);
    setCargando(true);

    const email = (emailOverride || googleEmailInput || correo).trim();
    const name = (nameOverride || googleNombreInput || nombreCompleto).trim();

    if (!email) {
      setModalGoogleAbierto(true);
      setCargando(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: email,
          nombre_completo: name || email.split('@')[0]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || 'Error al iniciar sesión con Google');
        setCargando(false);
        return;
      }

      localStorage.setItem('usuario_sesion', JSON.stringify(data.usuario));
      setModalGoogleAbierto(false);
      router.push('/');
    } catch (err) {
      setError('Error al autenticar con Google');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#EEF0EA]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl mb-4 overflow-hidden shadow-xs flex items-center justify-center">
            <img src="/icon.svg" alt="Logo" className="w-full h-full" />
          </div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Finanzas del Hogar</p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#12241F] mt-1">
            {esRegistro ? 'Crear Cuenta' : 'Bienvenido'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {esRegistro
              ? 'Registra tu cuenta y comienza a administrar los gastos de tu hogar.'
              : 'Accede de forma segura a tus finanzas familiares.'}
          </p>
        </div>

        {/* Botón Iniciar sesión con Google */}
        <button
          type="button"
          onClick={() => {
            if (correo && correo.includes('@')) {
              handleGoogleAuth(correo, nombreCompleto);
            } else {
              setModalGoogleAbierto(true);
            }
          }}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm border border-gray-200 transition shadow-xs active:scale-[0.99] mb-5"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-xs text-gray-400 font-medium uppercase tracking-wider shrink-0">
            o con tu correo
          </span>
          <div className="border-t border-gray-200 w-full" />
        </div>

        {/* Banner de Error */}
        {error && (
          <div className="mb-5 p-3 bg-[#FDEEEB] border border-[#8F3F2B]/30 rounded-xl text-sm text-[#8F3F2B] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {esRegistro && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Ej: Sofía Valenzuela"
                  required={esRegistro}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] focus:ring-1 focus:ring-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de tu Hogar (opcional)</label>
                <input
                  type="text"
                  value={nombreHogar}
                  onChange={(e) => setNombreHogar(e.target.value)}
                  placeholder="Ej: Departamento Las Condes"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] focus:ring-1 focus:ring-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu-correo@gmail.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] focus:ring-1 focus:ring-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] focus:ring-1 focus:ring-[#1F5C4D] bg-[#FAFAFA]"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[#1F5C4D] hover:bg-[#18473c] text-white font-medium rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 mt-2 active:scale-[0.99]"
          >
            {cargando
              ? 'Procesando...'
              : esRegistro
              ? 'Registrarme y comenzar'
              : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          {esRegistro ? (
            <p className="text-xs text-gray-500">
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setEsRegistro(false);
                  setError(null);
                }}
                className="text-[#1F5C4D] font-bold hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              ¿No tienes una cuenta aún?{' '}
              <button
                type="button"
                onClick={() => {
                  setEsRegistro(true);
                  setError(null);
                }}
                className="text-[#1F5C4D] font-bold hover:underline"
              >
                Crear una cuenta gratis
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Modal flotante centrado para autenticar con Google */}
      {modalGoogleAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Acceder con Google</h3>
                <p className="text-xs text-gray-500">Ingresa tu cuenta de Google o Gmail</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Correo de Google / Gmail</label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  autoFocus
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tu Nombre (opcional)</label>
                <input
                  type="text"
                  value={googleNombreInput}
                  onChange={(e) => setGoogleNombreInput(e.target.value)}
                  placeholder="Tu nombre o alias"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F5C4D] bg-[#FAFAFA]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalGoogleAbierto(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleAuth()}
                  disabled={!googleEmailInput}
                  className="w-1/2 py-2.5 rounded-xl bg-[#1F5C4D] hover:bg-[#18473c] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
