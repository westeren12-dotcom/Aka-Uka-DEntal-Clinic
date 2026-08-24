import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest, requirePermission } from "../middleware/auth";
import { adminService } from "../../services/admin.service";
import { validate } from "../middleware/validation";

const router = Router();
router.use(authenticateToken);
router.use(requirePermission("admins:read"));

const updateRoleSchema = z.object({
  role: z.enum(["OWNER", "MANAGER", "RECEPTIONIST"]),
});

// GET /api/admins
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const admins = await adminService.getAll();
    res.json({ success: true, data: admins });
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admins/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const admin = await adminService.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }
    res.json({
      success: true,
      data: {
        id: admin.id,
        telegramId: admin.telegramId.toString(),
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Get admin error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admins/:id/role
router.patch("/:id/role", requirePermission("admins:write"), validate(updateRoleSchema), async (req: AuthRequest, res: Response) => {
  try {
    const admin = await adminService.updateRole(req.params.id, req.body.role);
    res.json({ success: true, data: admin });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admins/:id/toggle-active
router.patch("/:id/toggle-active", requirePermission("admins:write"), async (req: AuthRequest, res: Response) => {
  try {
    const admin = await adminService.toggleActive(req.params.id);
    res.json({ success: true, data: admin });
  } catch (error) {
    console.error("Toggle active error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
