import { NextResponse } from 'next/server';
import { listarCategorias, crearCategoria } from '@/servicios/mongo/categorias';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categorias = await listarCategorias();
    return NextResponse.json({ categorias });
  } catch (error: any) {
    console.error('Error al listar categorías:', error);
    return NextResponse.json(
      { mensaje: 'Error al obtener categorías', detalle: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nombre_categoria, descripcion } = await request.json();

    if (!nombre_categoria || nombre_categoria.trim() === '') {
      return NextResponse.json(
        { mensaje: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    const nueva = await crearCategoria({ nombre_categoria, descripcion });
    return NextResponse.json(
      { mensaje: 'Categoría creada con éxito', categoria: nueva },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { mensaje: 'Error al registrar categoría', detalle: error.message },
      { status: 500 }
    );
  }
}
