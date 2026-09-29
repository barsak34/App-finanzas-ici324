export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Finanzas del Hogar',
    version: '1.0.0',
    description: 'Documentación de los endpoints del backend para la gestión de hogares, miembros, categorías y transacciones financieras.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Hogares', description: 'Operaciones sobre la tabla HOGAR (Consulta 4)' },
    { name: 'Miembros', description: 'Operaciones sobre la tabla MIEMBRO (Consultas 6, 8, 12)' },
    { name: 'Categorías', description: 'Operaciones sobre la tabla CATEGORIA (Consultas 5, 11)' },
    { name: 'Transacciones', description: 'Operaciones sobre la tabla TRANSACCION (Consultas 7, 9, 10)' },
    { name: 'Reportes', description: 'Consultas relacionales con Álgebra Relacional y JOINs (Consultas 13, 14)' },
  ],
  paths: {
    '/api/hogares': {
      get: {
        tags: ['Hogares'],
        summary: 'Listar todos los hogares',
        description: 'Obtiene el listado completo de hogares registrados.',
        responses: {
          200: { description: 'Listado obtenido con éxito' },
          500: { description: 'Error interno del servidor' },
        },
      },
      post: {
        tags: ['Hogares'],
        summary: 'Registrar nuevo hogar (Consulta 4)',
        description: 'Inserta un nuevo hogar en la tabla HOGAR.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre_hogar'],
                properties: {
                  nombre_hogar: { type: 'string', example: 'Departamento Mirador Valpo' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Hogar registrado con éxito' },
          400: { description: 'Datos requeridos no proporcionados' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/hogares/{id}': {
      get: {
        tags: ['Hogares'],
        summary: 'Obtener hogar por ID con sus miembros',
        description: 'Retorna los datos del hogar y la lista de miembros que pertenecen a él.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Hogar encontrado con sus miembros' },
          404: { description: 'Hogar no encontrado' },
        },
      },
    },
    '/api/miembros': {
      get: {
        tags: ['Miembros'],
        summary: 'Listar miembros (Soporta Consulta 12 y filtro por hogar)',
        description: 'Obtiene el listado de miembros. Permite filtrar solo activos (`solo_activos=true`) o por hogar (`id_hogar=1`). Los correos se entregan ofuscados para protección de datos.',
        parameters: [
          {
            name: 'solo_activos',
            in: 'query',
            description: 'Filtrar miembros donde estado_activo es true (Consulta 12)',
            required: false,
            schema: { type: 'boolean', default: false },
          },
          {
            name: 'id_hogar',
            in: 'query',
            description: 'Filtrar miembros pertenecientes a un hogar específico',
            required: false,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Listado obtenido con éxito' },
          500: { description: 'Error interno del servidor' },
        },
      },
      post: {
        tags: ['Miembros'],
        summary: 'Registrar nuevo miembro (Consulta 6)',
        description: 'Inserta un nuevo miembro en la base de datos asociado a un hogar.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre_completo', 'correo'],
                properties: {
                  nombre_completo: { type: 'string', example: 'Maximiliano Felipe Rozas Rifo' },
                  correo: { type: 'string', example: 'maximixasz@gmail.com' },
                  telefono: { type: 'string', example: '+56912345678' },
                  id_hogar: { type: 'integer', example: 1 },
                  contrasena: { type: 'string', example: 'claveSegura123' },
                  estado_activo: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Miembro registrado con éxito' },
          400: { description: 'Datos requeridos no proporcionados' },
          409: { description: 'Correo ya registrado' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/miembros/{id}': {
      get: {
        tags: ['Miembros'],
        summary: 'Obtener miembro por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Miembro encontrado' },
          404: { description: 'Miembro no encontrado' },
        },
      },
      put: {
        tags: ['Miembros'],
        summary: 'Actualizar datos de miembro (Consulta 8)',
        description: 'Actualiza teléfono, nombre o datos del miembro.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  telefono: { type: 'string', example: '+56912345678' },
                  nombre_completo: { type: 'string', example: 'Maximiliano Felipe Rozas Rifo' },
                  correo: { type: 'string', example: 'maximixasz@gmail.com' },
                  id_hogar: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Miembro actualizado con éxito' },
          404: { description: 'Miembro no encontrado' },
          500: { description: 'Error interno del servidor' },
        },
      },
      delete: {
        tags: ['Miembros'],
        summary: 'Desactivar miembro (baja lógica)',
        description: 'Actualiza el campo estado_activo a false.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Baja lógica realizada' },
          404: { description: 'Miembro no encontrado' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/categorias': {
      get: {
        tags: ['Categorías'],
        summary: 'Listar categorías',
        description: 'Obtiene todas las categorías registradas.',
        responses: {
          200: { description: 'Listado obtenido con éxito' },
          500: { description: 'Error interno del servidor' },
        },
      },
      post: {
        tags: ['Categorías'],
        summary: 'Registrar nueva categoría (Consulta 5)',
        description: 'Inserta una categoría en la base de datos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre_categoria'],
                properties: {
                  nombre_categoria: { type: 'string', example: 'Supermercado' },
                  descripcion: { type: 'string', example: 'Compras de despensa y articulos para el hogar' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Categoría registrada con éxito' },
          400: { description: 'Faltan datos obligatorios' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/categorias/{id}': {
      delete: {
        tags: ['Categorías'],
        summary: 'Eliminar categoría (Consulta 11)',
        description: 'Elimina una categoría si no tiene transacciones asociadas.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Categoría eliminada' },
          404: { description: 'Categoría no encontrada' },
          409: { description: 'Conflicto por clave foránea existente' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/transacciones': {
      get: {
        tags: ['Transacciones'],
        summary: 'Listar transacciones',
        description: 'Obtiene todas las transacciones registradas.',
        responses: {
          200: { description: 'Listado obtenido con éxito' },
          500: { description: 'Error interno del servidor' },
        },
      },
      post: {
        tags: ['Transacciones'],
        summary: 'Registrar transacción (Consulta 7)',
        description: 'Inserta una transacción asociada a un miembro y a una categoría.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id_miembro', 'id_categoria', 'tipo_movimiento', 'monto', 'medio_pago'],
                properties: {
                  id_miembro: { type: 'integer', example: 1 },
                  id_categoria: { type: 'integer', example: 1 },
                  tipo_movimiento: { type: 'string', enum: ['Ingreso', 'Egreso'], example: 'Egreso' },
                  monto: { type: 'number', example: 45000.00 },
                  medio_pago: { type: 'string', example: 'Debito' },
                  descripcion_gasto: { type: 'string', example: 'Compra mensual supermercado' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Transacción registrada con éxito' },
          400: { description: 'Datos inválidos o clave foránea no encontrada' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/transacciones/{id}': {
      patch: {
        tags: ['Transacciones'],
        summary: 'Modificar monto de transacción (Consulta 9)',
        description: 'Actualiza el monto de una transacción por su ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['monto'],
                properties: {
                  monto: { type: 'number', example: 48000.00 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Monto actualizado con éxito' },
          404: { description: 'Transacción no encontrada' },
          500: { description: 'Error interno del servidor' },
        },
      },
      delete: {
        tags: ['Transacciones'],
        summary: 'Eliminar transacción (Consulta 10)',
        description: 'Elimina una transacción por su ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Transacción eliminada con éxito' },
          404: { description: 'Transacción no encontrada' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/reportes/miembros-hogar': {
      get: {
        tags: ['Reportes'],
        summary: 'Consulta 13 (SELECT 2 con 1 JOIN): Miembros activos y su hogar',
        description: 'Obtener los miembros activos y el nombre del hogar al que pertenecen. Álgebra relacional: π(nombre_hogar, nombre_completo)(σ(estado_activo=TRUE)(Miembro ⋈ Hogar)).',
        responses: {
          200: { description: 'Reporte obtenido con éxito' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/reportes/transacciones-hogar': {
      get: {
        tags: ['Reportes'],
        summary: 'Consulta 14 (SELECT 3 con 2 JOINs): Transacciones > monto con miembro y hogar',
        description: 'Obtener las transacciones mayores a un monto mostrando quién lo gastó y en qué hogar. Álgebra relacional: π(nombre_hogar, nombre_completo, monto)(σ(monto > 10000)((Transaccion ⋈ Miembro) ⋈ Hogar)).',
        parameters: [
          {
            name: 'monto',
            in: 'query',
            description: 'Monto mínimo a filtrar',
            required: false,
            schema: { type: 'number', default: 10000 },
          },
        ],
        responses: {
          200: { description: 'Reporte obtenido con éxito' },
          400: { description: 'Parámetro de monto inválido' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/reportes/egresos': {
      get: {
        tags: ['Reportes'],
        summary: 'Listar egresos con datos de miembro',
        description: 'Consulta con JOIN que obtiene nombre del miembro, monto y fecha de los movimientos de tipo Egreso.',
        responses: {
          200: { description: 'Reporte obtenido con éxito' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
    '/api/reportes/mayores-a': {
      get: {
        tags: ['Reportes'],
        summary: 'Filtrar transacciones por monto mínimo (Miembro + Categoría)',
        description: 'Consulta con 2 JOINs que retorna nombre del miembro, categoría y monto.',
        parameters: [
          {
            name: 'monto',
            in: 'query',
            description: 'Monto mínimo a filtrar',
            required: false,
            schema: { type: 'number', default: 30000 },
          },
        ],
        responses: {
          200: { description: 'Reporte obtenido con éxito' },
          400: { description: 'Parámetro de monto inválido' },
          500: { description: 'Error interno del servidor' },
        },
      },
    },
  },
};
