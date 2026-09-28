import { NextRequest, NextResponse } from 'next/server';
import { actualizarDatosMiembro, bajaLogicaMiembro, obtenerMiembroPorId } from '@/servicios/miembros';
import { isValidEmail, isValidId, sanitizeString, ofuscarCorreo, hashearContrasena } from '@/lib/seguridad';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'El identificador debe ser un numero entero positivo' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const miembro = await obtenerMiembroPorId(id);

    if (!miembro) {
      return NextResponse.json({ success: false, error: 'Miembro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...miembro,
        correo_ofuscado: ofuscarCorreo(miembro.correo),
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/miembros/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error al consultar miembro' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'El identificador debe ser un numero entero positivo' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const body = await request.json();

    const datosActualizar: {
      nombre_completo?: string;
      correo?: string;
      telefono?: string | null;
      contrasena?: string | null;
    } = {};

    if (body.nombre_completo !== undefined) {
      const nombre = sanitizeString(body.nombre_completo);
      if (nombre.length < 2) {
        return NextResponse.json({ success: false, error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 });
      }
      datosActualizar.nombre_completo = nombre;
    }

    if (body.correo !== undefined) {
      const correo = sanitizeString(body.correo).toLowerCase();
      if (!isValidEmail(correo)) {
        return NextResponse.json({ success: false, error: 'El formato de correo no es valido' }, { status: 400 });
      }
      datosActualizar.correo = correo;
    }

    if (body.telefono !== undefined) {
      datosActualizar.telefono = body.telefono ? sanitizeString(body.telefono) : null;
    }

    if (body.contrasena !== undefined && typeof body.contrasena === 'string' && body.contrasena.length >= 6) {
      datosActualizar.contrasena = await hashearContrasena(body.contrasena);
    }

    const miembroActualizado = await actualizarDatosMiembro(id, datosActualizar);

    if (!miembroActualizado) {
      return NextResponse.json({ success: false, error: 'Miembro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Datos del miembro actualizados exitosamente',
      data: {
        ...miembroActualizado,
        correo_ofuscado: ofuscarCorreo(miembroActualizado.correo),
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en PUT /api/miembros/[id]:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'El correo electronico ya esta en uso por otro miembro' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: 'Error al actualizar miembro' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ success: false, error: 'El identificador debe ser un numero entero positivo' }, { status: 400 });
    }

    const id = parseInt(params.id, 10);
    const miembroDesactivado = await bajaLogicaMiembro(id);

    if (!miembroDesactivado) {
      return NextResponse.json({ success: false, error: 'Miembro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Miembro desactivado exitosamente',
      data: {
        ...miembroDesactivado,
        correo_ofuscado: ofuscarCorreo(miembroDesactivado.correo),
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en DELETE /api/miembros/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error al procesar baja de miembro' }, { status: 500 });
  }
}
