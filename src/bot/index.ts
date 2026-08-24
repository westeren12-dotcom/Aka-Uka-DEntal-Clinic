import { Telegraf } from "telegraf";
import { config } from "../utils/config";
import { sessionMiddleware, clearSession } from "./middlewares/session";
import { notificationService } from "../services/notification.service";

// Commands
import { startCommand } from "./commands/start";
import { showServices, showPrices } from "./commands/services";
import { showDoctors } from "./commands/doctors";
import {
  startBooking,
  selectService,
  selectDoctor,
  selectDate,
  selectTime,
  enterName,
  enterPhone,
  confirmAppointment,
  cancelAppointment,
} from "./commands/booking";
import { myAppointments } from "./commands/my-appointments";
import { showLocation, showContact } from "./commands/location";
import { showFaq, aiReceptionist, handleAiQuestion } from "./commands/faq";
import {
  todayCommand,
  earningsCommand,
  appointmentsCommand,
  patientsCommand,
  doctorsCommand,
  servicesCommand,
  statsCommand,
  broadcastCommand,
  handleBroadcastMessage,
  broadcastSend,
  broadcastCancel,
} from "./commands/admin";

const bot = new Telegraf(config.botToken);

// Set bot commands for menu
bot.telegram.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help" },
]);

// Middlewares
bot.use(sessionMiddleware);

// Register notification service with bot
notificationService.setBot(bot.telegram);

// Reminder cron job
async function startReminderJob() {
  try {
    const result = await notificationService.checkAndSendReminders();
    if (result.reminders24h > 0 || result.reminders2h > 0) {
      console.log(`Sent reminders: ${result.reminders24h} (24h), ${result.reminders2h} (2h)`);
    }
  } catch (error) {
    console.error("Reminder job error:", error);
  }
}

// Run reminders every 15 minutes
setInterval(startReminderJob, 15 * 60 * 1000);

// ====== COMMAND HANDLERS ======

bot.start(startCommand);

bot.command("help", (ctx) => {
  ctx.reply(
    `🦷 <b>${config.clinic.name}</b>\n\n` +
      `Use the menu buttons to navigate.\n` +
      `/start — Main menu`,
    { parse_mode: "HTML" }
  );
});

// Admin commands
bot.command("today", todayCommand);
bot.command("earnings", earningsCommand);
bot.command("appointments", appointmentsCommand);
bot.command("patients", patientsCommand);
bot.command("doctors", doctorsCommand);
bot.command("services", servicesCommand);
bot.command("stats", statsCommand);
bot.command("broadcast", broadcastCommand);

// ====== CALLBACK HANDLERS ======

// Main menu
bot.action("main_menu", async (ctx) => {
  await ctx.answerCbQuery();
  const text = `🦷 Welcome to <b>${config.clinic.name}</b>!\n\nYour digital dental receptionist. 👋\nHow can we help you today?`;
  await ctx.editMessageText(text, { parse_mode: "HTML", ...mainMenuKeyboard() });
});

function mainMenuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📅 Book Appointment", callback_data: "book_appointment" }],
        [
          { text: "🦷 Services", callback_data: "show_services" },
          { text: "💰 Prices", callback_data: "show_prices" },
        ],
        [{ text: "👨‍⚕️ Doctors", callback_data: "show_doctors" }],
        [{ text: "📋 My Appointments", callback_data: "my_appointments" }],
        [
          { text: "📍 Location", callback_data: "show_location" },
          { text: "📞 Contact Us", callback_data: "show_contact" },
        ],
        [{ text: "❓ FAQ", callback_data: "show_faq" }],
      ],
    },
  };
}

// Services & Prices
bot.action("show_services", async (ctx) => {
  await ctx.answerCbQuery();
  await showServices(ctx);
});

bot.action("show_prices", async (ctx) => {
  await ctx.answerCbQuery();
  await showPrices(ctx);
});

// Doctors
bot.action("show_doctors", async (ctx) => {
  await ctx.answerCbQuery();
  await showDoctors(ctx);
});

// Location & Contact
bot.action("show_location", async (ctx) => {
  await ctx.answerCbQuery();
  await showLocation(ctx);
});

bot.action("show_contact", async (ctx) => {
  await ctx.answerCbQuery();
  await showContact(ctx);
});

// FAQ
bot.action("show_faq", async (ctx) => {
  await ctx.answerCbQuery();
  await showFaq(ctx);
});

