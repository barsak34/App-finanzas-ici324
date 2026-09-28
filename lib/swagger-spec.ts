export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Finanzas del Hogar',
    version: '1.0.0',
    description: 'Documentación de los endpoints del backend para la gestión de miembros, categorías y transacciones financieras.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Miembros', description: 'Operaciones sobre la tabla MIEMBRO' },
    { name: 'Categorías', description: 'Operaciones sobre la tabla CATEGORIA' },
    { name: 'Transacciones', description: 'Operaciones sobre la tabla TRANSACCION' },
    { name: 'Reportes', description: 'Consultas con uniones relacionales (JOIN)' },
  ],
  paths: {
    '/api/miembros': {
      get: {
        tags: ['Miembros'],
        summary: 'Listar miembros',
        description: 'Obtiene el listado de miembros. Permite filtrar solo activos con el parámetro solo_activos=true.',
        parameters: [
          {
            name: 'solo_activos',
            in: 'query',
            description: 'Filtrar miembros donde estado_activo es true',
            required: false,
            schema: { type: 'boolean', default: false },
          },
        ],
        responses: {
          200: { description: 'Listado obtenido con éxito' },
          500: { description: 'Error interno del servidor' },
        },
      },
      post: {
        tags: ['Miembros'],
        summary: 'Registrar nuevo miembro',
        description: 'Inserta un nuevo miembro en la base de datos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre_completo', 'correo'],
                properties: {
                  nombre_completo: { type: 'string', example: 'Andrea Morales' },
                  correo: { type: 'string', example: 'andrea.morales@example.com' },
                  telefono: { type: 'string', example: '+56987654321' },
                  estado_activo: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Miembro registrado con éxito' },
          400: { description: 'Datos requeridos no proporcionados' },
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
        summary: 'Actualizar datos de miembro',
        description: 'Actualiza teléfono, nombre o correo del miembro especificado.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  telefono: { type: 'string', example: '+56999887766' },
                  nombre_completo: { type: 'string', example: 'Andrea Morales' },
                  correo: { type: 'string', example: 'andrea.morales@example.com' },
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
        summary: 'Registrar nueva categoría',
        description: 'Inserta una categoría en la base de datos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre_categoria'],
                properties: {
                  nombre_categoria: { type: 'string', example: 'Transporte' },
                  descripcion: { type: 'string', example: 'Gastos de combustible y pasajes' },
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
        summary: 'Eliminar categoría',
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
        summary: 'Registrar transacción',
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
                  monto: { type: 'number', example: 25000.00 },
                  medio_pago: { type: 'string', example: 'Tarjeta de Débito' },
                  descripcion_gasto: { type: 'string', example: 'Supermercado' },
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
        summary: 'Modificar monto de transacción',
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
                  monto: { type: 'number', example: 32000.00 },
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
        summary: 'Eliminar transacción',
        description: 'Elimina una transacción por su ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Transacción eliminada con éxito' },
          404: { description: 'Transacción no encontrada' },
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
        summary: 'Filtrar transacciones por monto mínimo',
        description: 'Consulta con 2 JOINs que retorna nombre del miembro, categoría y monto para transacciones mayores al valor indicado.',
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
