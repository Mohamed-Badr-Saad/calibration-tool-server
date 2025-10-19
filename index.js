// index.js - Ensure this is correct
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import your existing routes
import instrumentsRouter from "./routes/instruments.js";
import engineersRouter from "./routes/engineers.js";
import techniciansRouter from "./routes/technicians.js";
import tolerancesRouter from "./routes/tolerances.js";

// Import auth routes
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();

// Middleware
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"], // Add your frontend URL
//     credentials: true,
//   })
// );
// Updated CORS configuration for production
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:5173", 
      "https://calibration-tool-server.vercel.app", // server URL
      "https://calibration-tool-five.vercel.app" // frontend URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

//check for server status
app.get("/", (req, res) => {
  res.json({
    message: "Calibration Tool API is running!",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/instruments", instrumentsRouter);
app.use("/api/engineers", engineersRouter);
app.use("/api/technicians", techniciansRouter);
app.use("/api/tolerances", tolerancesRouter);

// Auth routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "🚀 RASHPETCO API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});
