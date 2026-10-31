import { NextResponse } from 'next/server';
import { listarHogares, crearHogar } from '@/servicios/mongo/hogares';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hogares = await listarHogares();
    return NextResponse.json({ hogares });
  } catch (error: any) {
    console.error('Error al listar hogares:', error);
    return NextResponse.json(
      { mensaje: 'Error al consultar hogares', detalle: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nombre_hogar, miembro_inicial } = await request.json();

    if (!nombre_hogar || nombre_hogar.trim() === '') {
      return NextResponse.json(
        { mensaje: 'El nombre del hogar es obligatorio' },
        { status: 400 }
      );
    }

    const nuevo = await crearHogar({
      nombre_hogar,
      miembro_inicial
    });

    return NextResponse.json(
      { mensaje: 'Hogar creado exitosamente', hogar: nuevo },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear hogar:', error);
    return NextResponse.json(
      { mensaje: 'Error al registrar hogar', detalle: error.message },
      { status: 500 }
    );
  }
}
