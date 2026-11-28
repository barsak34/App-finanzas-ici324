import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { crearHogar } from '@/servicios/mongo/hogares';
import { generarTokenJWT, AUTH_COOKIE_NAME } from '@/lib/jwt';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { correo, nombre_completo, google_id } = await request.json();

    if (!correo) {
      return NextResponse.json(
        { mensaje: 'Se requiere una cuenta de correo válida de Google' },
        { status: 400 }
      );
    }

    const emailNormalizado = correo.toLowerCase().trim();
    const nombreUsuario = nombre_completo?.trim() || emailNormalizado.split('@')[0];
    const db = await getDatabase();

    // 1. Buscar si ya existe el usuario en algún hogar
    let hogar = await db.collection('hogares').findOne({
      miembros: {
        $elemMatch: {
          correo: emailNormalizado,
          estado_activo: true
        }
      }
    });

    if (!hogar) {
      hogar = await db.collection('hogares').findOne({
        'miembros.correo': emailNormalizado
      });
    }

    let idMiembro = '';
    let nombreHogar = '';
    let idHogar = '';

    if (hogar && hogar.miembros) {
      // Usuario ya existe en el sistema
      const miembro = hogar.miembros.find(
        (m: any) => m.correo?.toLowerCase()?.trim() === emailNormalizado
      );

      if (miembro?.desactivado || miembro?.estado_activo === false) {
        return NextResponse.json(
          { mensaje: 'Esta cuenta ha sido desactivada por el administrador del hogar' },
          { status: 403 }
        );
      }

      idMiembro = miembro.id_miembro;
      nombreHogar = hogar.nombre_hogar;
      idHogar = hogar._id.toString();
    } else {
      // 2. Primer ingreso con Google: Crear automáticamente su hogar y cuenta
      const claveAleatoria = crypto.randomBytes(16).toString('hex');
      const nuevoHogar = await crearHogar({
        nombre_hogar: `Hogar de ${nombreUsuario.split(' ')[0]}`,
        miembro_inicial: {
          nombre_completo: nombreUsuario,
          correo: emailNormalizado,
          contrasena: claveAleatoria
        }
      });

      const nuevoMiembro = nuevoHogar.miembros[0];
      idMiembro = nuevoMiembro.id_miembro;
      nombreHogar = nuevoHogar.nombre_hogar;
      idHogar = nuevoHogar.id_hogar;
    }

    // 3. Generar token JWT firmado
    const tokenJWT = generarTokenJWT({
      id_miembro: idMiembro,
      correo: emailNormalizado,
      nombre_completo: nombreUsuario,
      id_hogar: idHogar,
      nombre_hogar: nombreHogar
    });

    const response = NextResponse.json({
      mensaje: 'Autenticación con Google exitosa',
      usuario: {
        id_miembro: idMiembro,
        correo: emailNormalizado,
        nombre_completo: nombreUsuario,
        id_hogar: idHogar,
        nombre_hogar: nombreHogar
      }
    });

    // 4. Asignar Cookie HttpOnly
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: tokenJWT,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return response;
  } catch (error: any) {
    console.error('Error en autenticación Google:', error);
    return NextResponse.json(
      { mensaje: 'Error al iniciar sesión con Google: ' + (error.message || 'Error interno') },
      { status: 500 }
    );
  }
}
