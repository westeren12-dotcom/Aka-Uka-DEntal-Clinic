import { Context } from "telegraf";
import prisma from "../../utils/prisma";
import { backToMainMenu } from "../keyboards";
import { t, Language } from "../languages";
import { getSession } from "../middlewares/session";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

export async function showDoctors(ctx: Context) {
  try {
    const lang = getLang(ctx);
    const tl = t(lang);

    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: { services: { include: { service: true } } },
    });

    if (doctors.length === 0) {
      await ctx.reply("No doctors available.", backToMainMenu(lang));
      return;
    }

    let text = tl.doctorsTitle + "\n\n";
    for (const d of doctors) {
      const serviceNames = d.services.map((ds) => ds.service.name).join(", ");
      const daysMap: Record<Language, Record<string, string>> = {
        uz: { Mon: "Dush", Tue: "Sesh", Wed: "Chor", Thu: "Pay", Fri: "Jum", Sat: "Shan" },
        ru: { Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб" },
      };
      const langMap = daysMap[lang] || daysMap.uz;
      const workingDays = d.workingDays
        .split(",")
        .map((day) => langMap[day.trim()] || day.trim())
        .join(", ");
      const hours = `${d.workingHoursStart} - ${d.workingHoursEnd}`;

      text += tl.doctorEntry(d.name, d.specialty, d.description || "", workingDays, hours) + "\n";
      text += `📋 ${tl.doctorServices} ${serviceNames}\n\n`;
    }

    await ctx.reply(text, { parse_mode: "HTML", ...backToMainMenu(lang) });
  } catch (error: any) {
    console.error("Error showing doctors:", error.message);
    const lang = getLang(ctx);
    await ctx.reply(t(lang).error, backToMainMenu(lang));
  }
}
