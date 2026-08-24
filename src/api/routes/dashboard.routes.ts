import { Router, Response } from "express";
import { authenticateToken, AuthRequest, requirePermission } from "../middleware/auth";
import { analyticsService } from "../../services/analytics.service";
import { patientService } from "../../services/patient.service";

const router = Router();

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/dashboard/revenue
router.get("/revenue", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await analyticsService.getRevenueStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Revenue stats error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/dashboard/weekly-revenue
router.get("/weekly-revenue", async (req: AuthRequest, res: Response) => {
  try {
    const data = await analyticsService.getWeeklyRevenue();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Weekly revenue error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/dashboard/appointment-stats
router.get("/appointment-stats", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await analyticsService.getAppointmentStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Appointment stats error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/dashboard/patient-stats
router.get("/patient-stats", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await patientService.getPatientStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Patient stats error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/dashboard/doctor-stats
router.get("/doctor-stats", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await analyticsService.getDoctorStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Doctor stats error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
