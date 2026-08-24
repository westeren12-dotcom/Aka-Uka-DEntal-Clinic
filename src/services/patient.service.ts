import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";

export class PatientService {
  async findOrCreateByTelegram(telegramId: number, firstName?: string, lastName?: string, username?: string) {
    const existing = await prisma.patient.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (existing) {
      return prisma.patient.update({
        where: { id: existing.id },
        data: {
          firstName: firstName ?? existing.firstName,
          lastName: lastName ?? existing.lastName,
          username: username ?? existing.username,
        },
      });
    }
    return prisma.patient.create({
      data: { telegramId: BigInt(telegramId), firstName, lastName, username },
    });
  }

  async findByTelegramId(telegramId: number) {
    return prisma.patient.findUnique({ where: { telegramId: BigInt(telegramId) } });
  }

  async findById(id: string) {
    return prisma.patient.findUnique({ where: { id } });
  }

  async updatePhone(patientId: string, phone: string) {
    return prisma.patient.update({ where: { id: patientId }, data: { phoneNumber: phone } });
  }

  async getAll(options?: { skip?: number; take?: number; search?: string }) {
    const where: Prisma.PatientWhereInput = options?.search
      ? {
          OR: [
            { firstName: { contains: options.search, mode: "insensitive" } },
            { lastName: { contains: options.search, mode: "insensitive" } },
            { username: { contains: options.search, mode: "insensitive" } },
            { phoneNumber: { contains: options.search } },
          ],
        }
      : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        orderBy: { createdAt: "desc" },
        include: { appointments: { select: { id: true } } },
      }),
      prisma.patient.count({ where }),
    ]);

    return { patients, total };
  }

  async getPatientStats() {
    const total = await prisma.patient.count();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const newToday = await prisma.patient.count({
      where: { createdAt: { gte: todayStart } },
    });

    const todayPatients = await prisma.patient.findMany({
      where: {
        appointments: { some: { date: { gte: todayStart } } },
      },
      select: { id: true, createdAt: true },
    });

    const returning = todayPatients.filter(
      (p) => p.createdAt < todayStart
    ).length;

    return { total, newToday, returning, todayPatients: todayPatients.length };
  }

  async getAllTelegramIds(): Promise<bigint[]> {
    const patients = await prisma.patient.findMany({
      select: { telegramId: true },
    });
    return patients.map((p) => p.telegramId);
  }
}

export const patientService = new PatientService();
