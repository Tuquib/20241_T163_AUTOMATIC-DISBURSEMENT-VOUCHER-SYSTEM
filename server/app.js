import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();

// Check if MONGODB environment variable is defined
if (!process.env.MONGODB) {
  console.error("MongoDB connection string (MONGODB) is missing in .env");
  process.exit(1); // Exit if MONGODB is not provided
}

app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Import and use routes
import staffRoutes from "./routes/staffRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authenticationRoutes from "./routes/authenticationRoutes.js";

app.use("/api", taskRoutes);
app.use("/api", staffRoutes);
app.use("/api", authenticationRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB) // Removed deprecated options
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Set the port
const PORT = process.env.PORT || 8000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
});
