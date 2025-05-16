import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();

// Check if MONGODB environment variable is defined
if (!process.env.MONGODB_URI) {
  console.error("MongoDB connection string (MONGODB_URI) is missing in .env");
  process.exit(1); // Exit if MONGODB_URI is not provided
}

// Check if JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in .env");
  process.exit(1);
}

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Import and use routes
import staffRoutes from "./routes/staffRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authenticationRoutes from "./routes/authenticationRoutes.js";
import voucherRoutes from "./routes/voucherRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoute.js";
import voucherLockRoutes from "./routes/voucherLockRoutes.js";
import accountMappingRoutes from "./routes/accountMappingRoutes.js";

// Register account-mapping route FIRST to avoid conflicts
app.use("/api/account-mapping", accountMappingRoutes);

// Register other routes
app.use("/api", voucherRoutes);
app.use("/api", taskRoutes);
app.use("/api", staffRoutes);
app.use("/api", authenticationRoutes);
app.use("/api", adminRoutes);
app.use("/api", notificationRoutes);
app.use("/api/voucher-lock", voucherLockRoutes);

// Set the port
const PORT = process.env.PORT || 8000; // Fixed port to 800

// MongoDB connection
console.log(
  "Attempting to connect to MongoDB Atlas with URI:",
  process.env.MONGODB_URI
);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas");
    // Test the connection by trying to fetch some data
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log(
      "Available collections:",
      collections.map((c) => c.name)
    );
    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Atlas connection error:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
  });

// Periodic cleanup of expired locks (every 5 minutes)
setInterval(async () => {
  try {
    await fetch("http://localhost:8000/api/voucher-lock/clear-expired", {
      method: 'POST'
    });
  } catch (error) {
    console.error("Failed to clear expired locks:", error);
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  mongoose.connection.close(false, () => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});
