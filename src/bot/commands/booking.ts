import { Context } from "telegraf";
import { serviceCatalogService } from "../../services/service.service";
import { doctorService } from "../../services/doctor.service";
import { appointmentService } from "../../services/appointment.service";
import { patientService } from "../../services/patient.service";
import { notificationService } from "../../services/notification.service";
import { clearSession } from "../middlewares/session";
import { t, Language } from "../languages";

function getLang(ctx: any): Language {
  return ctx.session?.lang || "uz";
}

function bkButtons(lang: Language) {
  const tl = t(lang);
  return {
    back: (cb: string) => ({
      reply_markup: { inline_keyboard: [[{ text: tl.btnBack, callback_data: cb }]] },
    }),
    mainMenu: () => ({
      reply_markup: { inline_keyboard: [[{ text: tl.btnBackToMenu, callback_data: "main_menu" }]] },
    }),
  };
}

export async function startBooking(ctx: Context) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const kb = bkButtons(lang);
  const session = (ctx as any).session || {};

  const services = await serviceCatalogService.findActive();
  if (!services.length) {
    await ctx.reply("No services available.", kb.mainMenu());
    return;
  }

  session.step = "select_service";
  (ctx as any).session = session;

  const buttons = services.map((s) => [
    { text: `🦷 ${s.nameRu ? s.name + ' / ' + s.nameRu : s.name} — ${Number(s.price).toLocaleString()} UZS`, callback_data: `svc_${s.id}` },
  ]);
  buttons.push([{ text: tl.btnBack, callback_data: "main_menu" }]);

  await ctx.reply(`${tl.btnBookAppointment}\n\n${tl.selectService}`, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectService(ctx: Context, serviceId: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const kb = bkButtons(lang);
  const session = (ctx as any).session || {};

  session.serviceId = serviceId;
  session.step = "select_doctor";
  (ctx as any).session = session;

  const doctors = await doctorService.getDoctorsForService(serviceId);
  if (!doctors.length) {
    await ctx.reply("No doctors available for this service.", kb.mainMenu());
    return;
  }

  const buttons = doctors.map((d) => [
    { text: `👨‍⚕️ ${d.nameRu ? d.name + ' / ' + d.nameRu : d.name} (${d.specialtyRu ? d.specialty + ' / ' + d.specialtyRu : d.specialty})`, callback_data: `doc_${d.id}` },
  ]);
  buttons.push([{ text: tl.btnBack, callback_data: "book_appointment" }]);

  await ctx.reply(`${tl.btnBookAppointment}\n\n${tl.selectDoctor}`, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectDoctor(ctx: Context, doctorId: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const kb = bkButtons(lang);
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
      const displayDate = d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      buttons.push([{ text: `📅 ${displayDate}`, callback_data: `date_${dateStr}` }]);
    }
  }

  if (!buttons.length) {
    await ctx.reply(tl.noSlots, kb.mainMenu());
    return;
  }

  buttons.push([{ text: tl.btnBack, callback_data: "book_appointment" }]);

  await ctx.reply(`${tl.btnBookAppointment}\n\n${tl.selectDate}`, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectDate(ctx: Context, dateStr: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const kb = bkButtons(lang);
  const session = (ctx as any).session || {};

  session.date = dateStr;
  session.step = "select_time";
  (ctx as any).session = session;

  const date = new Date(dateStr);
  const slots = await appointmentService.getAvailableSlots(session.doctorId!, session.serviceId!, date);

  if (!slots.length) {
    await ctx.reply(tl.noSlots, kb.mainMenu());
    return;
  }

  const availableSlots = slots.filter((s) => s.available);
  if (!availableSlots.length) {
    await ctx.reply(tl.noSlots, kb.mainMenu());
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
  buttons.push([{ text: tl.btnBack, callback_data: `doc_${session.doctorId}` }]);

  await ctx.reply(`${tl.btnBookAppointment}\n\n${tl.selectTime} ${dateStr}`, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function selectTime(ctx: Context, time: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const kb = bkButtons(lang);
  const session = (ctx as any).session || {};

  session.time = time;
  session.step = "enter_name";
  (ctx as any).session = session;

  await ctx.reply(`${tl.btnBookAppointment}\n\n${tl.enterName}`, {
    parse_mode: "HTML",
    ...kb.back("book_appointment"),
  });
}

export async function enterName(ctx: Context, name: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const kb = bkButtons(lang);
  const session = (ctx as any).session || {};

  session.name = name;
  session.step = "enter_phone";
  (ctx as any).session = session;

  await ctx.reply(`${tl.btnBookAppointment}\n\n${tl.enterPhone}`, {
    parse_mode: "HTML",
    ...kb.back("book_appointment"),
  });
}

export async function enterPhone(ctx: Context, phone: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const session = (ctx as any).session || {};

  session.phone = phone;
  session.step = "confirm";
  (ctx as any).session = session;

  const service = await serviceCatalogService.findById(session.serviceId!);
  const doctor = await doctorService.findById(session.doctorId!);

  const serviceName = service?.nameRu ? `${service?.name} / ${service.nameRu}` : service?.name || "";
  const doctorName = (doctor as any)?.nameRu ? `${doctor?.name} / ${(doctor as any).nameRu}` : doctor?.name || "";
  const summary = [
    tl.appointmentSummary,
    "",
    `${tl.patient}: ${session.name}`,
    `📞: ${session.phone}`,
    `${tl.service}: ${serviceName}`,
    `${tl.price}: ${Number(service?.price || 0).toLocaleString()} UZS`,
    `${tl.doctor}: ${doctorName}`,
    `${tl.date}: ${session.date}`,
    `${tl.time}: ${session.time}`,
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
            { text: tl.btnConfirm, callback_data: `confirm_appt_${appointment.id}` },
            { text: tl.btnChange, callback_data: "book_appointment" },
          ],
          [{ text: tl.btnCancel, callback_data: `cancel_appt_${appointment.id}` }],
        ],
      },
    };

    await ctx.reply(summary, { parse_mode: "HTML", ...confirmButtons });
  } catch (error: any) {
    await ctx.reply(
      `${tl.error} ${error.message || ""}`,
      bkButtons(lang).mainMenu()
    );
    clearSession(ctx.chat!.id);
  }
}

export async function confirmAppointment(ctx: Context, appointmentId: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const kb = bkButtons(lang);

  try {
    const appointment = await appointmentService.confirm(appointmentId);
    if (!appointment) {
      await ctx.reply(tl.error, kb.mainMenu());
      return;
    }

    await notificationService.sendAppointmentConfirmation(appointment as any);

    const aptDoctorName = (appointment.doctor as any).nameRu ? `${appointment.doctor.name} / ${(appointment.doctor as any).nameRu}` : appointment.doctor.name;
    const aptServiceName = (appointment.service as any).nameRu ? `${appointment.service.name} / ${(appointment.service as any).nameRu}` : appointment.service.name;
    const text = [
      `✅ <b>${tl.confirmed}</b>`,
      "",
      `📅 ${appointment.date.toLocaleDateString()}`,
      `🕐 ${appointment.time}`,
      `👨‍⚕️ ${aptDoctorName}`,
      `🦷 ${aptServiceName}`,
    ].join("\n");

    await ctx.reply(text, { parse_mode: "HTML", ...(await import("../keyboards")).mainMenu(lang) });
  } catch (error) {
    await ctx.reply(tl.error, kb.mainMenu());
  }

  clearSession(ctx.chat!.id);
}

export async function cancelAppointment(ctx: Context, appointmentId: string) {
  const lang = getLang(ctx);
  const tl = t(lang);
  const { mainMenu } = await import("../keyboards");

  try {
    await appointmentService.cancel(appointmentId);
    await ctx.reply(tl.cancelled, mainMenu(lang));
  } catch (error) {
    await ctx.reply(tl.error, bkButtons(lang).mainMenu());
  }

  clearSession(ctx.chat!.id);
}
