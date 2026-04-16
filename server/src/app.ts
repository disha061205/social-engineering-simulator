import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

export default app;

import simulationRoutes from "./routes/simulation.routes";
app.use("/api", simulationRoutes);

import scoringRoutes from "./routes/scoring.routes";
app.use("/api", scoringRoutes);

import resultRoutes from "./routes/result.routes";
app.use("/api", resultRoutes);

import adminRoutes from "./routes/admin.routes";
app.use("/api", adminRoutes);

import authRoutes from "./routes/auth.routes";
app.use("/api", authRoutes);

import scenarioRoutes from "./routes/scenario.routes";
app.use("/api", scenarioRoutes);