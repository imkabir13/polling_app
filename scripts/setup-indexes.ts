// Run this script ONCE to create MongoDB indexes for better performance
// Usage: npx tsx scripts/setup-indexes.ts

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  console.error("❌ Missing MONGODB_URI or MONGODB_DB environment variables");
  process.exit(1);
}

async function setupIndexes() {
  console.log("🔧 Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log("📊 Creating indexes for pollResponses collection...");

    const pollResponses = db.collection("pollResponses");

    // Create indexes
    await pollResponses.createIndexes([
      // Unique index on deviceId (enforce one vote per device at DB level)
      {
        key: { deviceId: 1 },
        unique: true,
        sparse: true, // Allow null deviceIds
        name: "deviceId_unique",
      },
      // Unique index on sessionId (prevent duplicate sessions)
      {
        key: { sessionId: 1 },
        unique: true,
        name: "sessionId_unique",
      },
      // Index on IP for analytics
      {
        key: { ip: 1 },
        name: "ip_index",
      },
      // Index on answer for vote counting
      {
        key: { answer: 1 },
        name: "answer_index",
      },
      // Index on gender for analytics
      {
        key: { gender: 1 },
        name: "gender_index",
      },
      // Index on createdAt for time-based queries
      {
        key: { createdAt: -1 },
        name: "createdAt_index",
      },
    ]);

    console.log("✅ Indexes created successfully!");

    console.log("\n📊 Creating indexes for analyticsEvents collection...");

    const analyticsEvents = db.collection("analyticsEvents");

    await analyticsEvents.createIndexes([
      // Index on type for filtering events
      {
        key: { type: 1 },
        name: "type_index",
      },
      // Index on deviceId
      {
        key: { deviceId: 1 },
        name: "deviceId_index",
      },
      // Index on createdAt for time-based queries
      {
        key: { createdAt: -1 },
        name: "createdAt_index",
      },
    ]);

    console.log("✅ Analytics indexes created successfully!");

    // List all indexes
    console.log("\n📋 Current indexes:");
    const indexes = await pollResponses.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n✅ Done! Database indexes are set up.");
  }
}

setupIndexes();
