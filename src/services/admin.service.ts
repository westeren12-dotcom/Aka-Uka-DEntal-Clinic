import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import { config } from "../utils/config";

export class AdminService {
  async createAdmin(data: {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    password: string;
    role?: "OWNER" | "MANAGER" | "RECEPTIONIST";
  }) {
    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);
    return prisma.admin.create({
      data: {
        telegramId: BigInt(data.telegramId),
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        role: data.role ?? "RECEPTIONIST",
      },
    });
  }

  async findByTelegramId(telegramId: number) {
    return prisma.admin.findUnique({ where: { telegramId: BigInt(telegramId) } });
  }

  async findById(id: string) {
    return prisma.admin.findUnique({ where: { id } });
  }

  async verifyPassword(admin: { password: string }, password: string): Promise<boolean> {
    return bcrypt.compare(password, admin.password);
  }

  async isAdmin(telegramId: number): Promise<boolean> {
    // Check database
    const admin = await this.findByTelegramId(telegramId);
    if (admin && admin.isActive) return true;
    // Check env variable
    return config.adminTelegramIds.includes(BigInt(telegramId));
  }

  async getAll() {
    return prisma.admin.findMany({
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateRole(id: string, role: "OWNER" | "MANAGER" | "RECEPTIONIST") {
    return prisma.admin.update({
      where: { id },
      data: { role },
      select: { id: true, telegramId: true, username: true, role: true },
    });
  }

  async toggleActive(id: string) {
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new Error("Admin not found");
    return prisma.admin.update({
      where: { id },
      data: { isActive: !admin.isActive },
      select: { id: true, telegramId: true, username: true, isActive: true },
    });
  }

  async logActivity(adminId: string, action: string, details?: string, ipAddress?: string) {
    return prisma.adminActivityLog.create({
      data: { adminId, action, details, ipAddress },
    });
  }
}

export const adminService = new AdminService();
