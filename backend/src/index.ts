import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth";
import transactionRoutes from "./routes/transactions";
import profileRoutes from "./routes/profile";
import { authenticateToken } from "./middleware/auth";

// Load env file
dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production" ? ".env.production" : ".env"
  ),
});

// Validate required env variables
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "PORT"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Tambahkan logging untuk debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(
  cors({
    origin: ["http://localhost:19006", "exp://192.168.1.7:19000"], // Adjust with mobile app URL
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/profile", authenticateToken, profileRoutes);
app.use("/transactions", authenticateToken, transactionRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
    routes: [
      "/auth/login",
      "/auth/register",
      "/profile",
      "/profile/chart-data",
      "/transactions",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log("- /auth/login");
  console.log("- /auth/register");
  console.log("- /profile");
  console.log("- /profile/chart-data");
  console.log("- /transactions");
});
