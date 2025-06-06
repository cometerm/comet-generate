import mongoose from "mongoose";

declare global {
  var mongoose: any;
}

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env.local",
  );
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: "majority" as const,
    };

    cached.promise = mongoose
      .connect(DATABASE_URL, opts)
      .then((mongoose) => {
        console.log("Database connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("Database connection error:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
