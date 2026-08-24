import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { config } from "../../utils/config";
import { adminService } from "../../services/admin.service";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();

const loginSchema = z.object({
  telegramId: z.number(),
  password: z.string(),
});

const registerSchema = z.object({
  telegramId: z.number(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["OWNER", "MANAGER", "RECEPTIONIST"]).optional(),
});

function generateToken(admin: { id: string; telegramId: bigint; role: string }) {
  return jwt.sign(
    { adminId: admin.id, telegramId: admin.telegramId, role: admin.role },
    config.jwtSecret,
    { expiresIn: 604800 } // 7 days in seconds
  );
}

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { telegramId, password } = req.body;

    const admin = await adminService.findByTelegramId(telegramId);
    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, error: "Account is disabled" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(admin);

    await adminService.logActivity(admin.id, "LOGIN", "Web dashboard login");

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          telegramId: admin.telegramId.toString(),
          username: admin.username,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const existing = await adminService.findByTelegramId(req.body.telegramId);
    if (existing) {
      return res.status(409).json({ success: false, error: "Admin already exists" });
    }

    const admin = await adminService.createAdmin(req.body);
    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          telegramId: admin.telegramId.toString(),
          username: admin.username,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await adminService.findById(req.admin!.adminId);
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
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
