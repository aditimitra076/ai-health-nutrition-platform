
import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import dns from "node:dns";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import foodEntryRoutes from "./routes/foodEntryRoutes.js";

// Fix Node.js DNS resolution for MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error("Origin is not allowed by CORS.");
    error.status = 403;
    callback(error);
  },
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Health Nutrition API is running!"
  });
});
// Database status route
app.get("/api/db-status", (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;

    res.status(isConnected ? 200 : 503).json({
        success: isConnected,
        database: isConnected ? "Connected" : "Disconnected"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/food-entries", foodEntryRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  res.status(status).json({
    success: false,
    message: status < 500 ? "Invalid request." : "Request failed."
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

startServer().catch(() => {
    console.error("Unable to start the server.");
    process.exitCode = 1;
});
