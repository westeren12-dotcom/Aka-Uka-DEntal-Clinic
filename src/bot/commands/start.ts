import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { patientService } from "../../services/patient.service";
import { config } from "../../utils/config";

export async function startCommand(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  await patientService.findOrCreateByTelegram(
    user.id,
    user.first_name,
    user.last_name,
    user.username
  );

  const text = [
    `🦷 Welcome to <b>${config.clinic.name}</b>!`,
    ``,
    `Your digital dental receptionist. 👋`,
    `How can we help you today?`,
  ].join("\n");

  await ctx.reply(text, { parse_mode: "HTML", ...keyboards.mainMenu() });
}
