import { NextRequest, NextResponse } from 'next/server';
import { eliminarCategoria, obtenerCategoriaPorId } from '@/servicios/categorias';
import { isValidId } from '@/lib/seguridad';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'ID invalido' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const categoria = await obtenerCategoriaPorId(id);

    if (!categoria) {
      return NextResponse.json({ success: false, error: 'Categoria no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: categoria }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'ID invalido' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const categoriaEliminada = await eliminarCategoria(id);

    if (!categoriaEliminada) {
      return NextResponse.json({ success: false, error: 'Categoria no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Categoria personalizada eliminada exitosamente',
      data: categoriaEliminada,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en DELETE /api/categorias/[id]:', error);
    if (error.code === '23503') {
      return NextResponse.json({
        success: false,
        error: 'No se puede eliminar la categoria porque existen transacciones asociadas a ella.',
      }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
