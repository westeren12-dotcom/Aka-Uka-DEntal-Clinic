import { Context } from "telegraf";
import prisma from "../../utils/prisma";
import { backToMainMenu } from "../keyboards";
import { t, Language } from "../languages";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

function docName(d: any, lang: Language): string {
  if (lang === "ru" && d.nameRu) return d.nameRu;
  return d.name;
}

function docSpec(d: any, lang: Language): string {
  if (lang === "ru" && d.specialtyRu) return d.specialtyRu;
  return d.specialty;
}

function docDesc(d: any, lang: Language): string {
  if (lang === "ru" && d.descriptionRu) return d.descriptionRu;
  return d.description || "";
}

const daysUz: Record<string, string> = { Mon: "Dush", Tue: "Sesh", Wed: "Chor", Thu: "Pay", Fri: "Jum", Sat: "Shan", Sun: "Yak" };
const daysRu: Record<string, string> = { Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб", Sun: "Вс" };

export async function showDoctors(ctx: Context) {
  try {
    const lang = getLang(ctx);
    const tl = t(lang);

    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: { services: { include: { service: true } } },
    });

    if (!doctors.length) {
      await ctx.reply("No doctors available.", backToMainMenu(lang));
      return;
    }

    let text = tl.doctorsTitle + "\n\n";
    for (const d of doctors) {
      const serviceNames = d.services.map((ds) =>
        lang === "ru" && ds.service.nameRu ? ds.service.nameRu : ds.service.name
      ).join(", ");
      const dayMap = lang === "ru" ? daysRu : daysUz;
      const workingDays = d.workingDays
        .split(",")
        .map((day) => dayMap[day.trim()] || day.trim())
        .join(", ");
      const hours = `${d.workingHoursStart} - ${d.workingHoursEnd}`;

      text += tl.doctorEntry(docName(d, lang), docSpec(d, lang), docDesc(d, lang), workingDays, hours) + "\n";
      text += `📋 ${tl.doctorServices} ${serviceNames}\n\n`;
    }

    await ctx.reply(text, { parse_mode: "HTML", ...backToMainMenu(lang) });
  } catch (error: any) {
    console.error("Error showing doctors:", error.message);
    const lang = getLang(ctx);
    await ctx.reply(t(lang).error, backToMainMenu(lang));
  }
}

export { docName, docSpec, docDesc };
