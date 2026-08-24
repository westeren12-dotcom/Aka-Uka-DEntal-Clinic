import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest, requirePermission } from "../middleware/auth";
import { settingService } from "../../services/setting.service";
import { validate } from "../middleware/validation";

const router = Router();
router.use(authenticateToken);

// GET /api/settings
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const settings = await settingService.getAll();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/settings
router.put("/", requirePermission("settings:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof value !== "string") {
      return res.status(400).json({ success: false, error: "key and value are required" });
    }
    await settingService.set(key, value);
    res.json({ success: true, message: "Setting updated" });
  } catch (error) {
    console.error("Update setting error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ====== FAQ Routes ======

const faqCreateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
});

const faqUpdateSchema = faqCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// GET /api/faqs
router.get("/faqs", async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await settingService.getAllFaqs();
    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error("Get FAQs error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/faqs
router.post("/faqs", requirePermission("settings:write"), validate(faqCreateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const faq = await settingService.createFaq(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    console.error("Create FAQ error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PUT /api/faqs/:id
router.put("/faqs/:id", requirePermission("settings:write"), validate(faqUpdateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const faq = await settingService.updateFaq(req.params.id, req.body);
    res.json({ success: true, data: faq });
  } catch (error) {
    console.error("Update FAQ error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/faqs/:id
router.delete("/faqs/:id", requirePermission("settings:write"), async (req: AuthRequest, res: Response) => {
  try {
    await settingService.deleteFaq(req.params.id);
    res.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
