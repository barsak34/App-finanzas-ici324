import { NextRequest, NextResponse } from 'next/server';
import {
  eliminarTransaccion,
  modificarMontoTransaccion,
  obtenerTransaccionPorId,
} from '@/servicios/transacciones';
import { isValidId, isValidPositiveNumber } from '@/lib/seguridad';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'El identificador debe ser un numero entero positivo' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const transaccion = await obtenerTransaccionPorId(id);

    if (!transaccion) {
      return NextResponse.json({ success: false, error: 'Transaccion no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: transaccion }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/transacciones/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar transaccion' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'El identificador debe ser un numero entero positivo' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { monto } = body;

    if (!isValidPositiveNumber(monto)) {
      return NextResponse.json(
        { success: false, error: 'Debe proporcionar un monto numerico positivo mayor a 0' },
        { status: 400 }
      );
    }

    const montoRedondeado = Math.round(Number(monto) * 100) / 100;
    const transaccionActualizada = await modificarMontoTransaccion(id, montoRedondeado);

    if (!transaccionActualizada) {
      return NextResponse.json({ success: false, error: 'Transaccion no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Monto de transaccion actualizado exitosamente',
      data: transaccionActualizada,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en PATCH /api/transacciones/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error al modificar transaccion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'El identificador debe ser un numero entero positivo' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const transaccionEliminada = await eliminarTransaccion(id);

    if (!transaccionEliminada) {
      return NextResponse.json({ success: false, error: 'Transaccion no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Transaccion eliminada exitosamente',
      data: transaccionEliminada,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en DELETE /api/transacciones/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar transaccion' }, { status: 500 });
  }
}
