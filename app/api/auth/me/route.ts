import { NextRequest, NextResponse } from 'next/server';
import { verificarTokenJWT, AUTH_COOKIE_NAME } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * Valida la sesión del usuario verificando la cookie HttpOnly que contiene el JWT.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { autenticado: false, mensaje: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    const payload = verificarTokenJWT(token);

    if (!payload) {
      return NextResponse.json(
        { autenticado: false, mensaje: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Retornar los datos del usuario decodificados del JWT (sin tokens ni contraseñas)
    return NextResponse.json({
      autenticado: true,
      usuario: {
        id_miembro: payload.id_miembro,
        correo: payload.correo,
        nombre_completo: payload.nombre_completo,
        id_hogar: payload.id_hogar,
        nombre_hogar: payload.nombre_hogar
      }
    });
  } catch (error) {
    return NextResponse.json(
      { autenticado: false, mensaje: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}
