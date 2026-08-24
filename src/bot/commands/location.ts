import { Context } from "telegraf";
import { config } from "../../utils/config";
import { backToMainMenu } from "../keyboards";
import { t, Language } from "../languages";
import { getSession } from "../middlewares/session";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

export async function showLocation(ctx: Context) {
  const lang = getLang(ctx);
  const tl = t(lang);

  const text =
    `${tl.locationTitle}\n\n` +
    `📍 ${tl.address}: ${config.clinic.address}\n\n` +
    `🕐 ${tl.workingHours}: ${config.clinic.workingHours}\n\n` +
    `🗺 [${tl.openMaps}](${config.clinic.googleMapsUrl})`;

  await ctx.reply(text, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...backToMainMenu(lang),
  } as any);
}

export async function showContact(ctx: Context) {
  const lang = getLang(ctx);
  const tl = t(lang);

  const text =
    `${tl.contactTitle}\n\n` +
    `📞 ${tl.phone}: ${config.clinic.phone}\n` +
    `📍 ${tl.address}: ${config.clinic.address}\n` +
    `🕐 ${tl.workingHours}: ${config.clinic.workingHours}`;

  await ctx.reply(text, {
    parse_mode: "HTML",
    ...backToMainMenu(lang),
  });
}
