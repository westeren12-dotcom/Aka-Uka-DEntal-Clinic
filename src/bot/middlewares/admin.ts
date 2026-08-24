import { Context, MiddlewareFn } from "telegraf";
import { adminService } from "../../services/admin.service";
import { hasPermission, BotSession } from "../../types";

export interface AdminContext extends Context {
  session: BotSession;
  adminId?: string;
  adminRole?: string;
}

export const adminAuth: MiddlewareFn<AdminContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply("❌ Unable to identify you.");
    return;
  }

  const isAdmin = await adminService.isAdmin(telegramId);
  if (!isAdmin) {
    await ctx.reply("❌ You don't have permission to use this command.");
    return;
  }

  const admin = await adminService.findByTelegramId(telegramId);
  if (admin) {
    (ctx as AdminContext).adminId = admin.id;
    (ctx as AdminContext).adminRole = admin.role;
  }

  return next();
};

export function requirePermission(permission: string): MiddlewareFn<AdminContext> {
  return async (ctx, next) => {
    const role = (ctx as AdminContext).adminRole;
    if (!role) {
      await ctx.reply("❌ Access denied.");
      return;
    }
    if (!hasPermission(role as any, permission)) {
      await ctx.reply("❌ You don't have permission for this action.");
      return;
    }
    return next();
  };
}
