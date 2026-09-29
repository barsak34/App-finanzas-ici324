import { NextRequest, NextResponse } from 'next/server';
import { insertarMiembro, listarMiembrosActivos, listarTodosLosMiembros } from '@/servicios/miembros';
import { isValidEmail, sanitizeString, ofuscarCorreo, hashearContrasena, isValidId } from '@/lib/seguridad';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get('solo_activos') === 'true';
    const idHogarParam = searchParams.get('id_hogar');
    const idHogar = idHogarParam && isValidId(idHogarParam) ? parseInt(idHogarParam, 10) : undefined;

    if (soloActivos) {
      const miembrosActivos = await listarMiembrosActivos();
      const dataOfuscada = miembrosActivos.map((m) => ({
        nombre_completo: m.nombre_completo,
        correo: m.correo,
        correo_ofuscado: ofuscarCorreo(m.correo),
      }));

      return NextResponse.json({
        success: true,
        total: dataOfuscada.length,
        data: dataOfuscada,
      }, { status: 200 });
    }

    const todos = await listarTodosLosMiembros(idHogar);
    const dataOfuscada = todos.map((m) => ({
      ...m,
      correo_ofuscado: ofuscarCorreo(m.correo),
    }));

    return NextResponse.json({
      success: true,
      filtro_hogar: idHogar || 'todos',
      total: dataOfuscada.length,
      data: dataOfuscada,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/miembros:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener miembros' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre_completo, correo, telefono, contrasena, id_hogar, estado_activo } = body;

    const nombreLimpio = sanitizeString(nombre_completo);
    const correoLimpio = sanitizeString(correo).toLowerCase();
    const telefonoLimpio = telefono ? sanitizeString(telefono) : null;

    if (!nombreLimpio || nombreLimpio.length < 2) {
      return NextResponse.json(
        { success: false, error: 'El nombre completo debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    if (!isValidEmail(correoLimpio)) {
      return NextResponse.json(
        { success: false, error: 'El formato de correo electronico no es valido' },
        { status: 400 }
      );
    }

    // Validar id_hogar si se envía
    let hogarIdNum: number | null = null;
    if (id_hogar !== undefined && id_hogar !== null) {
      if (!isValidId(id_hogar)) {
        return NextResponse.json(
          { success: false, error: 'id_hogar debe ser un numero entero positivo' },
          { status: 400 }
        );
      }
      hogarIdNum = parseInt(id_hogar, 10);
    }

    // Hash de contraseña seguro usando bcrypt
    let contrasenaHash: string | null = null;
    if (contrasena && typeof contrasena === 'string' && contrasena.length >= 6) {
      contrasenaHash = await hashearContrasena(contrasena);
    }

    const nuevoMiembro = await insertarMiembro({
      nombre_completo: nombreLimpio,
      correo: correoLimpio,
      telefono: telefonoLimpio,
      contrasena: contrasenaHash,
      id_hogar: hogarIdNum,
      estado_activo,
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Miembro registrado exitosamente',
      data: {
        ...nuevoMiembro,
        correo_ofuscado: ofuscarCorreo(nuevoMiembro.correo),
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/miembros:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un miembro registrado con ese correo electronico' },
        { status: 409 }
      );
    }
    if (error.code === '23503') {
      return NextResponse.json(
        { success: false, error: 'El hogar especificado no existe (violacion de llave foranea)' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al registrar miembro' },
      { status: 500 }
    );
  }
}