bot.action("ai_receptionist", async (ctx) => {
  await ctx.answerCbQuery();
  await aiReceptionist(ctx);
});

// My Appointments
bot.action("my_appointments", async (ctx) => {
  await ctx.answerCbQuery();
  await myAppointments(ctx);
});

// ====== BOOKING FLOW ======

bot.action("book_appointment", async (ctx) => {
  await ctx.answerCbQuery();
  clearSession(ctx.chat!.id);
  await startBooking(ctx);
});

// Service selection
bot.action(/^svc_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const serviceId = ctx.match[1];
  await selectService(ctx, serviceId);
});

// Doctor selection
bot.action(/^doc_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const doctorId = ctx.match[1];
  await selectDoctor(ctx, doctorId);
});

// Date selection
bot.action(/^date_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const dateStr = ctx.match[1];
  await selectDate(ctx, dateStr);
});

// Time selection
bot.action(/^time_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const time = ctx.match[1];
  await selectTime(ctx, time);
});

// Confirm appointment
bot.action(/^confirm_appt_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const appointmentId = ctx.match[1];
  await confirmAppointment(ctx, appointmentId);
});

// Cancel appointment
bot.action(/^cancel_appt_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const appointmentId = ctx.match[1];
  await cancelAppointment(ctx, appointmentId);
});

// Appointment management from My Appointments
bot.action(/^appt_confirm_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  await confirmAppointment(ctx, ctx.match[1]);
});

bot.action(/^appt_cancel_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  await cancelAppointment(ctx, ctx.match[1]);
});

bot.action(/^appt_reschedule_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const appointmentId = ctx.match[1];
  const { appointmentService } = await import("../services/appointment.service");
  const appointment = await appointmentService.findById(appointmentId);
  if (!appointment) {
    await ctx.reply("❌ Appointment not found.");
    return;
  }
  // Start booking flow for reschedule
  clearSession(ctx.chat!.id);
  await startBooking(ctx);
});

// Reminder callbacks
bot.action(/^confirm_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const appointmentId = ctx.match[1];
  await confirmAppointment(ctx, appointmentId);
});

bot.action(/^reschedule_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  clearSession(ctx.chat!.id);
  await startBooking(ctx);
});

bot.action(/^cancel_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const appointmentId = ctx.match[1];
  await cancelAppointment(ctx, appointmentId);
});

// Broadcast callbacks
bot.action("broadcast_send", async (ctx) => {
  await ctx.answerCbQuery();
  await broadcastSend(ctx);
});

bot.action("broadcast_cancel", async (ctx) => {
  await ctx.answerCbQuery();
  await broadcastCancel(ctx);
});

bot.action("no_action", async (ctx) => {
  await ctx.answerCbQuery("OK");
});

// ====== TEXT MESSAGE HANDLER ======

bot.on("text", async (ctx) => {
  const session = (ctx as any).session || {};
  const text = ctx.message.text;

  // Broadcast flow
  const broadcastHandled = await handleBroadcastMessage(ctx, text);
  if (broadcastHandled) return;

  // Booking flow steps
  if (session.step === "enter_name" && text !== "⬅️ Back") {
    await enterName(ctx, text);
    return;
  }

  if (session.step === "enter_phone" && text !== "⬅️ Back") {
    await enterPhone(ctx, text);
    return;
  }

  // AI Receptionist
  if (session.step === "ai_question" && text !== "🏠 Main Menu") {
    session.step = undefined;
    (ctx as any).session = session;
    await handleAiQuestion(ctx, text);
    return;
  }

  // Default: show main menu
  const welcomeText = `🦷 Welcome to <b>${config.clinic.name}</b>!\n\nYour digital dental receptionist. 👋\nHow can we help you today?`;
  await ctx.reply(welcomeText, { parse_mode: "HTML", ...mainMenuKeyboard() });
});

// ====== ERROR HANDLING ======

bot.catch((err: any, ctx) => {
  console.error(`Error handling ${ctx.updateType}:`, err.message || err);
  if (err.stack) console.error(err.stack);
  const errorMsg = err.message?.includes("database") || err.message?.includes("table")
    ? "❌ Database is not ready yet. Please wait a moment and try again."
    : "❌ An unexpected error occurred. Please try again.";
  ctx.reply(errorMsg).catch(() => {});
});

// ====== START BOT ======

export async function startBot() {
  console.log("🤖 Starting Telegram bot...");
  await bot.launch();
  console.log("✅ Bot is running!");

  // Run initial reminder check
  startReminderJob();
}

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export { bot };
