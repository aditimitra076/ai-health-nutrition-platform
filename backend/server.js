
import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import dns from "node:dns";

import connectDB from "./config/db.js";

// Fix Node.js DNS resolution for MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Basic API route
// Basic API route
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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

startServer();
