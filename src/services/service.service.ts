import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";

export class ServiceCatalogService {
  async create(data: { name: string; description?: string; price: number; duration?: number }) {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration ?? 30,
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; description?: string; price?: number; duration?: number; isActive?: boolean }
  ) {
    return prisma.service.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.service.delete({ where: { id } });
  }

  async findById(id: string) {
    return prisma.service.findUnique({ where: { id } });
  }

  async findActive() {
    return prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findAll() {
    return prisma.service.findMany({ orderBy: { name: "asc" } });
  }

  async getServicesForDoctor(doctorId: string) {
    return prisma.service.findMany({
      where: {
        isActive: true,
        doctors: { some: { doctorId } },
      },
    });
  }

  async search(query: string) {
    return prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  }
}

export const serviceCatalogService = new ServiceCatalogService();
