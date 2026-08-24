import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { patientService } from "../../services/patient.service";
import { appointmentService } from "../../services/appointment.service";

export async function myAppointments(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const patient = await patientService.findByTelegramId(telegramId);
  if (!patient) {
    await ctx.reply("You don't have any appointments yet. Book one first!", keyboards.backToMainMenu());
    return;
  }

  const [upcoming, past] = await Promise.all([
    appointmentService.getUpcomingByPatientId(patient.id),
    appointmentService.getPastByPatientId(patient.id),
  ]);

  const statusEmoji: Record<string, string> = {
    PENDING: "⏳",
    CONFIRMED: "✅",
    COMPLETED: "✔️",
    CANCELLED: "❌",
    NO_SHOW: "🚫",
  };

  const lines: string[] = [];

  if (upcoming.length) {
    lines.push(`<b>📅 Upcoming Appointments</b>`);
    lines.push(``);
    for (const a of upcoming) {
      lines.push(
        `${statusEmoji[a.status] || "📅"} <b>${a.service.name}</b> with ${a.doctor.name}`,
        `   📅 ${a.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${a.time}`,
        `   Status: ${a.status}`,
        ``,
      );
    }
  }

  if (past.length) {
    lines.push(`<b>📋 Previous Appointments</b>`);
    lines.push(``);
    for (const a of past.slice(0, 5)) {
      lines.push(
        `${statusEmoji[a.status] || "📋"} <b>${a.service.name}</b> with ${a.doctor.name}`,
        `   📅 ${a.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${a.time}`,
        `   Status: ${a.status}`,
        ``,
      );
    }
  }

  if (!upcoming.length && !past.length) {
    lines.push("📋 You don't have any appointments yet.");
    lines.push("");
    lines.push("Would you like to book one?");
  }

  if (upcoming.length) {
    const first = upcoming[0];
    const text = lines.join("\n");

    await ctx.reply(text, {
      parse_mode: "HTML",
      ...keyboards.appointmentActions(first.id, first.status),
    });
  } else {
    await ctx.reply(lines.join("\n"), { parse_mode: "HTML", ...keyboards.mainMenu() });
  }
}
