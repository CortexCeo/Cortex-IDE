import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI as string;
const options = {};

// Define types for global MongoDB cache
interface GlobalWithMongo extends Global {
  mongoClientPromise?: {
    client?: MongoClient;
    conn?: Promise<MongoClient>;
  };
}

// Use the global type
declare const global: GlobalWithMongo;

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached = global.mongoClientPromise || {
  client: undefined,
  conn: undefined,
};

// Initialize the cached object if it doesn't exist
if (!global.mongoClientPromise) {
  global.mongoClientPromise = cached;
}

async function connectToDatabase(): Promise<MongoClient> {
  if (cached.client) {
    return cached.client;
  }

  if (!cached.conn) {
    const client = new MongoClient(uri, options);
    cached.conn = client.connect();
  }
  
  cached.client = await cached.conn;
  return cached.client;
}

// Export a Promise that resolves to a MongoClient
const clientPromise: Promise<MongoClient> = connectToDatabase();

export default clientPromise;