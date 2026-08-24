import { Context } from "telegraf";
import prisma from "../../utils/prisma";
import { config } from "../../utils/config";
import { backToMainMenu } from "../keyboards";
import { t, Language } from "../languages";
import { getSession } from "../middlewares/session";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

export async function showFaq(ctx: Context) {
  try {
    const lang = getLang(ctx);
    const tl = t(lang);

    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    if (faqs.length === 0) {
      await ctx.reply("No FAQ available.", backToMainMenu(lang));
      return;
    }

    let text = tl.faqTitle + "\n\n";
    for (const faq of faqs) {
      text += `❓ <b>${faq.question}</b>\n💬 ${faq.answer}\n\n`;
    }

    // Add AI receptionist button
    text += `\n🤖 ${tl.askQuestion}`;

    await ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: tl.btnAskAI, callback_data: "ai_receptionist" }],
          [{ text: tl.btnBackToMenu, callback_data: "main_menu" }],
        ],
      },
    });
  } catch (error: any) {
    console.error("Error showing FAQ:", error.message);
    const lang = getLang(ctx);
    await ctx.reply(t(lang).error, backToMainMenu(lang));
  }
}

export async function aiReceptionist(ctx: Context) {
  const lang = getLang(ctx);
  const tl = t(lang);

  const session = (ctx as any).session || {};
  session.step = "ai_question";
  (ctx as any).session = session;

  await ctx.reply(tl.askQuestion, backToMainMenu(lang));
}

export async function handleAiQuestion(ctx: Context, question: string) {
  try {
    const lang = getLang(ctx);
    const tl = t(lang);
    const questionLower = question.toLowerCase();

    // Check for common keywords
    if (questionLower.match(/worked?|time|schedule|working|open|closed|soat|ish/i)) {
      const text = `🕐 ${lang === "uz" ? "Ish vaqtimiz" : "Часы работы"}: ${config.clinic.workingHours}`;
      await ctx.reply(text, backToMainMenu(lang));
      return;
    }

    if (questionLower.match(/address|location|manzil|addres|where|qayer|地址/i)) {
      const text =
        `📍 ${lang === "uz" ? "Manzilimiz" : "Наш адрес"}: ${config.clinic.address}\n\n` +
        `🗺 [${lang === "uz" ? "Xaritada ko'rish" : "Открыть на карте"}](${config.clinic.googleMapsUrl})`;
      await ctx.reply(text, { parse_mode: "HTML", ...backToMainMenu(lang) });
      return;
    }

    if (questionLower.match(/phone|telefon|contact|call|qo'ng|电话/)) {
      const text = `📞 ${lang === "uz" ? "Telefon" : "Телефон"}: ${config.clinic.phone}`;
      await ctx.reply(text, backToMainMenu(lang));
      return;
    }

    if (questionLower.match(/price|narx|cost|necha|qancha|价格|how much/)) {
      const services = await prisma.service.findMany({ where: { isActive: true } });
      let text = lang === "uz" ? "💰 Narxlar:\n\n" : "💰 Цены:\n\n";
      for (const s of services) {
        text += `${s.name}: ${Number(s.price).toLocaleString()} UZS\n`;
      }
      await ctx.reply(text, backToMainMenu(lang));
      return;
    }

    if (questionLower.match(/book|appointment|запис|repair|uiborish|belgile/i)) {
      const text =
        lang === "uz"
          ? "📅 Uchrashuv belgilash uchun '📅 Uchrashuv belgilash' tugmasini bosing."
          : "📅 Для записи нажмите кнопку '📅 Записаться на приём'.";
      await ctx.reply(text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: tl.btnBookAppointment, callback_data: "book_appointment" }],
            [{ text: tl.btnBackToMenu, callback_data: "main_menu" }],
          ],
        },
      });
      return;
    }

    if (questionLower.match(/available|free|bo'sh|mavjud/i)) {
      const text =
        lang === "uz"
          ? "📅 Bo'sh vaqtlarni ko'rish uchun uchrashuv belgilang."
          : "📅 Для просмотра свободных мест запишитесь на приём.";
      await ctx.reply(text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: tl.btnBookAppointment, callback_data: "book_appointment" }],
            [{ text: tl.btnBackToMenu, callback_data: "main_menu" }],
          ],
        },
      });
      return;
    }

    // Default response
    const defaultText =
      lang === "uz"
        ? "🤖 Kechirasiz, savolingizga aniq javob bera olmayman.\n\nSiz quyidagilarni sinab ko'rishingiz mumkin:\n• Xizmatlar va narxlar\n• Ish vaqti\n• Manzil va telefon\n• Uchrashuv belgilash"
        : "🤖 Извините, я не могу дать точный ответ.\n\nПопробуйте:\n• Услуги и цены\n• Часы работы\n• Адрес и телефон\n• Запись на приём";

    await ctx.reply(defaultText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: tl.btnServices, callback_data: "show_services" }],
          [{ text: tl.btnPrices, callback_data: "show_prices" }],
          [{ text: tl.btnBookAppointment, callback_data: "book_appointment" }],
          [{ text: tl.btnBackToMenu, callback_data: "main_menu" }],
        ],
      },
    });
  } catch (error: any) {
    console.error("Error handling AI question:", error.message);
    const lang = getLang(ctx);
    await ctx.reply(t(lang).error, backToMainMenu(lang));
  }
}
