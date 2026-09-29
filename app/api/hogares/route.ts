import { NextRequest, NextResponse } from 'next/server';
import { insertarHogar, listarHogares } from '@/servicios/hogares';
import { sanitizeString } from '@/lib/seguridad';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hogares
 * Lista todos los hogares registrados en el sistema.
 */
export async function GET() {
  try {
    const hogares = await listarHogares();
    return NextResponse.json({
      success: true,
      total: hogares.length,
      data: hogares,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/hogares:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener hogares' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hogares
 * Consulta 4 (INSERT): Registra un nuevo hogar.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre_hogar } = body;

    const nombreLimpio = sanitizeString(nombre_hogar);
    if (!nombreLimpio || nombreLimpio.length < 3) {
      return NextResponse.json(
        { success: false, error: 'El nombre del hogar debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    const nuevoHogar = await insertarHogar(nombreLimpio);

    return NextResponse.json({
      success: true,
      mensaje: 'Hogar registrado exitosamente',
      data: nuevoHogar,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/hogares:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al registrar hogar' },
      { status: 500 }
    );
  }
}
