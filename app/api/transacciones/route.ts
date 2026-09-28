import { NextRequest, NextResponse } from 'next/server';
import { insertarTransaccion, listarTransacciones } from '@/servicios/transacciones';
import { isValidId, isValidPositiveNumber, isValidTipoMovimiento, sanitizeString } from '@/lib/seguridad';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transacciones = await listarTransacciones();
    return NextResponse.json({
      success: true,
      total: transacciones.length,
      data: transacciones,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/transacciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener transacciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_miembro,
      id_categoria,
      tipo_movimiento,
      monto,
      medio_pago,
      descripcion_gasto,
      fecha_registro,
    } = body;

    if (!isValidId(id_miembro)) {
      return NextResponse.json({ success: false, error: 'id_miembro debe ser un numero entero positivo' }, { status: 400 });
    }

    if (!isValidId(id_categoria)) {
      return NextResponse.json({ success: false, error: 'id_categoria debe ser un numero entero positivo' }, { status: 400 });
    }

    if (!isValidTipoMovimiento(tipo_movimiento)) {
      return NextResponse.json({ success: false, error: 'tipo_movimiento solo puede ser "Ingreso" o "Egreso"' }, { status: 400 });
    }

    if (!isValidPositiveNumber(monto)) {
      return NextResponse.json({ success: false, error: 'El monto debe ser un numero positivo mayor a 0' }, { status: 400 });
    }

    const medioPagoLimpio = sanitizeString(medio_pago);
    if (!medioPagoLimpio) {
      return NextResponse.json({ success: false, error: 'El medio de pago es obligatorio' }, { status: 400 });
    }

    const nuevaTransaccion = await insertarTransaccion({
      id_miembro: parseInt(id_miembro, 10),
      id_categoria: parseInt(id_categoria, 10),
      tipo_movimiento,
      monto: Math.round(Number(monto) * 100) / 100,
      medio_pago: medioPagoLimpio,
      descripcion_gasto: sanitizeString(descripcion_gasto) || null,
      fecha_registro,
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Transaccion registrada exitosamente',
      data: nuevaTransaccion,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/transacciones:', error);
    if (error.code === '23503') {
      return NextResponse.json({
        success: false,
        error: 'El miembro o la categoria especificada no existen (violacion de integridad referencial).',
      }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: 'Error al registrar transaccion' },
      { status: 500 }
    );
  }
}
