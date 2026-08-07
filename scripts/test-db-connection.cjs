const fs = require("fs");
const path = require("path");
const dns = require("dns");
const { MongoClient } = require("mongodb");

// Use Google / Cloudflare public DNS servers to resolve SRV records on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // ignore if DNS override fails
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

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

async function testConnections() {
  console.log("==========================================");
  console.log("🔍 TESTING DATABASE CONNECTIONS");
  console.log("==========================================");

  // 1. Supabase Check
  console.log("\n1️⃣  Testing Supabase Connection...");
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/shops?select=count`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (res.ok) {
        const body = await res.json();
        console.log(`✅ Supabase Connected & Authorized! URL: ${supabaseUrl}`);
        console.log(`   Response sample:`, body);
      } else {
        const text = await res.text();
        console.log(`⚠️ Supabase returned HTTP ${res.status}: ${text}`);
      }
    } catch (err) {
      console.log(`❌ Supabase Connection Error: ${err.message}`);
    }
  } else {
    console.log("❌ Supabase environment variables missing in .env");
  }

  // 2. MongoDB Check
  console.log("\n2️⃣  Testing MongoDB Atlas Connection...");
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB_NAME || "stockerz_secondary";

  if (!mongoUri) {
    console.log("❌ MONGODB_URI missing in .env");
    return;
  }

  console.log(`URL: ${mongoUri.replace(/:([^@]+)@/, ":****@")}`);
  let client;
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 6000 });
    await client.connect();
    const pingRes = await client.db(mongoDbName).command({ ping: 1 });
    console.log(`✅ MongoDB Atlas Connected! Database: '${mongoDbName}'`);
    console.log(`   Ping Result:`, pingRes);
  } catch (err) {
    console.log(`\n❌ MongoDB Connection Error:`);
    console.log(`   Message: ${err.message}`);

    if (err.message.includes("MongoServerSelectionError") || err.message.includes("timed out") || err.message.includes("ECONNREFUSED")) {
      console.log("\n📌 MONGODB ATLAS STEPS:");
      console.log("--------------------------------------------------");
      console.log("1. Ensure your IP is added to MongoDB Atlas Network Access:");
      console.log("   - Log in: https://cloud.mongodb.com/");
      console.log("   - Security -> Network Access -> Add IP Address -> 'Allow Access from Anywhere' (0.0.0.0/0)");
      console.log("2. Ensure user 'konandysh25_db_user' credentials match in .env");
    }
  } finally {
    if (client) {
      setTimeout(() => client.close(), 500);
    }
  }
}

testConnections();
