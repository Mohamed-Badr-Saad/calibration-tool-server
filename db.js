import mongoose from "mongoose";

let connectionPromise;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  connectionPromise ??= mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  return connectionPromise;
};

export const requireDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(503).json({ message: "Database connection unavailable" });
  }
};
