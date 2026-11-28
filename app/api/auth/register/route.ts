import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { crearHogar } from '@/servicios/mongo/hogares';
import { generarTokenJWT, AUTH_COOKIE_NAME } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { nombre_completo, correo, contrasena, nombre_hogar } = await request.json();

    if (!nombre_completo || !correo || !contrasena) {
      return NextResponse.json(
        { mensaje: 'Debes proporcionar tu nombre, correo y contraseña' },
        { status: 400 }
      );
    }

    if (contrasena.length < 6) {
      return NextResponse.json(
        { mensaje: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const emailNormalizado = correo.toLowerCase().trim();
    const db = await getDatabase();

    // Comprobar si ya existe una cuenta con este correo
    const existeEnHogar = await db.collection('hogares').findOne({
      'miembros.correo': emailNormalizado
    });

    if (existeEnHogar) {
      return NextResponse.json(
        { mensaje: 'Ya existe una cuenta registrada con este correo electrónico' },
        { status: 409 }
      );
    }

    const nombreHogarFinal = nombre_hogar?.trim() || `Hogar de ${nombre_completo.split(' ')[0]}`;

    // Crear el hogar con el miembro fundador
    const nuevoHogar = await crearHogar({
      nombre_hogar: nombreHogarFinal,
      miembro_inicial: {
        nombre_completo: nombre_completo.trim(),
        correo: emailNormalizado,
        contrasena: contrasena
      }
    });

    const miembroCreado = nuevoHogar.miembros[0];

    // Generar token JWT firmado
    const tokenJWT = generarTokenJWT({
      id_miembro: miembroCreado.id_miembro,
      correo: miembroCreado.correo,
      nombre_completo: miembroCreado.nombre_completo,
      id_hogar: nuevoHogar.id_hogar,
      nombre_hogar: nuevoHogar.nombre_hogar
    });

    const response = NextResponse.json({
      mensaje: 'Cuenta registrada exitosamente',
      usuario: {
        id_miembro: miembroCreado.id_miembro,
        correo: miembroCreado.correo,
        nombre_completo: miembroCreado.nombre_completo,
        id_hogar: nuevoHogar.id_hogar,
        nombre_hogar: nuevoHogar.nombre_hogar
      }
    });

    // Guardar en cookie HttpOnly segura (inaccesible desde JS / consola)
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
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { mensaje: 'Error al crear la cuenta: ' + (error.message || 'Error interno') },
      { status: 500 }
    );
  }
}
