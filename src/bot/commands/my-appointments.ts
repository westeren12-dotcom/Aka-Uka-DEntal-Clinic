import { Context } from "telegraf";
import { appointmentService } from "../../services/appointment.service";
import { t, Language } from "../languages";
import { mainMenu } from "../keyboards";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

export async function myAppointments(ctx: Context) {
  try {
    const lang = getLang(ctx);
    const tl = t(lang);

    const user = ctx.from;
    if (!user) return;

    const { prisma } = await import("../../utils/prisma");
    const patient = await prisma.patient.findUnique({
      where: { telegramId: BigInt(user.id) },
    });

    if (!patient) {
      await ctx.reply(tl.noAppointments, mainMenu(lang));
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: true, service: true },
      orderBy: { date: "desc" },
    });

    if (!appointments.length) {
      await ctx.reply(tl.noAppointments, mainMenu(lang));
      return;
    }

    const statusMap: Record<string, string> = {
      PENDING: tl.statusPending,
      CONFIRMED: tl.statusConfirmed,
      COMPLETED: tl.statusCompleted,
      CANCELLED: tl.statusCancelled,
      NO_SHOW: "🚫 No-show",
    };

    let text = tl.myAppointmentsTitle + "\n\n";
    for (const apt of appointments.slice(0, 10)) {
      const status = statusMap[apt.status] || apt.status;
      text += tl.appointmentEntry(
        apt.service.name,
        apt.doctor.name,
        apt.date.toLocaleDateString(),
        apt.time,
        status
      ) + "\n\n";
    }

    const buttons: any[][] = [];
    const upcoming = appointments.filter(
      (a) => a.status === "PENDING" || a.status === "CONFIRMED"
    );
    if (upcoming.length > 0) {
      buttons.push([
        { text: tl.btnReschedule, callback_data: `appt_reschedule_${upcoming[0].id}` },
        { text: tl.btnCancel, callback_data: `appt_cancel_${upcoming[0].id}` },
      ]);
    }

    buttons.push([{ text: tl.btnBackToMenu, callback_data: "main_menu" }]);

    await ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons },
    });
  } catch (error: any) {
    console.error("Error showing appointments:", error.message);
    const lang = getLang(ctx);
    await ctx.reply(t(lang).error, mainMenu(lang));
  }
}
