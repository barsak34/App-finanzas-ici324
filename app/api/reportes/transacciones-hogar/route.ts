import { NextRequest, NextResponse } from 'next/server';
import { listarTransaccionesPorHogar } from '@/servicios/transacciones';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reportes/transacciones-hogar?monto=10000
 * Consulta 14 (SELECT con 2 JOINs):
 * Obtener las transacciones mayores a un monto, mostrando quién lo gastó y en qué hogar.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const montoParam = searchParams.get('monto') || '10000';
    const montoMinimo = parseFloat(montoParam);

    if (isNaN(montoMinimo) || montoMinimo < 0) {
      return NextResponse.json(
        { success: false, error: 'El parametro monto debe ser un numero mayor o igual a 0' },
        { status: 400 }
      );
    }

    const resultados = await listarTransaccionesPorHogar(montoMinimo);

    return NextResponse.json({
      success: true,
      monto_filtro: montoMinimo,
      total: resultados.length,
      data: resultados,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/reportes/transacciones-hogar:', error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar transacciones por hogar' },
      { status: 500 }
    );
  }
}
