import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

export interface FiltrosTransaccion {
  id_hogar?: string;
  id_categoria?: string;
  tipo_movimiento?: string;
  desde?: string;
  hasta?: string;
}

/**
 * Consulta avanzada con Aggregation Pipeline ($lookup para simular JOINs de Categoría y Miembro)
 */
export async function listarTransacciones(filtros: FiltrosTransaccion = {}) {
  const db = await getDatabase();
  const match: any = {};

  if (filtros.id_hogar) {
    try {
      match.id_hogar = new ObjectId(filtros.id_hogar);
    } catch {
      // Si no es ObjectId válido, buscar por coincidencia directa
      match.id_hogar = filtros.id_hogar;
    }
  }

  if (filtros.id_categoria && filtros.id_categoria !== 'Todas') {
    try {
      match.id_categoria = new ObjectId(filtros.id_categoria);
    } catch {
      match.id_categoria = filtros.id_categoria;
    }
  }

  if (filtros.tipo_movimiento && filtros.tipo_movimiento !== 'Todos') {
    match.tipo_movimiento = filtros.tipo_movimiento;
  }

  if (filtros.desde || filtros.hasta) {
    match.fecha_registro = {};
    if (filtros.desde) {
      match.fecha_registro.$gte = new Date(filtros.desde);
    }
    if (filtros.hasta) {
      const hastaDate = new Date(filtros.hasta);
      hastaDate.setHours(23, 59, 59, 999);
      match.fecha_registro.$lte = hastaDate;
    }
  }

  const pipeline: any[] = [
    { $match: match },
    // 1. $lookup con la colección de categorias (Equivalente al JOIN con Categoria)
    {
      $lookup: {
        from: 'categorias',
        localField: 'id_categoria',
        foreignField: '_id',
        as: 'categoria_info'
      }
    },
    { $unwind: { path: '$categoria_info', preserveNullAndEmptyArrays: true } },
    // 2. $lookup con la colección de hogares para obtener los miembros
    {
      $lookup: {
        from: 'hogares',
        localField: 'id_hogar',
        foreignField: '_id',
        as: 'hogar_info'
      }
    },
    { $unwind: { path: '$hogar_info', preserveNullAndEmptyArrays: true } },
    // Ordenar descendente por fecha
    { $sort: { fecha_registro: -1 } }
  ];

  const resultados = await db.collection('transacciones').aggregate(pipeline).toArray();

  return resultados.map((tx: any) => {
    // Buscar el nombre del miembro dentro del array miembros del hogar
    const miembro = tx.hogar_info?.miembros?.find(
      (m: any) => m.id_miembro === tx.id_miembro
    );

    return {
      id_transaccion: tx._id.toString(),
      id_hogar: tx.id_hogar?.toString(),
      id_miembro: tx.id_miembro,
      nombre_miembro: miembro ? miembro.nombre_completo : 'Integrante',
      id_categoria: tx.id_categoria?.toString(),
      nombre_categoria: tx.categoria_info?.nombre_categoria || 'General',
      tipo_movimiento: tx.tipo_movimiento,
      monto: Number(tx.monto),
      medio_pago: tx.medio_pago || 'Débito',
      descripcion_gasto: tx.descripcion_gasto || '',
      fecha_registro: tx.fecha_registro ? new Date(tx.fecha_registro).toISOString() : new Date().toISOString()
    };
  });
}

/**
 * Consulta de agregación con $group para calcular balance (Group By NoSQL)
 */
export async function obtenerBalanceHogar(idHogar?: string) {
  const db = await getDatabase();
  const match: any = {};
  if (idHogar) {
    try {
      match.id_hogar = new ObjectId(idHogar);
    } catch {
      match.id_hogar = idHogar;
    }
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$tipo_movimiento',
        total: { $sum: '$monto' },
        cantidad: { $sum: 1 }
      }
    }
  ];

  const resumen = await db.collection('transacciones').aggregate(pipeline).toArray();

  let totalIngresos = 0;
  let totalGastos = 0;

  resumen.forEach((item: any) => {
    if (item._id === 'Ingreso') {
      totalIngresos = item.total;
    } else if (item._id === 'Egreso') {
      totalGastos = item.total;
    }
  });

  return {
    totalIngresos,
    totalGastos,
    balanceNeto: totalIngresos - totalGastos
  };
}

/**
 * Inserta una nueva transacción en MongoDB
 */
export async function crearTransaccion(datos: {
  id_hogar: string;
  id_miembro: string;
  id_categoria: string;
  tipo_movimiento: 'Ingreso' | 'Egreso';
  monto: number;
  medio_pago: string;
  descripcion_gasto?: string;
  fecha_registro?: string;
}) {
  const db = await getDatabase();

  const nueva = {
    id_hogar: new ObjectId(datos.id_hogar),
    id_miembro: datos.id_miembro,
    id_categoria: new ObjectId(datos.id_categoria),
    tipo_movimiento: datos.tipo_movimiento,
    monto: Number(datos.monto),
    medio_pago: datos.medio_pago,
    descripcion_gasto: datos.descripcion_gasto?.trim() || '',
    fecha_registro: datos.fecha_registro ? new Date(datos.fecha_registro) : new Date()
  };

  const res = await db.collection('transacciones').insertOne(nueva);

  return {
    id_transaccion: res.insertedId.toString(),
    ...nueva,
    id_hogar: datos.id_hogar,
    id_categoria: datos.id_categoria
  };
}

/**
 * Actualiza una transacción existente en MongoDB
 */
export async function actualizarTransaccion(id_transaccion: string, datos: {
  id_categoria?: string;
  id_miembro?: string;
  tipo_movimiento?: 'Ingreso' | 'Egreso';
  monto?: number;
  medio_pago?: string;
  descripcion_gasto?: string;
  fecha_registro?: string;
}) {
  const db = await getDatabase();
  const actualizacion: any = {};

  if (datos.id_categoria) actualizacion.id_categoria = new ObjectId(datos.id_categoria);
  if (datos.id_miembro) actualizacion.id_miembro = datos.id_miembro;
  if (datos.tipo_movimiento) actualizacion.tipo_movimiento = datos.tipo_movimiento;
  if (datos.monto !== undefined) actualizacion.monto = Number(datos.monto);
  if (datos.medio_pago) actualizacion.medio_pago = datos.medio_pago;
  if (datos.descripcion_gasto !== undefined) actualizacion.descripcion_gasto = datos.descripcion_gasto.trim();
  if (datos.fecha_registro) actualizacion.fecha_registro = new Date(datos.fecha_registro);

  await db.collection('transacciones').updateOne(
    { _id: new ObjectId(id_transaccion) },
    { $set: actualizacion }
  );

  return { id_transaccion, ...actualizacion };
}

/**
 * Elimina una transacción de MongoDB
 */
export async function eliminarTransaccion(id_transaccion: string) {
  const db = await getDatabase();
  await db.collection('transacciones').deleteOne({ _id: new ObjectId(id_transaccion) });
  return { id_transaccion, eliminado: true };
}

