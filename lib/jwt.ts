import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_finanzas_ici324_grupo23_2026';
const JWT_EXPIRES_IN = '8h';

export interface UsuarioTokenPayload {
  id_miembro: number | string;
  correo: string;
  nombre_completo: string;
  id_hogar: number | string;
  nombre_hogar: string;
}

/**
 * Genera un token JWT firmado para la sesión del miembro
 */
export function generarTokenJWT(payload: UsuarioTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verificarTokenJWT(token: string): UsuarioTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UsuarioTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Nombre estándar de la cookie HttpOnly
 */
export const AUTH_COOKIE_NAME = 'auth_token';
