import bcrypt from 'bcryptjs';

/**
 * Modulo de Seguridad: Hash de contraseñas, Ofuscacion de Datos (Data Masking)
 * y Validaciones de Entrada.
 */

const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Ofusca un correo electronico para no exponer datos sensibles en texto plano.
 * Ejemplo: 'maximixasz@gmail.com' -> 'm********z@gmail.com'
 */
export function ofuscarCorreo(correo: string): string {
  if (!correo || !correo.includes('@')) return correo;
  const [nombre, dominio] = correo.split('@');
  if (nombre.length > 2) {
    const ofuscado = nombre[0] + '*'.repeat(nombre.length - 2) + nombre[nombre.length - 1];
    return `${ofuscado}@${dominio}`;
  } else {
    const ofuscado = nombre[0] + '*';
    return `${ofuscado}@${dominio}`;
  }
}

/**
 * Genera un hash seguro para contraseñas usando bcrypt con salt de 10 rondas.
 */
export async function hashearContrasena(contrasena: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(contrasena, salt);
}

/**
 * Compara una contraseña en texto plano contra su hash almacenado en la BD.
 */
export async function verificarContrasena(contrasena: string, hash: string): Promise<boolean> {
  return bcrypt.compare(contrasena, hash);
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return REGEX_CORREO.test(email.trim());
}

export function isValidPositiveNumber(val: any): boolean {
  const num = Number(val);
  return !isNaN(num) && isFinite(num) && num > 0;
}

export function isValidId(val: any): boolean {
  const id = parseInt(val, 10);
  return !isNaN(id) && isFinite(id) && id > 0;
}

export function isValidTipoMovimiento(tipo: string): boolean {
  return tipo === 'Ingreso' || tipo === 'Egreso';
}

export function sanitizeString(str?: string | null): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 500);
}
