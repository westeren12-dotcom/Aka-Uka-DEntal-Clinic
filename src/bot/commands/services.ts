import { Context } from "telegraf";
import prisma from "../../utils/prisma";
import { config } from "../../utils/config";
import { keyboards, backToMainMenu } from "../keyboards";
import { t, Language } from "../languages";
import { getSession } from "../middlewares/session";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

export async function showServices(ctx: Context) {
  try {
    const lang = getLang(ctx);
    const tl = t(lang);

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    if (services.length === 0) {
      await ctx.reply("No services available.", backToMainMenu(lang));
      return;
    }

    let text = tl.servicesTitle + "\n\n";
    for (const s of services) {
      const price = `💰 ${Number(s.price).toLocaleString()} UZS`;
      text += tl.serviceEntry(s.name, s.description || "", price, s.duration) + "\n\n";
    }

    await ctx.reply(text, { parse_mode: "HTML", ...backToMainMenu(lang) });
  } catch (error: any) {
    console.error("Error showing services:", error.message);
    const lang = getLang(ctx);
    await ctx.reply(t(lang).error, backToMainMenu(lang));
  }
}

export async function showPrices(ctx: Context) {
  await showServices(ctx); // Same content, prices included
}
