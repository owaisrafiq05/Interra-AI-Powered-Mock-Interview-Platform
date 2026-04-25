import mongoose from "mongoose";

/** Supports MONGODB_URI (recommended) and legacy MONGO_URI (e.g. older k8s). */
export const connectDb = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri || !String(uri).trim()) {
    const err = new Error(
      "Missing MONGODB_URI (or MONGO_URI). Set it in server/.env — use your Atlas connection string from Database → Connect."
    );
    console.error(err.message);
    throw err;
  }

  const options: mongoose.ConnectOptions = {
    // Atlas / cloud: allow time for SRV + TLS handshake (especially on cold clusters)
    serverSelectionTimeoutMS: 30_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (e) {
    console.error("Database connection failed:", e);
    throw e;
  }
};
