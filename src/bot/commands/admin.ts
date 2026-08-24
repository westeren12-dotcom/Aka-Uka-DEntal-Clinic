import { Context } from "telegraf";
import { adminService } from "../../services/admin.service";
import { appointmentService } from "../../services/appointment.service";
import { patientService } from "../../services/patient.service";
import { analyticsService } from "../../services/analytics.service";
import { doctorService } from "../../services/doctor.service";
import { serviceCatalogService } from "../../services/service.service";
import { notificationService } from "../../services/notification.service";
import { config } from "../../utils/config";

function formatCurrency(amount: number): string {
  return amount.toLocaleString("uz-UZ");
}

// /today — Today's appointments
export async function todayCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  const appointments = await appointmentService.getTodayAppointments();

  if (!appointments.length) {
    return ctx.reply("📅 No appointments today.");
  }

  const lines = appointments.map(
    (a) =>
      `🕐 <b>${a.time}</b> — ${a.patient.firstName || "Unknown"} — ${a.service.name}`
  );

  const text = [
    `📅 <b>TODAY'S APPOINTMENTS</b>`,
    ``,
    ...lines,
    ``,
    `━━━━━━━━━━━━━━`,
    `👥 Total: ${appointments.length}`,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML" });
}

// /earnings — Today's revenue
export async function earningsCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  const stats = await analyticsService.getRevenueStats();

  if (!stats.byService.length) {
    return ctx.reply("💰 No earnings today.");
  }

  const lines = stats.byService.map(
    (s) => `${s.name}: ${formatCurrency(s.revenue)} UZS`
  );

  const text = [
    `💰 <b>TODAY'S EARNINGS</b>`,
    ``,
    ...lines,
    ``,
    `━━━━━━━━━━━━━━`,
    `💵 Total: ${formatCurrency(stats.today)} UZS`,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML" });
}

// /appointments — Upcoming appointments
export async function appointmentsCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  const appointments = await appointmentService.getUpcoming();

  if (!appointments.length) {
    return ctx.reply("📋 No upcoming appointments.");
  }

  const lines = appointments.slice(0, 20).map(
    (a) =>
      `📅 ${a.date.toLocaleDateString()} ${a.time} — ${a.patient.firstName || "?"} — ${a.service.name} (${a.status})`
  );

  const text = [
    `📋 <b>UPCOMING APPOINTMENTS</b>`,
    ``,
    ...lines,
    ``,
    `Total: ${appointments.length}`,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML" });
}

// /patients — Patient statistics
export async function patientsCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  const stats = await patientService.getPatientStats();

  const text = [
    `👥 <b>PATIENT STATISTICS</b>`,
    ``,
    `👥 Total patients: <b>${stats.total}</b>`,
    `🆕 New today: <b>${stats.newToday}</b>`,
    `🔄 Returning today: <b>${stats.returning}</b>`,
    `📅 Today's patients: <b>${stats.todayPatients}</b>`,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML" });
}

// /doctors — Doctor list and schedules
export async function doctorsCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  const stats = await analyticsService.getDoctorStats();

  if (!stats.length) {
    return ctx.reply("👨‍⚕️ No doctors registered.");
  }

  const lines = stats.map(
    (d) =>
      `👨‍⚕️ <b>${d.name}</b> (${d.specialty}) — Today: ${d.todayAppointments} appointments`
  );

  const text = [
    `👨‍⚕️ <b>DOCTORS</b>`,
    ``,
    ...lines,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML" });
}

// /services — Service management
export async function servicesCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  const services = await serviceCatalogService.findAll();

  if (!services.length) {
    return ctx.reply("🦷 No services configured.");
  }

  const lines = services.map(
    (s) =>
      `${s.isActive ? "🟢" : "🔴"} <b>${s.name}</b> — ${s.price.toString()} UZS — ${s.duration}min`
  );

  const text = [
    `🦷 <b>SERVICES</b>`,
    ``,
    ...lines,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML" });
}

// /stats — Full analytics
export async function statsCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  const [dashboard, revenue, appointmentStats, patientStats] = await Promise.all([
    analyticsService.getDashboardStats(),
    analyticsService.getRevenueStats(),
    analyticsService.getAppointmentStats(),
    patientService.getPatientStats(),
  ]);

  const text = [
    `📊 <b>FULL ANALYTICS</b>`,
    ``,
    `📅 <b>Today's Appointments:</b> ${dashboard.todayAppointments}`,
    `👥 <b>Today's Patients:</b> ${dashboard.todayPatients}`,
    ``,
    `💰 <b>Revenue:</b>`,
    `  Today: ${formatCurrency(revenue.today)} UZS`,
    `  Week: ${formatCurrency(revenue.week)} UZS`,
    `  Month: ${formatCurrency(revenue.month)} UZS`,
    ``,
    `📋 <b>Appointments (Month):</b>`,
    `  Total: ${appointmentStats.total}`,
    `  Completed: ${appointmentStats.completed}`,
    `  Cancelled: ${appointmentStats.cancelled}`,
    `  No-show: ${appointmentStats.noShow}`,
    ``,
    `👥 <b>Patients:</b>`,
    `  Total: ${patientStats.total}`,
    `  New today: ${patientStats.newToday}`,
    `  Returning: ${patientStats.returning}`,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML" });
}

// /broadcast — Send announcement to all patients
const broadcastSessions = new Map<number, { step: string; message?: string }>();

export async function broadcastCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId || !(await adminService.isAdmin(telegramId))) {
    return ctx.reply("❌ You don't have permission to use this command.");
  }

  broadcastSessions.set(ctx.chat!.id, { step: "waiting_message" });

  await ctx.reply(
    "📢 <b>Broadcast Message</b>\n\nPlease type the announcement you want to send to all patients:",
    { parse_mode: "HTML" }
  );
}

export async function handleBroadcastMessage(ctx: Context, message: string) {
  const session = broadcastSessions.get(ctx.chat!.id);
  if (!session || session.step !== "waiting_message") return false;

  session.message = message;
  session.step = "confirming";

  const telegramIds = await patientService.getAllTelegramIds();

  const confirmText = [
    `⚠️ <b>You are about to send this message to ${telegramIds.length} patients.</b>`,
    ``,
    `<b>Message:</b>`,
    message,
    ``,
    `Are you sure?`,
  ].join("\n");

  await ctx.reply(confirmText, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Send", callback_data: "broadcast_send" },
          { text: "❌ Cancel", callback_data: "broadcast_cancel" },
        ],
      ],
    },
  });

  return true;
}

export async function broadcastSend(ctx: Context) {
  const session = broadcastSessions.get(ctx.chat!.id);
  if (!session?.message) return;

  broadcastSessions.delete(ctx.chat!.id);

  await ctx.reply("📢 Sending broadcast...");

  const result = await notificationService.sendBroadcast(session.message);

  await ctx.reply(
    `✅ Broadcast sent!\n\n📤 Sent: ${result.sent}\n❌ Failed: ${result.failed}\n👥 Total: ${result.total}`
  );
}

export async function broadcastCancel(ctx: Context) {
  broadcastSessions.delete(ctx.chat!.id);
  await ctx.reply("❌ Broadcast cancelled.");
}
