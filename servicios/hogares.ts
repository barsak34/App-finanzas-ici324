import { query } from '@/lib/db';
import { Hogar, Miembro } from '@/tipos';

/**
 * Consulta 4 (INSERT):
 * Inserta un nuevo hogar en la base de datos.
 */
export async function insertarHogar(nombre_hogar: string): Promise<Hogar> {
  const sql = `
    INSERT INTO HOGAR (nombre_hogar)
    VALUES ($1)
    RETURNING id_hogar, nombre_hogar, fecha_creacion;
  `;
  const result = await query<Hogar>(sql, [nombre_hogar]);
  return result.rows[0];
}

/**
 * Lista todos los hogares registrados.
 */
export async function listarHogares(): Promise<Hogar[]> {
  const sql = `
    SELECT id_hogar, nombre_hogar, fecha_creacion
    FROM HOGAR
    ORDER BY id_hogar ASC;
  `;
  const result = await query<Hogar>(sql);
  return result.rows;
}

/**
 * Obtiene un hogar por su ID.
 */
export async function obtenerHogarPorId(id_hogar: number): Promise<Hogar | null> {
  const sql = `
    SELECT id_hogar, nombre_hogar, fecha_creacion
    FROM HOGAR
    WHERE id_hogar = $1;
  `;
  const result = await query<Hogar>(sql, [id_hogar]);
  return result.rows[0] || null;
}

/**
 * Obtiene todos los miembros asociados a un hogar especifico.
 */
export async function obtenerMiembrosPorHogar(id_hogar: number): Promise<Miembro[]> {
  const sql = `
    SELECT id_miembro, id_hogar, nombre_completo, correo, telefono, estado_activo
    FROM MIEMBRO
    WHERE id_hogar = $1
    ORDER BY nombre_completo ASC;
  `;
  const result = await query<Miembro>(sql, [id_hogar]);
  return result.rows;
}
