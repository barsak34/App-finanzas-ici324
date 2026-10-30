const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env.local si no están en process.env
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: MONGODB_URI no está definido en .env.local');
  process.exit(1);
}

async function inicializarBaseDatos() {
  console.log('🔄 Conectando a MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conexión exitosa a MongoDB Atlas');

    const db = client.db('finanzas_hogar');

    // 1. Limpiar colecciones anteriores para asegurar datos limpios
    await db.collection('hogares').deleteMany({});
    await db.collection('categorias').deleteMany({});
    await db.collection('transacciones').deleteMany({});
    console.log('🧹 Colecciones limpiadas con éxito.');

    // Hashear contraseñas para los miembros
    const hashMaxi = await bcrypt.hash('123456', 10);
    const hashGladys = await bcrypt.hash('123456', 10);

    const hogarId = new ObjectId('66f000000000000000000001');

    // 2. Insertar Hogar con Miembros embebidos (según sección 3.1 del informe)
    const hogar = {
      _id: hogarId,
      nombre_hogar: 'Departamento Mirador Valpo',
      fecha_creacion: new Date('2026-09-29T00:00:00Z'),
      miembros: [
        {
          id_miembro: 'M001',
          nombre_completo: 'Maximiliano Rozas',
          correo: 'maximiliano@ejemplo.com',
          contrasena: hashMaxi,
          telefono: '+56912345678',
          estado_activo: true
        },
        {
          id_miembro: 'M002',
          nombre_completo: 'Gladys Carvacho',
          correo: 'gladys@ejemplo.com',
          contrasena: hashGladys,
          telefono: '+56987654321',
          estado_activo: true
        },
        {
          id_miembro: 'M003',
          nombre_completo: 'Camila Soto',
          correo: 'camila@ejemplo.com',
          contrasena: hashGladys,
          estado_activo: false
        }
      ]
    };
    await db.collection('hogares').insertOne(hogar);
    console.log('✅ Colección "hogares" creada con miembros embebidos.');

    // 3. Insertar Categorías (según sección 3.2 del informe)
    const catSuperId = new ObjectId('66f000000000000000000011');
    const catArriendoId = new ObjectId('66f000000000000000000012');
    const catCuentasId = new ObjectId('66f000000000000000000013');
    const catMascotasId = new ObjectId('66f000000000000000000014');
    const catSaludId = new ObjectId('66f000000000000000000015');
    const catSueldoId = new ObjectId('66f000000000000000000016');
    const catOtrosId = new ObjectId('66f000000000000000000017');

    const categorias = [
      { _id: catSuperId, nombre_categoria: 'Supermercado', descripcion: 'Compras de despensa y artículos del hogar' },
      { _id: catArriendoId, nombre_categoria: 'Arriendo', descripcion: 'Pago mensual del arriendo del departamento' },
      { _id: catCuentasId, nombre_categoria: 'Cuentas', descripcion: 'Luz, agua, gas e internet' },
      { _id: catMascotasId, nombre_categoria: 'Mascotas', descripcion: 'Alimento y veterinario' },
      { _id: catSaludId, nombre_categoria: 'Salud', descripcion: 'Gastos médicos, medicamentos y consultas' },
      { _id: catSueldoId, nombre_categoria: 'Sueldo', descripcion: 'Remuneración mensual' },
      { _id: catOtrosId, nombre_categoria: 'Otros', descripcion: 'Gastos e ingresos varios' }
    ];
    await db.collection('categorias').insertMany(categorias);
    console.log('✅ Colección "categorias" creada con 7 categorías.');

    // 4. Insertar Transacciones (según sección 3.3 y mockups de la Figura 3 y 11 del informe)
    // Mockup muestra: Ingresos $820.000 / Gastos $486.500
    const transacciones = [
      {
        _id: new ObjectId('66f000000000000000000021'),
        id_hogar: hogarId,
        id_miembro: 'M001',
        id_categoria: catSuperId,
        tipo_movimiento: 'Egreso',
        monto: 45000,
        medio_pago: 'Débito',
        descripcion_gasto: 'Compra mensual supermercado',
        fecha_registro: new Date('2026-08-10T15:30:00Z')
      },
      {
        _id: new ObjectId('66f000000000000000000022'),
        id_hogar: hogarId,
        id_miembro: 'M002',
        id_categoria: catSueldoId,
        tipo_movimiento: 'Ingreso',
        monto: 780000,
        medio_pago: 'Transferencia',
        descripcion_gasto: 'Sueldo mensual Gladys',
        fecha_registro: new Date('2026-08-05T09:00:00Z')
      },
      {
        _id: new ObjectId('66f000000000000000000023'),
        id_hogar: hogarId,
        id_miembro: 'M001',
        id_categoria: catCuentasId,
        tipo_movimiento: 'Egreso',
        monto: 32900,
        medio_pago: 'Débito',
        descripcion_gasto: 'Cuenta de luz Enel',
        fecha_registro: new Date('2026-08-12T11:20:00Z')
      },
      {
        _id: new ObjectId('66f000000000000000000024'),
        id_hogar: hogarId,
        id_miembro: 'M002',
        id_categoria: catMascotasId,
        tipo_movimiento: 'Egreso',
        monto: 18600,
        medio_pago: 'Efectivo',
        descripcion_gasto: 'Alimento gato',
        fecha_registro: new Date('2026-08-15T18:00:00Z')
      },
      {
        _id: new ObjectId('66f000000000000000000025'),
        id_hogar: hogarId,
        id_miembro: 'M001',
        id_categoria: catArriendoId,
        tipo_movimiento: 'Egreso',
        monto: 390000,
        medio_pago: 'Transferencia',
        descripcion_gasto: 'Arriendo mensual agosto',
        fecha_registro: new Date('2026-08-01T10:00:00Z')
      },
      {
        _id: new ObjectId('66f000000000000000000026'),
        id_hogar: hogarId,
        id_miembro: 'M001',
        id_categoria: catOtrosId,
        tipo_movimiento: 'Ingreso',
        monto: 40000,
        medio_pago: 'Efectivo',
        descripcion_gasto: 'Venta artículo usado',
        fecha_registro: new Date('2026-08-20T14:15:00Z')
      }
    ];

    await db.collection('transacciones').insertMany(transacciones);
    console.log('✅ Colección "transacciones" creada con movimientos que coinciden con los mockups.');

    console.log('\n🎉 ¡Base de datos MongoDB Atlas inicializada con éxito total!');
  } catch (error) {
    console.error('❌ Error al inicializar MongoDB:', error);
  } finally {
    await client.close();
  }
}

inicializarBaseDatos();
