import { query } from '@/lib/db';
import { Categoria } from '@/tipos';

/**
 * Consulta 1 (INSERT):
 * Inserta una nueva categoría en la base de datos.
 */
export async function insertarCategoria(datos: {
  nombre_categoria: string;
  descripcion?: string | null;
}): Promise<Categoria> {
  const sql = `
    INSERT INTO CATEGORIA (nombre_categoria, descripcion)
    VALUES ($1, $2)
    RETURNING id_categoria, nombre_categoria, descripcion;
  `;
  const params = [datos.nombre_categoria, datos.descripcion || null];

  const result = await query<Categoria>(sql, params);
  return result.rows[0];
}

/**
 * Consulta 7 (DELETE Físico):
 * Elimina una categoría por su ID.
 */
export async function eliminarCategoria(id_categoria: number): Promise<Categoria | null> {
  const sql = `
    DELETE FROM CATEGORIA
    WHERE id_categoria = $1
    RETURNING id_categoria, nombre_categoria, descripcion;
  `;
  const params = [id_categoria];

  const result = await query<Categoria>(sql, params);
  return result.rows[0] || null;
}

/**
 * Consulta adicional para listar todas las categorías disponibles
 */
export async function listarCategorias(): Promise<Categoria[]> {
  const sql = `
    SELECT id_categoria, nombre_categoria, descripcion
    FROM CATEGORIA
    ORDER BY nombre_categoria ASC;
  `;
  const result = await query<Categoria>(sql);
  return result.rows;
}

/**
 * Consulta adicional para obtener una categoría específica por su ID
 */
export async function obtenerCategoriaPorId(id_categoria: number): Promise<Categoria | null> {
  const sql = `
    SELECT id_categoria, nombre_categoria, descripcion
    FROM CATEGORIA
    WHERE id_categoria = $1;
  `;
  const result = await query<Categoria>(sql, [id_categoria]);
  return result.rows[0] || null;
}
