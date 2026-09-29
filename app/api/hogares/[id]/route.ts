import { NextRequest, NextResponse } from 'next/server';
import { obtenerHogarPorId, obtenerMiembrosPorHogar } from '@/servicios/hogares';
import { isValidId, ofuscarCorreo } from '@/lib/seguridad';

interface RouteContext {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'ID de hogar invalido' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const hogar = await obtenerHogarPorId(id);

    if (!hogar) {
      return NextResponse.json({ success: false, error: 'Hogar no encontrado' }, { status: 404 });
    }

    const miembros = await obtenerMiembrosPorHogar(id);
    const miembrosOfuscados = miembros.map(m => ({
      ...m,
      correo_ofuscado: ofuscarCorreo(m.correo),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...hogar,
        total_miembros: miembrosOfuscados.length,
        miembros: miembrosOfuscados,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/hogares/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar hogar' }, { status: 500 });
  }
}
