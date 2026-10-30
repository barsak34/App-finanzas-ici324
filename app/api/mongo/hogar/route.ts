import { NextResponse } from 'next/server';
import { obtenerHogar, agregarMiembro, cambiarEstadoMiembro } from '@/servicios/mongo/hogares';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_hogar = searchParams.get('id_hogar');

    if (!id_hogar) {
      return NextResponse.json(
        { mensaje: 'Se requiere id_hogar' },
        { status: 400 }
      );
    }

    const hogar = await obtenerHogar(id_hogar);
    if (!hogar) {
      return NextResponse.json(
        { mensaje: 'Hogar no encontrado' },
        { status: 404 }
      );
    }

    // Ofuscar contraseñas antes de responder
    const miembrosSeguros = (hogar.miembros || []).map((m: any) => ({
      id_miembro: m.id_miembro,
      nombre_completo: m.nombre_completo,
      correo: m.correo,
      telefono: m.telefono || '',
      estado_activo: m.estado_activo
    }));

    return NextResponse.json({
      id_hogar: hogar._id.toString(),
      nombre_hogar: hogar.nombre_hogar,
      fecha_creacion: hogar.fecha_creacion,
      miembros: miembrosSeguros
    });
  } catch (error: any) {
    console.error('Error al obtener hogar:', error);
    return NextResponse.json(
      { mensaje: 'Error interno al consultar hogar', detalle: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { id_hogar, nombre_completo, correo, contrasena, telefono } = await request.json();

    if (!id_hogar || !nombre_completo || !correo || !contrasena) {
      return NextResponse.json(
        { mensaje: 'Faltan campos obligatorios para registrar miembro' },
        { status: 400 }
      );
    }

    const nuevo = await agregarMiembro(id_hogar, {
      nombre_completo,
      correo,
      contrasena,
      telefono
    });

    return NextResponse.json(
      {
        mensaje: 'Miembro agregado exitosamente al hogar',
        miembro: {
          id_miembro: nuevo.id_miembro,
          nombre_completo: nuevo.nombre_completo,
          correo: nuevo.correo,
          telefono: nuevo.telefono,
          estado_activo: nuevo.estado_activo
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al agregar miembro:', error);
    return NextResponse.json(
      { mensaje: 'Error al agregar miembro', detalle: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id_hogar, id_miembro, estado_activo } = await request.json();

    if (!id_hogar || !id_miembro || typeof estado_activo !== 'boolean') {
      return NextResponse.json(
        { mensaje: 'Parámetros inválidos para cambiar estado' },
        { status: 400 }
      );
    }

    await cambiarEstadoMiembro(id_hogar, id_miembro, estado_activo);

    return NextResponse.json({
      mensaje: `Miembro ${estado_activo ? 'activado' : 'desactivado'} correctamente`,
      id_miembro,
      estado_activo
    });
  } catch (error: any) {
    console.error('Error al cambiar estado de miembro:', error);
    return NextResponse.json(
      { mensaje: 'Error al actualizar estado del miembro', detalle: error.message },
      { status: 500 }
    );
  }
}
