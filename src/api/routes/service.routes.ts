import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest, requirePermission } from "../middleware/auth";
import { serviceCatalogService } from "../../services/service.service";
import { validate } from "../middleware/validation";

const router = Router();
router.use(authenticateToken);

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().int().positive().optional(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// GET /api/services
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const services = await serviceCatalogService.findAll();
    res.json({ success: true, data: services });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/services/active
router.get("/active", async (req: AuthRequest, res: Response) => {
  try {
    const services = await serviceCatalogService.findActive();
    res.json({ success: true, data: services });
  } catch (error) {
    console.error("Get active services error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/services/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const service = await serviceCatalogService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/services
router.post("/", requirePermission("services:write"), validate(createSchema), async (req: AuthRequest, res: Response) => {
  try {
    const service = await serviceCatalogService.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/services/:id
router.put("/:id", requirePermission("services:write"), validate(updateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const service = await serviceCatalogService.update(req.params.id, req.body);
    res.json({ success: true, data: service });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/services/:id/price
router.patch("/:id/price", requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { price } = req.body;
    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ success: false, error: "Invalid price" });
    }
    const service = await serviceCatalogService.update(req.params.id, { price });
    res.json({ success: true, data: service });
  } catch (error) {
    console.error("Update price error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/services/:id
router.delete("/:id", requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    await serviceCatalogService.delete(req.params.id);
    res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
