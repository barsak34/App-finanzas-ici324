import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

export async function listarCategorias() {
  const db = await getDatabase();
  const items = await db.collection('categorias').find({}).sort({ nombre_categoria: 1 }).toArray();
  return items.map((cat: any) => ({
    id_categoria: cat._id.toString(),
    nombre_categoria: cat.nombre_categoria,
    descripcion: cat.descripcion || ''
  }));
}

export async function crearCategoria(datos: { nombre_categoria: string; descripcion?: string }) {
  const db = await getDatabase();
  const res = await db.collection('categorias').insertOne({
    nombre_categoria: datos.nombre_categoria.trim(),
    descripcion: datos.descripcion ? datos.descripcion.trim() : ''
  });
  return {
    id_categoria: res.insertedId.toString(),
    nombre_categoria: datos.nombre_categoria,
    descripcion: datos.descripcion || ''
  };
}

export async function actualizarCategoria(idCategoria: string, datos: { nombre_categoria: string; descripcion?: string }) {
  const db = await getDatabase();
  await db.collection('categorias').updateOne(
    { _id: new ObjectId(idCategoria) },
    {
      $set: {
        nombre_categoria: datos.nombre_categoria.trim(),
        descripcion: datos.descripcion ? datos.descripcion.trim() : ''
      }
    }
  );
  return { id_categoria: idCategoria, ...datos };
}

export async function eliminarCategoria(idCategoria: string) {
  const db = await getDatabase();
  const catObjId = new ObjectId(idCategoria);

  // Verificar si hay transacciones asociadas
  const transaccionesAsociadas = await db.collection('transacciones').countDocuments({
    id_categoria: catObjId
  });

  if (transaccionesAsociadas > 0) {
    const error: any = new Error('No se puede eliminar: tiene transacciones asociadas');
    error.status = 409;
    throw error;
  }

  await db.collection('categorias').deleteOne({ _id: catObjId });
  return { mensaje: 'Categoría eliminada exitosamente' };
}
