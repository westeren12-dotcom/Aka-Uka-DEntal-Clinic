import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../utils/config";
import { AdminTokenPayload, hasPermission } from "../../types";

export interface AuthRequest extends Request {
  admin?: AdminTokenPayload;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AdminTokenPayload;
    req.admin = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, error: "Insufficient permissions" });
    }
    next();
  };
}

export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    if (!hasPermission(req.admin.role, permission)) {
      return res.status(403).json({ success: false, error: "Insufficient permissions" });
    }
    next();
  };
}
