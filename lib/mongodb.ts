import { MongoClient, Db, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_DB environment variable in .env.local"
  );
}

console.log("MongoDB Configuration:");
console.log("- URI exists:", !!uri);
console.log("- DB Name:", dbName);
console.log("- Environment:", process.env.NODE_ENV);

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

if (process.env.NODE_ENV === "development") {
  // In dev, use a global so hot reloads don't create new clients
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In prod, it's safe to create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  try {
    console.log("Attempting to connect to MongoDB...");
    const client = await clientPromise;
    console.log("MongoDB client connected successfully");
    const db = client.db(dbName);
    console.log("Database selected:", dbName);
    return db;
  } catch (error: any) {
    console.error("MongoDB connection error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    throw error;
  }
}
