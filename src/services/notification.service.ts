import { config } from "../utils/config";
import prisma from "../utils/prisma";
import { appointmentService } from "./appointment.service";

export class NotificationService {
  private telegram: any = null;

  setBot(telegram: any) {
    this.telegram = telegram;
  }

  async sendMessage(telegramId: number, text: string, extra?: object) {
    try {
      if (this.telegram) {
        await this.telegram.sendMessage(telegramId, text, {
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
      `📅 <b>Date:</b> ${appointment.date.toLocaleDateString()}`,
      `⏰ <b>Time:</b> ${appointment.time}`,
      `👨‍⚕️ <b>Doctor:</b> ${appointment.doctor.name}`,
      `🦷 <b>Service:</b> ${appointment.service.name}`,
      `💰 <b>Price:</b> ${Number(appointment.service.price).toLocaleString()} UZS`,
      ``,
      `📍 ${config.clinic.name}`,
      ``,
      `Thank you for choosing us! 🦷`,
    ].join("\n");

    await this.sendMessage(Number(appointment.patient.telegramId), text);
  }

  // ====== REMINDERS: 2h, 1h, 30m, 10m ======

  async sendReminder(
    appointment: {
      id: string;
      patient: { telegramId: bigint; firstName: string | null };
      doctor: { name: string };
      service: { name: string };
      date: Date;
      time: string;
    },
    minutesBefore: number
  ) {
    const textParts: string[] = [];
    let emoji = "🔔";

    if (minutesBefore === 120) {
      emoji = "🔔";
      textParts.push(
        `🔔 <b>Eslatma / Напоминание</b>`,
        ``,
        `Uchrashingizga 2 soat qoldi.`,
        `До вашего приёма осталось 2 часа.`
      );
    } else if (minutesBefore === 60) {
      emoji = "🔔";
      textParts.push(
        `🔔 <b>Eslatma / Напоминание</b>`,
        ``,
        `Uchrashingizga 1 soat qoldi.`,
        `До вашего приёма остался 1 час.`
      );
    } else if (minutesBefore === 30) {
      emoji = "⏰";
      textParts.push(
        `⏰ <b>Eslatma / Напоминание</b>`,
        ``,
        `Uchrashingizga 30 daqiqa qoldi!`,
        `До вашего приёма осталось 30 минут!`
      );
    } else if (minutesBefore === 10) {
      emoji = "🚨";
      textParts.push(
        `🚨 <b>Ogohlantirish / Внимание!</b>`,
        ``,
        `Uchrashingizga atigi 10 daqiqa qoldi!`,
        `До вашего приёма всего 10 минут!`,
        ``,
        `Iltimos, tezroq yetib keling! / Пожалуйста, приходите скорее!`
      );
    }

    const text = [
      ...textParts,
      ``,
      `🕐 <b>${appointment.time}</b>`,
      `👨‍⚕️ ${appointment.doctor.name}`,
      `🦷 ${appointment.service.name}`,
      `📍 ${config.clinic.name}`,
    ].join("\n");

    const confirmCb = `confirm_remind_${appointment.id}`;
    const cancelCb = `cancel_remind_${appointment.id}`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Tasdiqlayman / Подтверждаю", callback_data: confirmCb },
          ],
          [
            { text: "❌ Bekor qilaman / Отменяю", callback_data: cancelCb },
          ],
        ],
      },
    };

