import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

/**
 * Autentica a un miembro por su correo y contraseña dentro de cualquier hogar
 */
export async function autenticarMiembro(correo: string, contrasenaPlana: string) {
  const db = await getDatabase();
  const hogar = await db.collection('hogares').findOne({
    'miembros.correo': correo.toLowerCase().trim()
  });

  if (!hogar) {
    return null;
  }

  const miembro = hogar.miembros.find(
    (m: any) => m.correo.toLowerCase() === correo.toLowerCase().trim()
  );

  if (!miembro || !miembro.estado_activo) {
    return null;
  }

  const claveValida = await bcrypt.compare(contrasenaPlana, miembro.contrasena);
  if (!claveValida) {
    return null;
  }

  return {
    id_miembro: miembro.id_miembro,
    nombre_completo: miembro.nombre_completo,
    correo: miembro.correo,
    id_hogar: hogar._id.toString(),
    nombre_hogar: hogar.nombre_hogar,
    estado_activo: miembro.estado_activo
  };
}

/**
 * Obtiene el hogar con sus miembros
 */
export async function obtenerHogar(idHogar: string) {
  const db = await getDatabase();
  return await db.collection('hogares').findOne({ _id: new ObjectId(idHogar) });
}

/**
 * Agrega un nuevo miembro a un hogar
 */
export async function agregarMiembro(idHogar: string, datos: {
  nombre_completo: string;
  correo: string;
  contrasena: string;
  telefono?: string;
}) {
  const db = await getDatabase();
  const hogar = await db.collection('hogares').findOne({ _id: new ObjectId(idHogar) });
  if (!hogar) throw new Error('Hogar no encontrado');

  const nuevoNumero = (hogar.miembros?.length || 0) + 1;
  const idMiembro = `M${String(nuevoNumero).padStart(3, '0')}`;
  const hash = await bcrypt.hash(datos.contrasena, 10);

  const nuevoMiembro = {
    id_miembro: idMiembro,
    nombre_completo: datos.nombre_completo,
    correo: datos.correo.toLowerCase().trim(),
    contrasena: hash,
    telefono: datos.telefono || null,
    estado_activo: true
  };

  await db.collection('hogares').updateOne(
    { _id: new ObjectId(idHogar) },
    { $push: { miembros: nuevoMiembro } } as any
  );

  return nuevoMiembro;
}

/**
 * Alterna el estado activo/inactivo de un miembro
 */
export async function cambiarEstadoMiembro(idHogar: string, idMiembro: string, estadoActivo: boolean) {
  const db = await getDatabase();
  return await db.collection('hogares').updateOne(
    { _id: new ObjectId(idHogar), 'miembros.id_miembro': idMiembro },
    { $set: { 'miembros.$.estado_activo': estadoActivo } }
  );
}
