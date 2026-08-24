import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "../utils/config";

// Routes
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import appointmentRoutes from "./routes/appointment.routes";
import patientRoutes from "./routes/patient.routes";
import doctorRoutes from "./routes/doctor.routes";
import serviceRoutes from "./routes/service.routes";
import adminRoutes from "./routes/admin.routes";
import settingRoutes from "./routes/setting.routes";

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(rateLimit({ windowMs: config.rateLimitWindowMs, max: config.rateLimitMax }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/settings", settingRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

export function startApi() {
  app.listen(config.port, () => {
    console.log(`🌐 API server running on port ${config.port}`);
  });
}

export default app;
