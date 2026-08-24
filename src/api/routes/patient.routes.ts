import { Router, Response } from "express";
import { authenticateToken, AuthRequest, requirePermission } from "../middleware/auth";
import { patientService } from "../../services/patient.service";

const router = Router();
router.use(authenticateToken);

// GET /api/patients
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await patientService.getAll({ skip, take, search });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/patients/stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await patientService.getPatientStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Patient stats error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/patients/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const patient = await patientService.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error("Get patient error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
