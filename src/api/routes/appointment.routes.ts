import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest, requirePermission } from "../middleware/auth";
import { appointmentService } from "../../services/appointment.service";
import { validate } from "../middleware/validation";

const router = Router();
router.use(authenticateToken);

const createSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

const rescheduleSchema = z.object({
  date: z.string(),
  time: z.string(),
});

// GET /api/appointments
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const status = req.query.status as any;
    const date = req.query.date ? new Date(req.query.date as string) : undefined;

    const result = await appointmentService.getAll({ skip, take, status, date });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/appointments/today
router.get("/today", async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await appointmentService.getTodayAppointments();
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get today error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/appointments/upcoming
router.get("/upcoming", async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await appointmentService.getUpcoming();
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get upcoming error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/appointments/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await appointmentService.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/appointments
router.post("/", requirePermission("appointments:write"), validate(createSchema), async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await appointmentService.create({
      ...req.body,
      date: new Date(req.body.date),
    });
    res.status(201).json({ success: true, data: appointment });
  } catch (error: any) {
    console.error("Create appointment error:", error);
    if (error.message?.includes("already booked")) {
      return res.status(409).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/appointments/:id/status
router.patch("/:id/status", requirePermission("appointments:write"), validate(updateStatusSchema), async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await appointmentService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/appointments/:id/reschedule
router.patch("/:id/reschedule", requirePermission("appointments:write"), validate(rescheduleSchema), async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await appointmentService.reschedule(
      req.params.id,
      new Date(req.body.date),
      req.body.time
    );
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error("Reschedule error:", error);
    if (error.message?.includes("already booked")) {
      return res.status(409).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/appointments/:id
router.delete("/:id", requirePermission("appointments:write"), async (req: AuthRequest, res: Response) => {
  try {
    await appointmentService.cancel(req.params.id);
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/appointments/slots/:doctorId/:serviceId/:date
router.get("/slots/:doctorId/:serviceId/:date", async (req: AuthRequest, res: Response) => {
  try {
    const slots = await appointmentService.getAvailableSlots(
      req.params.doctorId,
      req.params.serviceId,
      new Date(req.params.date)
    );
    res.json({ success: true, data: slots });
  } catch (error) {
    console.error("Get slots error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
