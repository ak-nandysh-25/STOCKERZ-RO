import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || "";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "stockerz_secondary";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to the secondary MongoDB database singleton.
 */
export async function getMongoDb(): Promise<Db | null> {
  if (!MONGODB_URI) {
    console.warn("MongoDB Notice: MONGODB_URI environment variable is not defined.");
    return null;
  }

  if (cachedDb) {
    return cachedDb;
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(MONGODB_URI);
      await cachedClient.connect();
      console.log("Connected successfully to secondary MongoDB database");
    }
    cachedDb = cachedClient.db(MONGODB_DB_NAME);
    return cachedDb;
  } catch (error) {
    console.error("Secondary MongoDB Connection Error:", error);
    return null;
  }
}

/**
 * Disconnect MongoDB client gracefully.
 */
export async function closeMongoConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export interface MongoSyncPayload {
  collection: string;
  action: "insert" | "update" | "delete" | "audit";
  data: Record<string, any>;
  timestamp?: string;
}

/**
 * Helper to write document payloads into a MongoDB collection.
 */
export async function writeToMongoCollection(
  collectionName: string,
  document: Record<string, any>
): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const collection = db.collection(collectionName);
    await collection.insertOne({
      ...document,
      createdAt: document.createdAt || new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error(`Failed to write to MongoDB collection '${collectionName}':`, err);
    return false;
  }
}
