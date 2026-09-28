import { NextResponse } from 'next/server';
import { listarEgresosConMiembro } from '@/servicios/transacciones';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const egresos = await listarEgresosConMiembro();

    return NextResponse.json({
      success: true,
      total: egresos.length,
      data: egresos,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/reportes/egresos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener egresos' },
      { status: 500 }
    );
  }
}
