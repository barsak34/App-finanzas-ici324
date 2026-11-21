import { NextRequest, NextResponse } from 'next/server';
import { subirACloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para subir imágenes de comprobantes o boletas a Cloudinary
 * Recibe: FormData con campo 'file'
 * Retorna: { url: string, nombre: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { mensaje: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { mensaje: 'Formato no soportado. Debe ser imagen PNG, JPG o WEBP' },
        { status: 400 }
      );
    }

    // Validar tamaño máximo (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { mensaje: 'La imagen excede el límite de 5MB' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Cloudinary
    const urlSegura = await subirACloudinary(buffer, 'finanzas_hogar/comprobantes');

    return NextResponse.json({
      mensaje: 'Comprobante subido exitosamente a Cloudinary',
      url: urlSegura,
      nombre_archivo: file.name
    });
  } catch (error: any) {
    console.error('Error al procesar subida a Cloudinary:', error);
    return NextResponse.json(
      { mensaje: 'Error interno al procesar y subir la imagen' },
      { status: 500 }
    );
  }
}
