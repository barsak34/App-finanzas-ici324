import { query } from '@/lib/db';
import { Miembro, MiembroConHogar } from '@/tipos';

/**
 * Consulta 6 (INSERT):
 * Inserta un nuevo miembro en la base de datos vinculado a un hogar.
 */
export async function insertarMiembro(datos: {
  nombre_completo: string;
  correo: string;
  telefono?: string | null;
  contrasena?: string | null;
  id_hogar?: number | null;
  estado_activo?: boolean;
}): Promise<Miembro> {
  const sql = `
    INSERT INTO MIEMBRO (nombre_completo, correo, telefono, contrasena, id_hogar, estado_activo)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE))
    RETURNING id_miembro, id_hogar, nombre_completo, correo, telefono, estado_activo;
  `;
  const params = [
    datos.nombre_completo,
    datos.correo,
    datos.telefono || null,
    datos.contrasena || null,
    datos.id_hogar || null,
    datos.estado_activo ?? true,
  ];

  const result = await query<Miembro>(sql, params);
  return result.rows[0];
}

/**
 * Consulta 8 (UPDATE):
 * Actualiza teléfono, datos y hogar de un miembro existente.
 */
export async function actualizarDatosMiembro(
  id_miembro: number,
  datos: {
    telefono?: string | null;
    nombre_completo?: string;
    correo?: string;
    contrasena?: string | null;
    id_hogar?: number | null;
  }
): Promise<Miembro | null> {
  const sql = `
    UPDATE MIEMBRO
    SET 
      telefono = COALESCE($1, telefono),
      nombre_completo = COALESCE($2, nombre_completo),
      correo = COALESCE($3, correo),
      contrasena = COALESCE($4, contrasena),
      id_hogar = COALESCE($5, id_hogar)
    WHERE id_miembro = $6
    RETURNING id_miembro, id_hogar, nombre_completo, correo, telefono, estado_activo;
  `;
  const params = [
    datos.telefono !== undefined ? datos.telefono : null,
    datos.nombre_completo || null,
    datos.correo || null,
    datos.contrasena || null,
    datos.id_hogar !== undefined ? datos.id_hogar : null,
    id_miembro,
  ];

  const result = await query<Miembro>(sql, params);
  return result.rows[0] || null;
}

/**
 * Baja Lógica: Cambia estado_activo a FALSE
 */
export async function bajaLogicaMiembro(id_miembro: number): Promise<Miembro | null> {
  const sql = `
    UPDATE MIEMBRO
    SET estado_activo = FALSE
    WHERE id_miembro = $1
    RETURNING id_miembro, id_hogar, nombre_completo, correo, telefono, estado_activo;
  `;
  const params = [id_miembro];

  const result = await query<Miembro>(sql, params);
  return result.rows[0] || null;
}

/**
 * Consulta 12 (SELECT 1 Simple):
 * Selecciona nombre y correo de miembros activos.
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
 * Consulta 13 (SELECT 2 con 1 JOIN):
 * Obtener los miembros activos y el nombre del hogar al que pertenecen.
 */
export async function listarMiembrosConHogar(): Promise<MiembroConHogar[]> {
  const sql = `
    SELECT H.nombre_hogar, M.nombre_completo
    FROM MIEMBRO M
    JOIN HOGAR H ON M.id_hogar = H.id_hogar
    WHERE M.estado_activo = TRUE
    ORDER BY H.nombre_hogar ASC, M.nombre_completo ASC;
  `;

  const result = await query<MiembroConHogar>(sql);
  return result.rows;
}

/**
 * Listar miembros (opcionalmente filtrados por id_hogar)
 */
export async function listarTodosLosMiembros(id_hogar?: number): Promise<Miembro[]> {
  if (id_hogar) {
    const sql = `
      SELECT id_miembro, id_hogar, nombre_completo, correo, telefono, estado_activo
      FROM MIEMBRO
      WHERE id_hogar = $1
      ORDER BY id_miembro ASC;
    `;
    const result = await query<Miembro>(sql, [id_hogar]);
    return result.rows;
  }

  const sql = `
    SELECT id_miembro, id_hogar, nombre_completo, correo, telefono, estado_activo
    FROM MIEMBRO
    ORDER BY id_miembro ASC;
  `;
  const result = await query<Miembro>(sql);
  return result.rows;
}

/**
 * Obtener miembro por ID
 */
export async function obtenerMiembroPorId(id_miembro: number): Promise<Miembro | null> {
  const sql = `
    SELECT id_miembro, id_hogar, nombre_completo, correo, telefono, estado_activo
    FROM MIEMBRO
    WHERE id_miembro = $1;
  `;
  const result = await query<Miembro>(sql, [id_miembro]);
  return result.rows[0] || null;
}