    await this.sendMessage(Number(appointment.patient.telegramId), text, keyboard);
  }

  // ====== 10-MINUTE LATE CANCEL ======

  async cancelLateAppointments() {
    const now = new Date();

    // Find CONFIRMED/PENDING appointments where 10 minutes have passed since the scheduled time
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        reminder10mSent: true,
        reminder2hSent: true,
      },
      include: {
        patient: true,
        doctor: true,
        service: true,
      },
    });

    let cancelled = 0;

    for (const apt of appointments) {
      // Parse the appointment date + time
      const [hours, minutes] = apt.time.split(":").map(Number);
      const aptDateTime = new Date(apt.date);
      aptDateTime.setHours(hours, minutes, 0, 0);

      // Add 10 minutes grace period
      const graceEnd = new Date(aptDateTime.getTime() + 10 * 60 * 1000);

      // If current time is past the grace period, cancel the appointment
      if (now >= graceEnd) {
        try {
          await prisma.appointment.update({
            where: { id: apt.id },
            data: { status: "NO_SHOW" },
          });

          // Send late cancel notification in both languages
          const text = [
            `⚠️ <b>Uchrashuv bekor qilindi / Запись отменена!</b>`,
            ``,
            `Siz belgilangan vaqtdan 10 daqiqa kechdingiz.`,
            `Вы опоздали на 10 минут после назначенного времени.`,
            ``,
            `👨‍⚕️ ${apt.doctor.name}`,
            `🦷 ${apt.service.name}`,
            `📅 ${apt.date.toLocaleDateString()} 🕐 ${apt.time}`,
            ``,
            `Keyingi uchrashuv uchun qaytadan belgilang.`,
            `Пожалуйста, запишитесь заново.`,
          ].join("\n");

          await this.sendMessage(Number(apt.patient.telegramId), text, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "📅 Qaytadan belgilash / Записаться заново", callback_data: "book_appointment" }],
                [{ text: "🏠 Asosiy menyu / Главное меню", callback_data: "main_menu" }],
              ],
            },
          });

          cancelled++;
        } catch (error) {
          console.error(`Failed to cancel late appointment ${apt.id}:`, error);
        }
      }
    }

    return cancelled;
  }

  // ====== CHECK AND SEND ALL REMINDERS ======

  async checkAndSendReminders() {
    let reminders2h = 0;
    let reminders1h = 0;
    let reminders30m = 0;
    let reminders10m = 0;
    let lateCancelled = 0;

    // 2-hour reminders (120 minutes)
    const apt2h = await this.getAppointmentsForReminder(120);
    for (const apt of apt2h) {
      await this.sendReminder(apt, 120);
      await prisma.appointment.update({ where: { id: apt.id }, data: { reminder2hSent: true } });
      reminders2h++;
    }

    // 1-hour reminders (60 minutes)
    const apt1h = await this.getAppointmentsForReminder(60, "reminder2hSent");
    for (const apt of apt1h) {
      await this.sendReminder(apt, 60);
      await prisma.appointment.update({ where: { id: apt.id }, data: { reminder1hSent: true } });
      reminders1h++;
    }

    // 30-minute reminders
    const apt30m = await this.getAppointmentsForReminder(30, "reminder1hSent");
    for (const apt of apt30m) {
      await this.sendReminder(apt, 30);
      await prisma.appointment.update({ where: { id: apt.id }, data: { reminder30mSent: true } });
      reminders30m++;
    }

    // 10-minute reminders
    const apt10m = await this.getAppointmentsForReminder(10, "reminder30mSent");
    for (const apt of apt10m) {
      await this.sendReminder(apt, 10);
      await prisma.appointment.update({ where: { id: apt.id }, data: { reminder10mSent: true } });
      reminders10m++;
    }

    // Cancel late appointments (past 10 min grace period)
    lateCancelled = await this.cancelLateAppointments();

    return { reminders2h, reminders1h, reminders30m, reminders10m, lateCancelled };
  }

  // Get appointments that need reminders based on minutes before
  private async getAppointmentsForReminder(minutesBefore: number, afterField?: string) {
    const now = new Date();
    const target = new Date(now.getTime() + minutesBefore * 60 * 1000);

    // Look for appointments within a 15-minute window around the target time
    const windowStart = new Date(target.getTime() - 7 * 60 * 1000);
    const windowEnd = new Date(target.getTime() + 7 * 60 * 1000);

    // Get the target time as HH:MM
    const targetTime = `${String(target.getHours()).padStart(2, "0")}:${String(target.getMinutes()).padStart(2, "0")}`;

    const whereCondition: any = {
      status: { in: ["PENDING", "CONFIRMED"] },
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
      reminder2hSent: true, // Must have received 2h reminder first
    };

    // Only get appointments that haven't received this level of reminder yet
    if (afterField) {
      whereCondition[afterField] = true;
    } else {
      whereCondition.reminder2hSent = false;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereCondition,
      include: { patient: true, doctor: true, service: true },
    });

    // Filter by exact time match
    return appointments.filter((apt) => {
      const [h, m] = apt.time.split(":").map(Number);
      const aptMinutes = h * 60 + m;
      const targetMinutes = target.getHours() * 60 + target.getMinutes();
      return Math.abs(aptMinutes - targetMinutes) <= 7;
    });
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
}

export const notificationService = new NotificationService();
