import { Context } from "telegraf";
import { config } from "../utils/config";
import prisma from "../utils/prisma";
import { appointmentService } from "./appointment.service";

export class NotificationService {
  private bot: Context["telegram"] | null = null;

  setBot(telegram: Context["telegram"]) {
    this.bot = telegram;
  }

  async sendMessage(telegramId: number, text: string, extra?: object) {
    try {
      if (this.bot) {
        await this.bot.sendMessage(telegramId, text, {
          parse_mode: "HTML",
          ...extra,
        });
      }
    } catch (error) {
      console.error(`Failed to send message to ${telegramId}:`, error);
    }
  }

  async createNotification(patientId: string, type: string, title: string, message: string) {
    return prisma.notification.create({
      data: { patientId, type, title, message },
    });
  }

  async sendAppointmentConfirmation(appointment: {
    id: string;
    patient: { telegramId: bigint; firstName: string | null };
    doctor: { name: string };
    service: { name: string; price: { toString(): string } };
    date: Date;
    time: string;
  }) {
    const text = [
      `✅ <b>Appointment Confirmed!</b>`,
      ``,
      `📅 <b>Date:</b> ${appointment.date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      `⏰ <b>Time:</b> ${appointment.time}`,
      `👨‍⚕️ <b>Doctor:</b> ${appointment.doctor.name}`,
      `🦷 <b>Service:</b> ${appointment.service.name}`,
      `💰 <b>Price:</b> ${appointment.service.price.toString()} UZS`,
      ``,
      `📍 ${config.clinic.name}`,
      ``,
      `Thank you for choosing us! 🦷`,
    ].join("\n");

    await this.sendMessage(Number(appointment.patient.telegramId), text);
  }

  async sendReminder(appointment: {
    id: string;
    patient: { telegramId: bigint; firstName: string | null };
    doctor: { name: string };
    service: { name: string };
    date: Date;
    time: string;
  }, hoursBefore: number) {
    const timeLabel = hoursBefore === 24 ? "tomorrow" : "in 2 hours";

    const text = [
      `🔔 <b>Appointment Reminder</b>`,
      ``,
      `You have an appointment ${timeLabel} at <b>${appointment.time}</b>.`,
      ``,
      `👨‍⚕️ <b>Doctor:</b> ${appointment.doctor.name}`,
      `🦷 <b>Service:</b> ${appointment.service.name}`,
      `📍 <b>Clinic:</b> ${config.clinic.name}`,
    ].join("\n");

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `confirm_${appointment.id}` },
            { text: "🔄 Reschedule", callback_data: `reschedule_${appointment.id}` },
            { text: "❌ Cancel", callback_data: `cancel_${appointment.id}` },
          ],
        ],
      },
    };

    await this.sendMessage(Number(appointment.patient.telegramId), text, keyboard);
  }

  async sendBroadcast(message: string, adminTelegramId?: string) {
    const telegramIds = await prisma.patient.findMany({ select: { telegramId: true } });
    let sent = 0;
    let failed = 0;

    for (const patient of telegramIds) {
      try {
        await this.sendMessage(Number(patient.telegramId), message);
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed, total: telegramIds.length };
  }

  async checkAndSendReminders() {
    // 24h reminders
    const reminders24h = await appointmentService.getRemindersNeeded(24);
    for (const appointment of reminders24h) {
      await this.sendReminder(appointment, 24);
      await appointmentService.markReminderSent(appointment.id, "24h");
    }

    // 2h reminders
    const reminders2h = await appointmentService.getRemindersNeeded(2);
    for (const appointment of reminders2h) {
      await this.sendReminder(appointment, 2);
      await appointmentService.markReminderSent(appointment.id, "2h");
    }

    return { reminders24h: reminders24h.length, reminders2h: reminders2h.length };
  }
}

export const notificationService = new NotificationService();
