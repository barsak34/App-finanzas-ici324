import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * Cierra la sesión del usuario eliminando la cookie HttpOnly con maxAge: 0
 */
export async function POST() {
  const response = NextResponse.json({
    mensaje: 'Sesión cerrada correctamente'
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });

  return response;
}
