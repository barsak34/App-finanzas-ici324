import { NextResponse } from 'next/server';
import { listarMiembrosConHogar } from '@/servicios/miembros';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reportes/miembros-hogar
 * Consulta 13 (SELECT con 1 JOIN):
 * Obtener los miembros activos y el nombre del hogar al que pertenecen.
 */
export async function GET() {
  try {
    const resultados = await listarMiembrosConHogar();

    return NextResponse.json({
      success: true,
      total: resultados.length,
      data: resultados,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/reportes/miembros-hogar:', error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar miembros por hogar' },
      { status: 500 }
    );
  }
}
