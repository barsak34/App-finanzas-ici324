//EJECUTAR PARA PROBAR LAS CONSULTAS BD 


const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local si existe
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\n[ERROR] Variable DATABASE_URL no encontrada en el entorno.');
  console.error('El driver pg requiere una URI directa de PostgreSQL.');
  console.error('Configura DATABASE_URL en tu archivo .env.local:');
  console.error('DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runTests() {
  console.log('\n[INFO] Iniciando verificacion de conexion y consultas SQL...');

  try {
    const t0 = Date.now();
    const connCheck = await pool.query('SELECT NOW() as hora_servidor;');
    console.log(`[OK] Conexion a base de datos establecida (${Date.now() - t0}ms)`);

    // 1. INSERT Categoria
    const t1 = Date.now();
    const catRes = await pool.query(
      `INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES ($1, $2) RETURNING id_categoria, nombre_categoria;`,
      [`Categoria Test ${Date.now()}`, 'Descripcion de prueba']
    );
    const catId = catRes.rows[0].id_categoria;
    console.log(`[OK] Consulta 1 (INSERT Categoria): ID=${catId} (${Date.now() - t1}ms)`);

    // 2. INSERT Miembro
    const t2 = Date.now();
    const mieRes = await pool.query(
      `INSERT INTO MIEMBRO (nombre_completo, correo, telefono, estado_activo) VALUES ($1, $2, $3, TRUE) RETURNING id_miembro, nombre_completo;`,
      ['Miembro Test', `test_${Date.now()}@example.com`, '+56911223344']
    );
    const miembroId = mieRes.rows[0].id_miembro;
    console.log(`[OK] Consulta 2 (INSERT Miembro): ID=${miembroId} (${Date.now() - t2}ms)`);

    // 3. INSERT Transaccion
    const t3 = Date.now();
    const txRes = await pool.query(
      `INSERT INTO TRANSACCION (id_miembro, id_categoria, tipo_movimiento, monto, medio_pago, descripcion_gasto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_transaccion, monto;`,
      [miembroId, catId, 'Egreso', 35000.00, 'Efectivo', 'Compra de prueba']
    );
    const txId = txRes.rows[0].id_transaccion;
    console.log(`[OK] Consulta 3 (INSERT Transaccion): ID=${txId} (${Date.now() - t3}ms)`);

    // 4. UPDATE Miembro
    const t4 = Date.now();
    const updMie = await pool.query(
      `UPDATE MIEMBRO SET telefono = $1 WHERE id_miembro = $2 RETURNING id_miembro, telefono;`,
      ['+56999998888', miembroId]
    );
    console.log(`[OK] Consulta 4 (UPDATE Miembro): Telefono=${updMie.rows[0].telefono} (${Date.now() - t4}ms)`);

    // 5. UPDATE Transaccion
    const t5 = Date.now();
    const updTx = await pool.query(
      `UPDATE TRANSACCION SET monto = $1 WHERE id_transaccion = $2 RETURNING id_transaccion, monto;`,
      [42000.00, txId]
    );
    console.log(`[OK] Consulta 5 (UPDATE Transaccion): Monto=${updTx.rows[0].monto} (${Date.now() - t5}ms)`);

    // 6. SELECT Simple
    const t9 = Date.now();
    const selSimple = await pool.query(
      `SELECT nombre_completo, correo FROM MIEMBRO WHERE estado_activo = TRUE;`
    );
    console.log(`[OK] Consulta 9 (SELECT Simple): ${selSimple.rowCount} miembros activos (${Date.now() - t9}ms)`);

    // 7. SELECT 1 JOIN
    const t10 = Date.now();
    const selJoin1 = await pool.query(
      `SELECT m.nombre_completo, t.monto, t.fecha_registro FROM TRANSACCION t INNER JOIN MIEMBRO m ON t.id_miembro = m.id_miembro WHERE t.tipo_movimiento = 'Egreso';`
    );
    console.log(`[OK] Consulta 10 (SELECT 1 JOIN): ${selJoin1.rowCount} egresos encontrados (${Date.now() - t10}ms)`);

    // 8. SELECT 2 JOINs
    const t11 = Date.now();
    const selJoin2 = await pool.query(
      `SELECT m.nombre_completo, c.nombre_categoria, t.monto FROM TRANSACCION t INNER JOIN MIEMBRO m ON t.id_miembro = m.id_miembro INNER JOIN CATEGORIA c ON t.id_categoria = c.id_categoria WHERE t.monto > $1;`,
      [10000]
    );
    console.log(`[OK] Consulta 11 (SELECT 2 JOINs): ${selJoin2.rowCount} registros con monto > 10000 (${Date.now() - t11}ms)`);

    // 9. DELETE Transaccion
    const t6 = Date.now();
    await pool.query(`DELETE FROM TRANSACCION WHERE id_transaccion = $1;`, [txId]);
    console.log(`[OK] Consulta 6 (DELETE Transaccion): ID=${txId} eliminada (${Date.now() - t6}ms)`);

    // 10. DELETE Categoria
    const t7 = Date.now();
    await pool.query(`DELETE FROM CATEGORIA WHERE id_categoria = $1;`, [catId]);
    console.log(`[OK] Consulta 7 (DELETE Categoria): ID=${catId} eliminada (${Date.now() - t7}ms)`);

    // 11. UPDATE estado_activo (Baja logica)
    const t8 = Date.now();
    const bajaLogica = await pool.query(
      `UPDATE MIEMBRO SET estado_activo = FALSE WHERE id_miembro = $1 RETURNING id_miembro, estado_activo;`,
      [miembroId]
    );
    console.log(`[OK] Consulta 8 (Baja Logica Miembro): ID=${bajaLogica.rows[0].id_miembro}, activo=${bajaLogica.rows[0].estado_activo} (${Date.now() - t8}ms)`);

    console.log('\n[INFO] Verificacion completada: 11 consultas ejecutadas correctamente.\n');
  } catch (error) {
    console.error('\n[ERROR] Error al ejecutar pruebas:', error.message);
    if (error.code) console.error('Codigo PostgreSQL:', error.code);
  } finally {
    await pool.end();
  }
}

runTests();
