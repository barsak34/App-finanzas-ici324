import { NextResponse } from 'next/server';
import { autenticarMiembroSQL } from '@/servicios/miembros';
import { autenticarMiembro } from '@/servicios/mongo/hogares';
import { generarTokenJWT, AUTH_COOKIE_NAME } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { correo, contrasena } = await request.json();

    if (!correo || !contrasena) {
      return NextResponse.json(
        { mensaje: 'Debes proporcionar correo y contraseña' },
        { status: 400 }
      );
    }

    let usuario: any = null;

    // 1. Intentar autenticar primero contra la Base de Datos Relacional (PostgreSQL / Supabase)
    try {
      usuario = await autenticarMiembroSQL(correo, contrasena);
    } catch (sqlError) {
      // Si la BD relacional está en pausa o inaccesible, continuar con el respaldo NoSQL
      usuario = null;
    }

    // 2. Si no se encontró en PostgreSQL, autenticar contra MongoDB Atlas
    if (!usuario) {
      usuario = await autenticarMiembro(correo, contrasena);
    }

    if (!usuario) {
      return NextResponse.json(
        { mensaje: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    if ('desactivado' in usuario && usuario.desactivado) {
      return NextResponse.json(
        { mensaje: 'Esta cuenta ha sido desactivada por el administrador del hogar' },
        { status: 403 }
      );
    }

    // 3. Generar token JWT firmado
    const tokenJWT = generarTokenJWT({
      id_miembro: usuario.id_miembro,
      correo: usuario.correo,
      nombre_completo: usuario.nombre_completo,
      id_hogar: usuario.id_hogar,
      nombre_hogar: usuario.nombre_hogar
    });

    // 4. Crear respuesta (NO incluye token ni contraseña en el JSON del cuerpo)
    const response = NextResponse.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id_miembro: usuario.id_miembro,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        id_hogar: usuario.id_hogar,
        nombre_hogar: usuario.nombre_hogar,
        estado_activo: usuario.estado_activo
      }
    });

    // 5. Asignar Cookie HttpOnly segura para que NUNCA sea accesible desde la consola ni scripts
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: tokenJWT,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 horas
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { mensaje: 'Error interno del servidor al procesar inicio de sesión' },
      { status: 500 }
    );
  }
}
