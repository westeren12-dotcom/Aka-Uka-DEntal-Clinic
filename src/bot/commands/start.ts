import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { patientService } from "../../services/patient.service";
import { config } from "../../utils/config";
import { t, languageKeyboard, Language } from "../languages";
import { getSession } from "../middlewares/session";

export async function startCommand(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  const session = getSession(ctx.chat!.id);

  // If no language selected yet, show language picker
  if (!session.lang) {
    const text =
      `🦷 Welcome to <b>${config.clinic.name}</b>!\n\n` +
      `Tilni tanlang / Выберите язык:\n` +
      `Choose your language:`;
    await ctx.reply(text, { parse_mode: "HTML", ...languageKeyboard() });
    return;
  }

  // Language already set — show main menu
  await showMainMenu(ctx, session.lang);
}

export async function showMainMenu(ctx: Context, lang: Language) {
  const user = ctx.from;
  if (!user) return;

  try {
    await patientService.findOrCreateByTelegram(
      user.id,
      user.first_name,
      user.last_name,
      user.username
    );
  } catch (err: any) {
    console.error("Error creating patient:", err.message);
  }

  const tl = t(lang);
  await ctx.reply(tl.welcome(config.clinic.name), {
    parse_mode: "HTML",
    ...keyboards.mainMenu(lang),
  });
}
