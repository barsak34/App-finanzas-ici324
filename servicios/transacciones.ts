import { query } from '@/lib/db';
import { Transaccion, TransaccionConMiembro, TransaccionDetallada, TransaccionConHogar } from '@/tipos';

/**
 * Consulta 3 (INSERT):
 * Inserta una nueva transacción vinculada a un miembro y una categoría.
 */
export async function insertarTransaccion(datos: {
  id_miembro: number;
  id_categoria: number;
  tipo_movimiento: 'Ingreso' | 'Egreso' | string;
  monto: number;
  medio_pago: string;
  descripcion_gasto?: string | null;
  fecha_registro?: Date | string;
}): Promise<Transaccion> {
  const sql = `
    INSERT INTO TRANSACCION (
      id_miembro,
      id_categoria,
      tipo_movimiento,
      monto,
      medio_pago,
      descripcion_gasto,
      fecha_registro
    )
    VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))
    RETURNING id_transaccion, id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto, fecha_registro;
  `;
  const params = [
    datos.id_miembro,
    datos.id_categoria,
    datos.tipo_movimiento,
    datos.monto,
    datos.medio_pago,
    datos.descripcion_gasto || null,
    datos.fecha_registro || null,
  ];

  const result = await query<Transaccion>(sql, params);
  return result.rows[0];
}

/**
 * Consulta 5 (UPDATE):
 * Modifica el monto de una transacción específica.
 */
export async function modificarMontoTransaccion(
  id_transaccion: number,
  nuevo_monto: number
): Promise<Transaccion | null> {
  const sql = `
    UPDATE TRANSACCION
    SET monto = $1
    WHERE id_transaccion = $2
    RETURNING id_transaccion, id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto, fecha_registro;
  `;
  const params = [nuevo_monto, id_transaccion];

  const result = await query<Transaccion>(sql, params);
  return result.rows[0] || null;
}

/**
 * Consulta 6 (DELETE):
 * Elimina una transacción de la base de datos por su ID.
 */
export async function eliminarTransaccion(id_transaccion: number): Promise<Transaccion | null> {
  const sql = `
    DELETE FROM TRANSACCION
    WHERE id_transaccion = $1
    RETURNING id_transaccion, id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto, fecha_registro;
  `;
  const params = [id_transaccion];

  const result = await query<Transaccion>(sql, params);
  return result.rows[0] || null;
}

/**
 * Consulta 10 (SELECT con 1 JOIN):
 * Seleccionar nombre del miembro, monto y fecha_registro de la tabla Transacción
 * unida con Miembro, filtrando solo por 'Egreso'.
 */
export async function listarEgresosConMiembro(): Promise<TransaccionConMiembro[]> {
  const sql = `
    SELECT 
      m.nombre_completo,
      t.monto,
      t.fecha_registro
    FROM TRANSACCION t
    INNER JOIN MIEMBRO m ON t.id_miembro = m.id_miembro
    WHERE t.tipo_movimiento = 'Egreso'
    ORDER BY t.fecha_registro DESC;
  `;

  const result = await query<TransaccionConMiembro>(sql);
  return result.rows;
}

/**
 * Consulta 11 (SELECT con 2 JOINs):
 * Seleccionar nombre del miembro, nombre de la categoría y monto de la tabla Transacción,
 * unida con Miembro y Categoría, filtrando transacciones mayores a un monto específico.
 */
export async function listarTransaccionesMayoresA(montoMinimo: number): Promise<TransaccionDetallada[]> {
  const sql = `
    SELECT 
      m.nombre_completo,
      c.nombre_categoria,
      t.monto
    FROM TRANSACCION t
    INNER JOIN MIEMBRO m ON t.id_miembro = m.id_miembro
    INNER JOIN CATEGORIA c ON t.id_categoria = c.id_categoria
    WHERE t.monto > $1
    ORDER BY t.monto DESC;
  `;
  const params = [montoMinimo];

  const result = await query<TransaccionDetallada>(sql, params);
  return result.rows;
}

/**
 * Consulta adicional para listar todas las transacciones
 */
export async function listarTransacciones(): Promise<Transaccion[]> {
  const sql = `
    SELECT id_transaccion, id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto, fecha_registro
    FROM TRANSACCION
    ORDER BY fecha_registro DESC;
  `;
  const result = await query<Transaccion>(sql);
  return result.rows;
}

/**
 * Consulta adicional para obtener una transacción por ID
 */
export async function obtenerTransaccionPorId(id_transaccion: number): Promise<Transaccion | null> {
  const sql = `
    SELECT id_transaccion, id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto, fecha_registro
    FROM TRANSACCION
    WHERE id_transaccion = $1;
  `;
  const result = await query<Transaccion>(sql, [id_transaccion]);
  return result.rows[0] || null;
}

/**
 * Consulta 14 (SELECT con 2 JOINs del Informe):
 * Obtener las transacciones mayores a un monto, mostrando quién lo gastó y en qué hogar.
 */
export async function listarTransaccionesPorHogar(montoMinimo: number): Promise<TransaccionConHogar[]> {
  const sql = `
    SELECT H.nombre_hogar, M.nombre_completo, T.monto
    FROM TRANSACCION T
    JOIN MIEMBRO M ON T.id_miembro = M.id_miembro
    JOIN HOGAR H ON M.id_hogar = H.id_hogar
    WHERE T.monto > $1
    ORDER BY T.monto DESC;
  `;
  const result = await query<TransaccionConHogar>(sql, [montoMinimo]);
  return result.rows;
}
