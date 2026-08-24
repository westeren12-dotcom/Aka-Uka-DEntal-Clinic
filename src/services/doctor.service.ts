import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";

export class DoctorService {
  async create(data: {
    name: string;
    specialty: string;
    description?: string;
    workingDays?: string;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    serviceIds?: string[];
  }) {
    return prisma.doctor.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        description: data.description,
        workingDays: data.workingDays ?? "Mon,Tue,Wed,Thu,Fri",
        workingHoursStart: data.workingHoursStart ?? "09:00",
        workingHoursEnd: data.workingHoursEnd ?? "18:00",
        services: data.serviceIds?.length
          ? { create: data.serviceIds.map((serviceId) => ({ serviceId })) }
          : undefined,
      },
      include: { services: { include: { service: true } } },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      specialty?: string;
      description?: string;
      workingDays?: string;
      workingHoursStart?: string;
      workingHoursEnd?: string;
      isActive?: boolean;
      serviceIds?: string[];
    }
  ) {
    if (data.serviceIds) {
      await prisma.doctorService.deleteMany({ where: { doctorId: id } });
      if (data.serviceIds.length) {
        await prisma.doctorService.createMany({
          data: data.serviceIds.map((serviceId) => ({ doctorId: id, serviceId })),
        });
      }
    }
    const { serviceIds, ...rest } = data;
    return prisma.doctor.update({
      where: { id },
      data: rest,
      include: { services: { include: { service: true } } },
    });
  }

  async delete(id: string) {
    return prisma.doctor.delete({ where: { id } });
  }

  async findById(id: string) {
    return prisma.doctor.findUnique({
      where: { id },
      include: { services: { include: { service: true } } },
    });
  }

  async findActive() {
    return prisma.doctor.findMany({
      where: { isActive: true },
      include: { services: { include: { service: true } } },
      orderBy: { name: "asc" },
    });
  }

  async findAll() {
    return prisma.doctor.findMany({
      include: { services: { include: { service: true } } },
      orderBy: { name: "asc" },
    });
  }

  async getDoctorsForService(serviceId: string) {
    return prisma.doctor.findMany({
      where: { isActive: true, services: { some: { serviceId } } },
      include: { services: { include: { service: true } } },
    });
  }

  isWorkingOnDay(doctor: { workingDays: string }, date: Date): boolean {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[date.getDay()];
    return doctor.workingDays.split(",").map((d) => d.trim()).includes(dayName);
  }
}

export const doctorService = new DoctorService();
