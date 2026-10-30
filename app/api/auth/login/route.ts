import { NextResponse } from 'next/server';
import { autenticarMiembro } from '@/servicios/mongo/hogares';

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

    const usuario = await autenticarMiembro(correo, contrasena);

    if (!usuario) {
      return NextResponse.json(
        { mensaje: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { mensaje: 'Error interno del servidor al procesar inicio de sesión' },
      { status: 500 }
    );
  }
}
