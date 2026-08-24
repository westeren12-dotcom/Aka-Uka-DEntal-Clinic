import { Context } from "telegraf";
import { keyboards } from "../keyboards";
import { serviceCatalogService } from "../../services/service.service";
import { doctorService } from "../../services/doctor.service";
import { appointmentService } from "../../services/appointment.service";
import { patientService } from "../../services/patient.service";
import { notificationService } from "../../services/notification.service";
import { clearSession } from "../middlewares/session";

export async function startBooking(ctx: Context) {
  const session = (ctx as any).session || {};
  const services = await serviceCatalogService.findActive();

  if (!services.length) {
    await ctx.reply("No services available for booking.", keyboards.backToMainMenu());
    return;
  }

  session.step = "select_service";
  (ctx as any).session = session;

  const buttons = services.map((s) => [{ text: `🦷 ${s.name} — ${s.price.toString()} UZS`, callback_data: `svc_${s.id}` }]);
  buttons.push([{ text: "⬅️ Back", callback_data: "main_menu" }]);

  await ctx.reply("📅 <b>Book an Appointment</b>\n\nStep 1: Select a service:", {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectService(ctx: Context, serviceId: string) {
  const session = (ctx as any).session || {};
  session.serviceId = serviceId;
  session.step = "select_doctor";
  (ctx as any).session = session;

  const doctors = await doctorService.getDoctorsForService(serviceId);

  if (!doctors.length) {
    await ctx.reply("No doctors available for this service.", keyboards.backToMainMenu());
    return;
  }

  const buttons = doctors.map((d) => [
    { text: `👨‍⚕️ ${d.name} (${d.specialty})`, callback_data: `doc_${d.id}` },
  ]);
  buttons.push([{ text: "⬅️ Back", callback_data: "book_appointment" }]);

  await ctx.reply("📅 <b>Book an Appointment</b>\n\nStep 2: Select a doctor:", {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectDoctor(ctx: Context, doctorId: string) {
  const session = (ctx as any).session || {};
  session.doctorId = doctorId;
  session.step = "select_date";
  (ctx as any).session = session;

  const buttons: { text: string; callback_data: string }[][] = [];
  const now = new Date();

  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    const doctor = await doctorService.findById(doctorId);
    if (doctor && doctorService.isWorkingOnDay(doctor, d)) {
      const dateStr = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      buttons.push([{ text: `📅 ${displayDate}`, callback_data: `date_${dateStr}` }]);
    }
  }

  if (!buttons.length) {
    await ctx.reply("No available dates in the next 7 days. Please try again later.", keyboards.backToMainMenu());
    return;
  }

  buttons.push([{ text: "⬅️ Back", callback_data: "book_appointment" }]);

  await ctx.reply("📅 <b>Book an Appointment</b>\n\nStep 3: Select a date:", {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectDate(ctx: Context, dateStr: string) {
  const session = (ctx as any).session || {};
  session.date = dateStr;
  session.step = "select_time";
  (ctx as any).session = session;

  const date = new Date(dateStr);
  const slots = await appointmentService.getAvailableSlots(session.doctorId!, session.serviceId!, date);

  if (!slots.length) {
    await ctx.reply("No available time slots for this date.", keyboards.backToMainMenu());
    return;
  }

  const availableSlots = slots.filter((s) => s.available);
  if (!availableSlots.length) {
    await ctx.reply("All time slots are booked for this date. Please choose another date.", keyboards.backToMainMenu());
    return;
  }

  const buttons: { text: string; callback_data: string }[][] = [];
  for (let i = 0; i < availableSlots.length; i += 3) {
    const row = availableSlots.slice(i, i + 3).map((s) => ({
      text: `🕐 ${s.time}`,
      callback_data: `time_${s.time}`,
    }));
    buttons.push(row);
  }
  buttons.push([{ text: "⬅️ Back", callback_data: `doc_${session.doctorId}` }]);

  await ctx.reply(`📅 <b>Book an Appointment</b>\n\nStep 4: Select a time on ${dateStr}:`, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectTime(ctx: Context, time: string) {
  const session = (ctx as any).session || {};
  session.time = time;
  session.step = "enter_name";
  (ctx as any).session = session;

  await ctx.reply("📅 <b>Book an Appointment</b>\n\nStep 5: Enter your name:", {
    parse_mode: "HTML",
    ...keyboards.backButton("book_appointment"),
  });
}

export async function enterName(ctx: Context, name: string) {
  const session = (ctx as any).session || {};
  session.name = name;
  session.step = "enter_phone";
  (ctx as any).session = session;

  await ctx.reply("📅 <b>Book an Appointment</b>\n\nStep 6: Enter your phone number:", {
    parse_mode: "HTML",
    ...keyboards.backButton("book_appointment"),
  });
}

export async function enterPhone(ctx: Context, phone: string) {
  const session = (ctx as any).session || {};
  session.phone = phone;
  session.step = "confirm";
  (ctx as any).session = session;

  const service = await serviceCatalogService.findById(session.serviceId!);
  const doctor = await doctorService.findById(session.doctorId!);

  const summary = [
    `📋 <b>Appointment Summary</b>`,
    ``,
    `👤 <b>Patient:</b> ${session.name}`,
    `📞 <b>Phone:</b> ${session.phone}`,
    `🦷 <b>Service:</b> ${service?.name}`,
    `💰 <b>Price:</b> ${service?.price.toString()} UZS`,
    `👨‍⚕️ <b>Doctor:</b> ${doctor?.name}`,
    `📅 <b>Date:</b> ${session.date}`,
    `🕐 <b>Time:</b> ${session.time}`,
    ``,
    `Please confirm your appointment:`,
  ].join("\n");

  try {
    const patient = await patientService.findOrCreateByTelegram(
      ctx.from!.id,
      ctx.from!.first_name,
      ctx.from!.last_name,
      ctx.from!.username
    );

    await patientService.updatePhone(patient.id, phone);

    const appointment = await appointmentService.create({
      patientId: patient.id,
      doctorId: session.doctorId!,
      serviceId: session.serviceId!,
      date: new Date(session.date!),
      time: session.time!,
      notes: `Patient: ${session.name}, Phone: ${session.phone}`,
    });

    const confirmButtons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `confirm_appt_${appointment.id}` },
            { text: "🔄 Change", callback_data: "book_appointment" },
          ],
          [{ text: "❌ Cancel", callback_data: `cancel_appt_${appointment.id}` }],
        ],
      },
    };

    await ctx.reply(summary, { parse_mode: "HTML", ...confirmButtons });
  } catch (error: any) {
    await ctx.reply(
      `❌ ${error.message || "Failed to create appointment. Please try again."}`,
      keyboards.backToMainMenu()
    );
    clearSession(ctx.chat!.id);
  }
}

export async function confirmAppointment(ctx: Context, appointmentId: string) {
  try {
    const appointment = await appointmentService.confirm(appointmentId);
    if (!appointment) {
      await ctx.reply("❌ Appointment not found.", keyboards.backToMainMenu());
      return;
    }

    await notificationService.sendAppointmentConfirmation(appointment as any);

    const text = [
      `✅ <b>Appointment Confirmed!</b>`,
      ``,
      `Thank you, ${ctx.from?.first_name || "Patient"}!`,
      `Your appointment has been confirmed.`,
      ``,
      `📅 ${appointment.date.toLocaleDateString()}`,
      `🕐 ${appointment.time}`,
      `👨‍⚕️ ${appointment.doctor.name}`,
      `🦷 ${appointment.service.name}`,
    ].join("\n");

    await ctx.reply(text, { parse_mode: "HTML", ...keyboards.mainMenu() });
  } catch (error) {
    await ctx.reply("❌ Failed to confirm appointment.", keyboards.backToMainMenu());
  }

  clearSession(ctx.chat!.id);
}

export async function cancelAppointment(ctx: Context, appointmentId: string) {
  try {
    await appointmentService.cancel(appointmentId);
    await ctx.reply("❌ Appointment has been cancelled.", keyboards.mainMenu());
  } catch (error) {
    await ctx.reply("❌ Failed to cancel appointment.", keyboards.backToMainMenu());
  }

  clearSession(ctx.chat!.id);
}
