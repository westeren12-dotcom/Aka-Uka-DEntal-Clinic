import prisma from "../utils/prisma";

export class SettingService {
  async get(key: string) {
    const setting = await prisma.clinicSettings.findUnique({ where: { key } });
    return setting?.value;
  }

  async set(key: string, value: string) {
    return prisma.clinicSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAll() {
    const settings = await prisma.clinicSettings.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) result[s.key] = s.value;
    return result;
  }

  // FAQ
  async getActiveFaqs() {
    return prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { id: "asc" } });
  }

  async getAllFaqs() {
    return prisma.fAQ.findMany({ orderBy: { id: "asc" } });
  }

  async createFaq(data: { question: string; answer: string; category?: string }) {
    return prisma.fAQ.create({ data });
  }

  async updateFaq(id: string, data: { question?: string; answer?: string; category?: string; isActive?: boolean }) {
    return prisma.fAQ.update({ where: { id }, data });
  }

  async deleteFaq(id: string) {
    return prisma.fAQ.delete({ where: { id } });
  }

  async searchFaqs(query: string) {
    return prisma.fAQ.findMany({
      where: {
        isActive: true,
        OR: [
          { question: { contains: query, mode: "insensitive" } },
          { answer: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  }
}

export const settingService = new SettingService();
