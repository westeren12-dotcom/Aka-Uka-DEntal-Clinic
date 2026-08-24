import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest, requirePermission } from "../middleware/auth";
import { doctorService } from "../../services/doctor.service";
import { validate } from "../middleware/validation";

const router = Router();
router.use(authenticateToken);

const createSchema = z.object({
  name: z.string().min(1),
  specialty: z.string().min(1),
  description: z.string().optional(),
  workingDays: z.string().optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
});

const updateSchema = createSchema.partial();

// GET /api/doctors
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await doctorService.findAll();
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/doctors/active
router.get("/active", async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await doctorService.findActive();
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Get active doctors error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/doctors/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const doctor = await doctorService.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/doctors
router.post("/", requirePermission("doctors:write"), validate(createSchema), async (req: AuthRequest, res: Response) => {
  try {
    const doctor = await doctorService.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Create doctor error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/doctors/:id
router.put("/:id", requirePermission("doctors:write"), validate(updateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const doctor = await doctorService.update(req.params.id, req.body);
    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/doctors/:id
router.delete("/:id", requirePermission("doctors:write"), async (req: AuthRequest, res: Response) => {
  try {
    await doctorService.delete(req.params.id);
    res.json({ success: true, message: "Doctor deleted" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
