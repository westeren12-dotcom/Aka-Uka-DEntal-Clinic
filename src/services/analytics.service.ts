import prisma from "../utils/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export class AnalyticsService {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayAppointments,
      todayPatients,
      todayRevenue,
      monthlyRevenue,
      cancelledToday,
      noShowsToday,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow }, status: { notIn: ["CANCELLED"] } },
      }),
      prisma.patient.count({
        where: { appointments: { some: { date: { gte: today, lt: tomorrow } } } },
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: today, lt: tomorrow },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow }, status: "CANCELLED" },
      }),
      prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow }, status: "NO_SHOW" },
      }),
    ]);

    return {
      todayAppointments,
      todayPatients,
      todayRevenue: Number(todayRevenue._sum.amount ?? 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
      cancelledAppointments: cancelledToday,
      noShows: noShowsToday,
    };
  }

  async getRevenueStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: todayStart, lt: tomorrowStart } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: weekStart } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
    ]);

    // Revenue by service for the month
    const revenueByService = await prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      include: { appointment: { include: { service: true } } },
    });

    const serviceMap = new Map<string, { name: string; revenue: number; count: number }>();
    for (const p of revenueByService) {
      const serviceName = p.appointment.service.name;
      const existing = serviceMap.get(serviceName);
      if (existing) {
        existing.revenue += Number(p.amount);
        existing.count += 1;
      } else {
        serviceMap.set(serviceName, { name: serviceName, revenue: Number(p.amount), count: 1 });
      }
    }

    return {
      today: Number(todayRevenue._sum.amount ?? 0),
      week: Number(weekRevenue._sum.amount ?? 0),
      month: Number(monthRevenue._sum.amount ?? 0),
      byService: Array.from(serviceMap.values()),
    };
  }

  async getAppointmentStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, completed, cancelled, noShow, pending, confirmed] = await Promise.all([
      prisma.appointment.count({ where: { date: { gte: monthStart } } }),
      prisma.appointment.count({ where: { date: { gte: monthStart }, status: "COMPLETED" } }),
      prisma.appointment.count({ where: { date: { gte: monthStart }, status: "CANCELLED" } }),
      prisma.appointment.count({ where: { date: { gte: monthStart }, status: "NO_SHOW" } }),
      prisma.appointment.count({ where: { date: { gte: todayStart, lt: tomorrowStart }, status: "PENDING" } }),
      prisma.appointment.count({ where: { date: { gte: todayStart, lt: tomorrowStart }, status: "CONFIRMED" } }),
    ]);

    return { total, completed, cancelled, noShow, pending, confirmed };
  }

  async getWeeklyRevenue(): Promise<{ day: string; revenue: number }[]> {
    const now = new Date();
    const results: { day: string; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const rev = await prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: d, lt: next } },
        _sum: { amount: true },
      });

      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      results.push({ day: dayName, revenue: Number(rev._sum.amount ?? 0) });
    }
    return results;
  }

  async getDoctorStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        appointments: {
          where: { date: { gte: today, lt: tomorrow }, status: { notIn: ["CANCELLED"] } },
          include: { patient: true, service: true },
        },
      },
    });

    return doctors.map((d) => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      todayAppointments: d.appointments.length,
      appointments: d.appointments,
    }));
  }
}

export const analyticsService = new AnalyticsService();
