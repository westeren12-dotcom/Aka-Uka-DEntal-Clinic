import { AppointmentStatus, PaymentStatus, UserRole } from "@prisma/client";

import { Language } from "../bot/languages";

export interface BotSession {
  step?: string;
  lang?: Language;
  serviceId?: string;
  doctorId?: string;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface AppointmentSummary {
  patientName: string;
  serviceName: string;
  servicePrice: string;
  doctorName: string;
  date: string;
  time: string;
}

export interface AdminTokenPayload {
  adminId: string;
  telegramId: bigint;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface DaySchedule {
  day: string;
  date: string;
  available: boolean;
}

export interface DashboardStats {
  todayAppointments: number;
  todayPatients: number;
  todayRevenue: number;
  monthlyRevenue: number;
  cancelledAppointments: number;
  noShows: number;
}

export interface RevenueStats {
  today: number;
  week: number;
  month: number;
  byService: { name: string; revenue: number; count: number }[];
}

export interface PatientStats {
  total: number;
  newToday: number;
  returning: number;
  todayPatients: number;
}

export const UserRolePermissions: Record<UserRole, string[]> = {
  OWNER: [
    "appointments:read",
    "appointments:write",
    "patients:read",
    "patients:write",
    "doctors:read",
    "doctors:write",
    "services:read",
    "services:write",
    "payments:read",
    "payments:write",
    "analytics:read",
    "settings:read",
    "settings:write",
    "admins:read",
    "admins:write",
    "broadcast:send",
  ],
  MANAGER: [
    "appointments:read",
    "appointments:write",
    "patients:read",
    "patients:write",
    "doctors:read",
    "doctors:write",
    "services:read",
    "services:write",
    "payments:read",
    "analytics:read",
    "broadcast:send",
  ],
  RECEPTIONIST: [
    "appointments:read",
    "appointments:write",
    "patients:read",
    "patients:write",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return UserRolePermissions[role]?.includes(permission) ?? false;
}
