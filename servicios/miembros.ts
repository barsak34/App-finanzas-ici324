import { query } from '@/lib/db';
import { Miembro } from '@/tipos';

/**
 * Consulta 2 (INSERT):
 * Inserta un nuevo miembro en la base de datos con contraseña hasheada.
 */
export async function insertarMiembro(datos: {
  nombre_completo: string;
  correo: string;
  telefono?: string | null;
  contrasena?: string | null;
  estado_activo?: boolean;
}): Promise<Miembro> {
  const sql = `
    INSERT INTO MIEMBRO (nombre_completo, correo, telefono, contrasena, estado_activo)
    VALUES ($1, $2, $3, $4, COALESCE($5, TRUE))
    RETURNING id_miembro, nombre_completo, correo, telefono, estado_activo;
  `;
  const params = [
    datos.nombre_completo,
    datos.correo,
    datos.telefono || null,
    datos.contrasena || null,
    datos.estado_activo ?? true,
  ];

  const result = await query<Miembro>(sql, params);
  return result.rows[0];
}

/**
 * Consulta 4 (UPDATE):
 * Actualiza el teléfono y datos de un miembro existente.
 */
export async function actualizarDatosMiembro(
  id_miembro: number,
  datos: {
    telefono?: string | null;
    nombre_completo?: string;
    correo?: string;
    contrasena?: string | null;
  }
): Promise<Miembro | null> {
  const sql = `
    UPDATE MIEMBRO
    SET 
      telefono = COALESCE($1, telefono),
      nombre_completo = COALESCE($2, nombre_completo),
      correo = COALESCE($3, correo),
      contrasena = COALESCE($4, contrasena)
    WHERE id_miembro = $5
    RETURNING id_miembro, nombre_completo, correo, telefono, estado_activo;
  `;
  const params = [
    datos.telefono !== undefined ? datos.telefono : null,
    datos.nombre_completo || null,
    datos.correo || null,
    datos.contrasena || null,
    id_miembro,
  ];

  const result = await query<Miembro>(sql, params);
  return result.rows[0] || null;
}

/**
 * Consulta 8 (DELETE / Baja Lógica):
 * Cambia el estado_activo de un miembro a FALSE sin borrar el registro físico.
 */
export async function bajaLogicaMiembro(id_miembro: number): Promise<Miembro | null> {
  const sql = `
    UPDATE MIEMBRO
    SET estado_activo = FALSE
    WHERE id_miembro = $1
    RETURNING id_miembro, nombre_completo, correo, telefono, estado_activo;
  `;
  const params = [id_miembro];

  const result = await query<Miembro>(sql, params);
  return result.rows[0] || null;
}

/**
 * Consulta 9 (SELECT Simple):
 * Selecciona nombre y correo de los miembros donde estado_activo sea TRUE.
 */
export async function listarMiembrosActivos(): Promise<Pick<Miembro, 'nombre_completo' | 'correo'>[]> {
  const sql = `
    SELECT nombre_completo, correo
    FROM MIEMBRO
    WHERE estado_activo = TRUE
    ORDER BY nombre_completo ASC;
  `;

  const result = await query<Pick<Miembro, 'nombre_completo' | 'correo'>>(sql);
  return result.rows;
}

/**
 * Consulta adicional para listar todos los miembros
 */
export async function listarTodosLosMiembros(): Promise<Miembro[]> {
  const sql = `
    SELECT id_miembro, nombre_completo, correo, telefono, estado_activo
    FROM MIEMBRO
    ORDER BY id_miembro ASC;
  `;
  const result = await query<Miembro>(sql);
  return result.rows;
}

/**
 * Consulta adicional para obtener un miembro por su ID
 */
export async function obtenerMiembroPorId(id_miembro: number): Promise<Miembro | null> {
  const sql = `
    SELECT id_miembro, nombre_completo, correo, telefono, estado_activo
    FROM MIEMBRO
    WHERE id_miembro = $1;
  `;
  const result = await query<Miembro>(sql, [id_miembro]);
  return result.rows[0] || null;
}
