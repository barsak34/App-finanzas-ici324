import { Pool, QueryResult, QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _postgresPool: Pool | undefined;
}

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL no esta definida en las variables de entorno (.env.local)');
  }

  if (process.env.NODE_ENV === 'production') {
    return new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return global._postgresPool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[SQL Query]', {
      text: text.trim().replace(/\s+/g, ' '),
      duration: `${duration}ms`,
      rowCount: res.rowCount,
    });
  }

  return res;
}

export default getPool;
