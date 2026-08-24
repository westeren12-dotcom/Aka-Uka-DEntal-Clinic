import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { settingService } from "../../services/setting.service";
import { serviceCatalogService } from "../../services/service.service";
import { doctorService } from "../../services/doctor.service";
import { config } from "../../utils/config";
import axios from "axios";

export async function showFaq(ctx: Context) {
  const faqs = await settingService.getActiveFaqs();

  if (!faqs.length) {
    await ctx.reply("No FAQ available at the moment. Please contact us directly.", keyboards.backToMainMenu());
    return;
  }

  const lines = faqs.map((f, i) => `${i + 1}. ❓ <b>${f.question}</b>\n   💡 ${f.answer}`);
  const text = [`❓ <b>Frequently Asked Questions</b>`, ``, ...lines].join("\n");

  await ctx.reply(text, {
    parse_mode: "HTML",
    ...keyboards.inlineKeyboard([
      [{ text: "🤖 Ask AI Receptionist", callback_data: "ai_receptionist" }],
      [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
    ]),
  });
}

export async function aiReceptionist(ctx: Context) {
  await ctx.reply(
    "🤖 <b>AI Receptionist</b>\n\nPlease type your question about our clinic, services, doctors, or availability.",
    { parse_mode: "HTML", ...keyboards.backToMainMenu() }
  );

  const session = (ctx as any).session || {};
  session.step = "ai_question";
  (ctx as any).session = session;
}

export async function handleAiQuestion(ctx: Context, question: string) {
  const [services, doctors, faqs] = await Promise.all([
    serviceCatalogService.findActive(),
    doctorService.findActive(),
    settingService.getActiveFaqs(),
  ]);

  const clinicContext = [
    `Clinic: ${config.clinic.name}`,
    `Address: ${config.clinic.address}`,
    `Phone: ${config.clinic.phone}`,
    `Working Hours: ${config.clinic.workingHours}`,
    ``,
    `Services: ${services.map((s) => `${s.name} - ${s.price.toString()} UZS, ${s.duration}min`).join("; ")}`,
    ``,
    `Doctors: ${doctors.map((d) => `${d.name} (${d.specialty}), works: ${d.workingDays}, hours: ${d.workingHoursStart}-${d.workingHoursEnd}`).join("; ")}`,
    ``,
    `FAQs: ${faqs.map((f) => `Q: ${f.question} A: ${f.answer}`).join("; ")}`,
  ].join("\n");

  if (config.aiApiKey) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a friendly dental clinic receptionist AI. Answer patient questions about the clinic using the provided information. Never diagnose medical conditions. Always recommend consulting a doctor for medical advice. Be concise and helpful. Guide patients toward booking appointments.`,
            },
            { role: "system", content: `Clinic Information:\n${clinicContext}` },
            { role: "user", content: question },
          ],
          max_tokens: 500,
        },
        { headers: { Authorization: `Bearer ${config.aiApiKey}`, "Content-Type": "application/json" } }
      );

      const answer = response.data.choices[0]?.message?.content || "I'm sorry, I couldn't understand your question.";
      await ctx.reply(`🤖 ${answer}`, {
        parse_mode: "HTML",
        ...keyboards.inlineKeyboard([
          [{ text: "📅 Book Appointment", callback_data: "book_appointment" }],
          [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
        ]),
      });
      return;
    } catch (error) {
      console.error("AI API error:", error);
    }
  }

  // Fallback: keyword-based responses
  const lower = question.toLowerCase();
  let answer = "";

  if (lower.includes("price") || lower.includes("cost") || lower.includes("narx")) {
    const priceLines = services.map((s) => `• ${s.name}: ${s.price.toString()} UZS`);
    answer = `💰 <b>Our Prices:</b>\n${priceLines.join("\n")}`;
  } else if (lower.includes("doctor") || lower.includes("doktor")) {
    const docLines = doctors.map((d) => `• ${d.name} — ${d.specialty}`);
    answer = `👨‍⚕️ <b>Our Doctors:</b>\n${docLines.join("\n")}`;
  } else if (lower.includes("hour") || lower.includes("time") || lower.includes("open") || lower.includes("work")) {
    answer = `🕐 <b>Working Hours:</b> ${config.clinic.workingHours}`;
  } else if (lower.includes("address") || lower.includes("location") || lower.includes("where")) {
    answer = `📍 <b>Address:</b> ${config.clinic.address}\n🗺 ${config.clinic.googleMapsUrl}`;
  } else if (lower.includes("service") || lower.includes("treatment")) {
    const svcLines = services.map((s) => `• ${s.name}: ${s.description || "No description"} (${s.duration}min)`);
    answer = `🦷 <b>Our Services:</b>\n${svcLines.join("\n")}`;
  } else if (lower.includes("appointment") || lower.includes("book") || lower.includes("slot") || lower.includes("available")) {
    answer = `📅 To book an appointment, please tap the button below!\n\n📞 Or call us at: ${config.clinic.phone}`;
  } else if (lower.includes("cleaning") || lower.includes("whitening") || lower.includes("implant") || lower.includes("braces")) {
    const match = services.find((s) => lower.includes(s.name.toLowerCase()));
    if (match) {
      answer = `🦷 <b>${match.name}</b>\n${match.description || ""}\n💰 Price: ${match.price.toString()} UZS\n⏱ Duration: ${match.duration} minutes\n\nWould you like to book?`;
    } else {
      answer = `I can help you with information about our services. Could you be more specific?`;
    }
  } else {
    answer = `I'd be happy to help! I can answer questions about:\n\n• Our services and prices\n• Our doctors\n• Working hours and location\n• Appointment booking\n\nPlease ask me anything specific, or use the menu options below!`;
  }

  await ctx.reply(`🤖 ${answer}`, {
    parse_mode: "HTML",
    ...keyboards.inlineKeyboard([
      [{ text: "📅 Book Appointment", callback_data: "book_appointment" }],
      [{ text: "🏠 Main Menu", callback_data: "main_menu" }],
    ]),
  });
}
