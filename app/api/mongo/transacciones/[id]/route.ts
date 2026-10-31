import { NextResponse } from 'next/server';
import { actualizarTransaccion, eliminarTransaccion } from '@/servicios/mongo/transacciones';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const resultado = await actualizarTransaccion(id, body);

    return NextResponse.json({
      mensaje: 'Transacción actualizada exitosamente',
      transaccion: resultado
    });
  } catch (error: any) {
    console.error('Error al actualizar transacción:', error);
    return NextResponse.json(
      { mensaje: 'Error al actualizar la transacción', detalle: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await eliminarTransaccion(id);

    return NextResponse.json({
      mensaje: 'Transacción eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error al eliminar transacción:', error);
    return NextResponse.json(
      { mensaje: 'Error al eliminar la transacción', detalle: error.message },
      { status: 500 }
    );
  }
}
