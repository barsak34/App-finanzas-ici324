import { NextResponse } from 'next/server';
import { listarTransacciones, obtenerBalanceHogar, crearTransaccion } from '@/servicios/mongo/transacciones';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_hogar = searchParams.get('id_hogar') || undefined;
    const id_categoria = searchParams.get('id_categoria') || undefined;
    const tipo = searchParams.get('tipo') || undefined;
    const desde = searchParams.get('desde') || undefined;
    const hasta = searchParams.get('hasta') || undefined;

    const [transacciones, balance] = await Promise.all([
      listarTransacciones({ id_hogar, id_categoria, tipo_movimiento: tipo, desde, hasta }),
      obtenerBalanceHogar(id_hogar)
    ]);

    return NextResponse.json({
      transacciones,
      balance
    });
  } catch (error: any) {
    console.error('Error al listar transacciones:', error);
    return NextResponse.json(
      { mensaje: 'Error al consultar transacciones', detalle: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_hogar, id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto } = body;

    // Validaciones de negocio
    if (!id_hogar || !id_miembro || !id_categoria || !tipo_movimiento) {
      return NextResponse.json(
        { mensaje: 'Faltan campos requeridos para registrar la transacción' },
        { status: 400 }
      );
    }

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return NextResponse.json(
        { mensaje: 'Ingresa un monto mayor a 0' },
        { status: 400 }
      );
    }

    if (!['Ingreso', 'Egreso'].includes(tipo_movimiento)) {
      return NextResponse.json(
        { mensaje: 'El tipo de movimiento debe ser Ingreso o Egreso' },
        { status: 400 }
      );
    }

    const nuevaTransaccion = await crearTransaccion({
      id_hogar,
      id_miembro,
      id_categoria,
      tipo_movimiento,
      monto: montoNum,
      medio_pago: medio_pago || 'Débito',
      descripcion_gasto
    });

    return NextResponse.json(
      {
        mensaje: 'Transacción guardada exitosamente',
        transaccion: nuevaTransaccion
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al registrar transacción:', error);
    return NextResponse.json(
      { mensaje: 'Error al guardar la transacción', detalle: error.message },
      { status: 500 }
    );
  }
}
