import prisma from "../utils/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";

export class AppointmentService {
  async create(data: {
    patientId: string;
    doctorId: string;
    serviceId: string;
    date: Date;
    time: string;
    notes?: string;
  }) {
    // Check for double-booking
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: data.date,
        time: data.time,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existing) {
      throw new Error("This time slot is already booked. Please choose another time.");
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        date: data.date,
        time: data.time,
        notes: data.notes,
      },
      include: {
        patient: true,
        doctor: true,
        service: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: appointment.service.price,
      },
    });

    return appointment;
  }

  async getAvailableSlots(doctorId: string, serviceId: string, date: Date) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { services: true },
    });

    if (!doctor || !doctor.isActive) return [];

    // Check doctor works on this day
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[date.getDay()];
    if (!doctor.workingDays.split(",").map((d) => d.trim()).includes(dayName)) {
      return [];
    }

    // Check doctor provides this service
    const hasService = doctor.services.some((ds) => ds.serviceId === serviceId);
    if (!hasService) return [];

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const duration = service?.duration ?? 30;

    // Get existing appointments for this doctor on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { time: true },
    });

    const bookedTimes = new Set(existingAppointments.map((a) => a.time));

    // Generate time slots
    const [startH, startM] = doctor.workingHoursStart.split(":").map(Number);
    const [endH, endM] = doctor.workingHoursEnd.split(":").map(Number);
    const slots: { time: string; available: boolean }[] = [];

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + duration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      slots.push({ time: timeStr, available: !bookedTimes.has(timeStr) });
      currentMinutes += 30; // 30-minute intervals
    }

    return slots;
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true, service: true, payment: true },
    });

    if (status === "COMPLETED" && appointment.payment) {
      await prisma.payment.update({
        where: { id: appointment.payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }

    return appointment;
  }

  async cancel(id: string) {
    return this.updateStatus(id, "CANCELLED");
  }

  async confirm(id: string) {
    return this.updateStatus(id, "CONFIRMED");
  }

  async reschedule(id: string, newDate: Date, newTime: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true },
    });

    if (!appointment) throw new Error("Appointment not found");

    // Check double-booking for new slot
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        date: newDate,
        time: newTime,
        status: { in: ["PENDING", "CONFIRMED"] },
        id: { not: id },
      },
    });

    if (existing) {
      throw new Error("This time slot is already booked. Please choose another time.");
    }

    return prisma.appointment.update({
      where: { id },
      data: { date: newDate, time: newTime },
      include: { patient: true, doctor: true, service: true },
    });
  }

  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true, service: true, payment: true },
    });
  }

  async getByPatientId(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: true, service: true },
      orderBy: { date: "desc" },
    });
  }

  async getUpcomingByPatientId(patientId: string) {
    const now = new Date();
    return prisma.appointment.findMany({
      where: {
        patientId,
        date: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { doctor: true, service: true },
      orderBy: { date: "asc" },
    });
  }

  async getPastByPatientId(patientId: string) {
    const now = new Date();
    return prisma.appointment.findMany({
      where: {
        patientId,
        OR: [
          { date: { lt: now } },
          { status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] } },
        ],
      },
      include: { doctor: true, service: true },
      orderBy: { date: "desc" },
    });
  }

  async getTodayAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.appointment.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        status: { notIn: ["CANCELLED"] },
      },
      include: { patient: true, doctor: true, service: true },
      orderBy: { time: "asc" },
    });
  }

  async getAll(options?: { skip?: number; take?: number; status?: AppointmentStatus; date?: Date }) {
    const where: Prisma.AppointmentWhereInput = {};
    if (options?.status) where.status = options.status;
    if (options?.date) {
      const start = new Date(options.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: { patient: true, doctor: true, service: true, payment: true },
        orderBy: { date: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, total };
  }

  async getUpcoming() {
    const now = new Date();
    return prisma.appointment.findMany({
      where: {
        date: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { patient: true, doctor: true, service: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
  }

  async getRemindersNeeded(hoursBefore: number) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(target.getHours() + hoursBefore);

    const startWindow = new Date(target);
    startWindow.setMinutes(startWindow.getMinutes() - 30);
    const endWindow = new Date(target);
    endWindow.setMinutes(endWindow.getMinutes() + 30);

    return prisma.appointment.findMany({
      where: {
        date: { gte: startWindow, lte: endWindow },
        status: { in: ["CONFIRMED", "PENDING"] },
        ...(hoursBefore === 24 ? { reminder24hSent: false } : { reminder2hSent: false }),
      },
      include: { patient: true, doctor: true, service: true },
    });
  }

  async markReminderSent(id: string, type: "24h" | "2h") {
    return prisma.appointment.update({
      where: { id },
      data: type === "24h" ? { reminder24hSent: true } : { reminder2hSent: true },
    });
  }
}

export const appointmentService = new AppointmentService();
