import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { serviceCatalogService } from "../../services/service.service";

export async function showServices(ctx: Context) {
  const services = await serviceCatalogService.findActive();

  if (!services.length) {
    await ctx.reply("No services available at the moment.", keyboards.backToMainMenu());
    return;
  }

  const lines = services.map(
    (s, i) =>
      `${i + 1}. 🦷 <b>${s.name}</b>\n   ${s.description || "No description"}\n   ⏱ ${s.duration} min`
  );

  const text = [`🦷 <b>Our Services</b>`, ``, ...lines].join("\n");

  await ctx.reply(text, { parse_mode: "HTML", ...keyboards.backToMainMenu() });
}

export async function showPrices(ctx: Context) {
  const services = await serviceCatalogService.findActive();

  if (!services.length) {
    await ctx.reply("No pricing information available.", keyboards.backToMainMenu());
    return;
  }

  const lines = services.map(
    (s, i) => `${i + 1}. 🦷 <b>${s.name}</b> — ${s.price.toString()} UZS — ⏱ ${s.duration} min`
  );

  const text = [`💰 <b>Our Prices</b>`, ``, ...lines, ``, `All prices are in Uzbekistani Sum (UZS)`].join("\n");

  await ctx.reply(text, { parse_mode: "HTML", ...keyboards.backToMainMenu() });
}
