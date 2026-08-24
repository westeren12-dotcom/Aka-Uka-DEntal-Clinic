import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { config } from "../../utils/config";

export async function showLocation(ctx: Context) {
  const text = [
    `📍 <b>${config.clinic.name}</b>`,
    ``,
    `🏠 <b>Address:</b> ${config.clinic.address}`,
    `🕐 <b>Working Hours:</b> ${config.clinic.workingHours}`,
    `📞 <b>Phone:</b> ${config.clinic.phone}`,
    ``,
    `🗺 <a href="${config.clinic.googleMapsUrl}">Open in Google Maps</a>`,
  ].join("\n");

  await ctx.reply(text, {
    parse_mode: "HTML",
    ...keyboards.backToMainMenu(),
    link_preview_options: { is_disabled: true },
  });
}

export async function showContact(ctx: Context) {
  const text = [
    `📞 <b>Contact Us</b>`,
    ``,
    `📱 <b>Phone:</b> ${config.clinic.phone}`,
    `🏠 <b>Address:</b> ${config.clinic.address}`,
    `🕐 <b>Working Hours:</b> ${config.clinic.workingHours}`,
    ``,
    `Feel free to call us for any inquiries!`,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML", ...keyboards.backToMainMenu() });
}
