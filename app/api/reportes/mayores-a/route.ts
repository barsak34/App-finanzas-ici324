import { NextRequest, NextResponse } from 'next/server';
import { listarTransaccionesMayoresA } from '@/servicios/transacciones';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const montoParam = searchParams.get('monto') || '0';
    const montoMinimo = parseFloat(montoParam);

    if (isNaN(montoMinimo) || montoMinimo < 0) {
      return NextResponse.json(
        { success: false, error: 'El parametro monto debe ser un numero mayor o igual a 0' },
        { status: 400 }
      );
    }

    const resultados = await listarTransaccionesMayoresA(montoMinimo);

    return NextResponse.json({
      success: true,
      monto_filtro: montoMinimo,
      total: resultados.length,
      data: resultados,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/reportes/mayores-a:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener transacciones' },
      { status: 500 }
    );
  }
}
