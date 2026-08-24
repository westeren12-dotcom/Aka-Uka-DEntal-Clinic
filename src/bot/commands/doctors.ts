import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { doctorService } from "../../services/doctor.service";

export async function showDoctors(ctx: Context) {
  const doctors = await doctorService.findActive();

  if (!doctors.length) {
    await ctx.reply("No doctors available at the moment.", keyboards.backToMainMenu());
    return;
  }

  const lines = doctors.map(
    (d, i) => {
      const services = d.services.map((ds) => ds.service.name).join(", ");
      return [
        `${i + 1}. 👨‍⚕️ <b>${d.name}</b>`,
        `   📋 ${d.specialty}`,
        d.description ? `   📝 ${d.description}` : null,
        `   📅 ${d.workingDays}`,
        `   🕐 ${d.workingHoursStart} - ${d.workingHoursEnd}`,
        services ? `   🦷 ${services}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    }
  );

  const text = [`👨‍⚕️ <b>Our Doctors</b>`, ``, ...lines].join("\n");

  await ctx.reply(text, { parse_mode: "HTML", ...keyboards.backToMainMenu() });
}
