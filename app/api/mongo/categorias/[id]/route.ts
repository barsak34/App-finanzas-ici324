import { NextResponse } from 'next/server';
import { actualizarCategoria, eliminarCategoria } from '@/servicios/mongo/categorias';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { nombre_categoria, descripcion } = await request.json();

    if (!nombre_categoria || nombre_categoria.trim() === '') {
      return NextResponse.json(
        { mensaje: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    const actualizada = await actualizarCategoria(params.id, {
      nombre_categoria,
      descripcion
    });

    return NextResponse.json({
      mensaje: 'Categoría actualizada exitosamente',
      categoria: actualizada
    });
  } catch (error: any) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json(
      { mensaje: 'Error al actualizar categoría', detalle: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resultado = await eliminarCategoria(params.id);
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error al eliminar categoría:', error);
    if (error.status === 409) {
      return NextResponse.json(
        { mensaje: error.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { mensaje: 'Error al eliminar categoría', detalle: error.message },
      { status: 500 }
    );
  }
}
