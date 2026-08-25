import { Context } from "telegraf";
import prisma from "../../utils/prisma";
import { backToMainMenu } from "../keyboards";
import { t, Language } from "../languages";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

function svcName(s: any, _lang: Language): string {
  // Always show both languages
  if (s.nameRu) return `${s.name} / ${s.nameRu}`;
  return s.name;
}

function svcDesc(s: any, _lang: Language): string {
  // Always show both languages
  if (s.descriptionRu && s.description) return `${s.description}\n🌐 ${s.descriptionRu}`;
  if (s.description) return s.description;
  if (s.descriptionRu) return s.descriptionRu;
  return "";
}

export async function showServices(ctx: Context) {
  try {
    const lang = getLang(ctx);
    const tl = t(lang);

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    if (!services.length) {
      await ctx.reply("No services available.", backToMainMenu(lang));
      return;
    }

    let text = tl.servicesTitle + "\n\n";
    for (const s of services) {
      const price = `${Number(s.price).toLocaleString()} UZS`;
      text += tl.serviceEntry(svcName(s, lang), svcDesc(s, lang), price, s.duration) + "\n\n";
    }

    await ctx.reply(text, { parse_mode: "HTML", ...backToMainMenu(lang) });
  } catch (error: any) {
    console.error("Error showing services:", error.message);
    const lang = getLang(ctx);
    await ctx.reply(t(lang).error, backToMainMenu(lang));
  }
}

export async function showPrices(ctx: Context) {
  await showServices(ctx);
}

export { svcName, svcDesc };
