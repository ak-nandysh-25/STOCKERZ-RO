const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Parse .env file manually
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "stockerz_secondary";

if (!uri) {
  console.error("Error: MONGODB_URI is missing in .env file.");
  process.exit(1);
}

const collectionsToCreate = [
  {
    name: "audit_logs",
    indexes: [{ key: { timestamp: -1 } }, { key: { action: 1 } }, { key: { userId: 1 } }],
  },
  {
    name: "shops_secondary",
    indexes: [{ key: { owner_id: 1 }, unique: true }, { key: { syncedAt: -1 } }],
  },
  {
    name: "sales_secondary",
    indexes: [{ key: { shop_id: 1 } }, { key: { sale_date: -1 } }, { key: { source: 1 } }],
  },
  {
    name: "services_secondary",
    indexes: [{ key: { shop_id: 1 } }, { key: { service_date: -1 } }, { key: { customer_name: 1 } }],
  },
  {
    name: "products_secondary",
    indexes: [{ key: { shop_id: 1 } }, { key: { model: 1 } }],
  },
  {
    name: "customers_secondary",
    indexes: [{ key: { shop_id: 1 } }, { key: { name: 1 } }, { key: { phone: 1 } }],
  },
  {
    name: "emi_plans_secondary",
    indexes: [{ key: { shop_id: 1 } }, { key: { start_date: -1 } }],
  },
];

async function initializeMongoDb() {
  console.log(`Connecting to MongoDB Atlas... (Database: ${dbName})`);

  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  } catch (err) {
    if (err.message.includes("querySrv ECONNREFUSED") || err.message.includes("ENOTFOUND")) {
      const fallbackUri = uri.includes("stockerzro.hofyhk5.mongodb.net")
        ? uri.replace("mongodb+srv://", "mongodb://").replace("stockerzro.hofyhk5.mongodb.net/?", "ac-stjf9ep-shard-00-00.hofyhk5.mongodb.net:27017,ac-stjf9ep-shard-00-01.hofyhk5.mongodb.net:27017,ac-stjf9ep-shard-00-02.hofyhk5.mongodb.net:27017/?ssl=true&replicaSet=atlas-stjf9ep-shard-0&authSource=admin&")
        : null;

      if (fallbackUri) {
        console.log("SRV DNS query restricted; trying direct replica set connection...");
        client = new MongoClient(fallbackUri, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

  try {
    console.log("✅ Successfully connected to MongoDB Atlas cluster!");

    const db = client.db(dbName);
    const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);

    for (const colDef of collectionsToCreate) {
      if (!existingCollections.includes(colDef.name)) {
        await db.createCollection(colDef.name);
        console.log(`📁 Created collection: '${colDef.name}'`);
      } else {
        console.log(`ℹ️ Collection '${colDef.name}' already exists.`);
      }

      const collection = db.collection(colDef.name);
      for (const idx of colDef.indexes) {
        await collection.createIndex(idx.key, idx.unique ? { unique: true } : {});
      }
      console.log(`  └─ Created indexes for '${colDef.name}'`);
    }

    console.log("\n🎉 All MongoDB collections & indexes initialized successfully!");
  } catch (error) {
    console.error("\n❌ MongoDB Connection Notice:", error.message);
    if (error.message.includes("timed out") || error.message.includes("Server selection")) {
      console.error("\n💡 NOTE: Please ensure Network Access in MongoDB Atlas allows your IP:");
      console.error("   1. Open https://cloud.mongodb.com -> Network Access");
      console.error("   2. Click 'Add IP Address' -> 'Allow Access from Anywhere' (0.0.0.0/0)");
      console.error("   3. Click Confirm and re-run: npm run init:mongo");
    }
  } finally {
    if (client) await client.close();
  }
}

initializeMongoDb();
