import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor define la variable MONGODB_URI en .env.local');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo se reutiliza la conexión para evitar múltiples conexiones en HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Obtiene la instancia de la base de datos de MongoDB
 */
export async function getDatabase(dbName: string = 'finanzas_hogar'): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
