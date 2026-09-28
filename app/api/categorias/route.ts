import { NextRequest, NextResponse } from 'next/server';
import { insertarCategoria, listarCategorias } from '@/servicios/categorias';
import { sanitizeString } from '@/lib/seguridad';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categorias = await listarCategorias();
    return NextResponse.json({
      success: true,
      total: categorias.length,
      data: categorias,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/categorias:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener categorias' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre_categoria, descripcion } = body;

    const nombreLimpio = sanitizeString(nombre_categoria);
    if (!nombreLimpio || nombreLimpio.length < 2) {
      return NextResponse.json(
        { success: false, error: 'nombre_categoria debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    const nuevaCategoria = await insertarCategoria({
      nombre_categoria: nombreLimpio,
      descripcion: sanitizeString(descripcion) || null,
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Categoria registrada exitosamente',
      data: nuevaCategoria,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/categorias:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Ya existe una categoria con ese nombre' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Error al registrar categoria' },
      { status: 500 }
    );
  }
}
