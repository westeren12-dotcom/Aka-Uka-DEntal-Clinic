import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/types";

function backToMainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🏠 Main Menu", "main_menu")],
  ]);
}

function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📅 Book Appointment", "book_appointment")],
    [Markup.button.callback("🦷 Services", "show_services"), Markup.button.callback("💰 Prices", "show_prices")],
    [Markup.button.callback("👨‍⚕️ Doctors", "show_doctors")],
    [Markup.button.callback("📋 My Appointments", "my_appointments")],
    [Markup.button.callback("📍 Location", "show_location"), Markup.button.callback("📞 Contact Us", "show_contact")],
    [Markup.button.callback("❓ FAQ", "show_faq")],
  ]);
}

function backButton(target = "main_menu") {
  return Markup.inlineKeyboard([[Markup.button.callback("⬅️ Back", target)]]);
}

function confirmBooking(summary: { appointmentId: string }) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Confirm", `confirm_booking_${summary.appointmentId}`),
      Markup.button.callback("🔄 Change", `book_appointment`),
    ],
    [Markup.button.callback("❌ Cancel", `main_menu`)],
  ]);
}

function confirmAction(action: string, id: string) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Yes", `${action}_yes_${id}`),
      Markup.button.callback("❌ No", `${action}_no_${id}`),
    ],
  ]);
}

function appointmentActions(appointmentId: string, status: string) {
  const buttons: InlineKeyboardButton[][] = [];

  if (status === "PENDING" || status === "CONFIRMED") {
    buttons.push([
      Markup.button.callback("✅ Confirm", `appt_confirm_${appointmentId}`),
      Markup.button.callback("❌ Cancel", `appt_cancel_${appointmentId}`),
    ]);
    buttons.push([
      Markup.button.callback("🔄 Reschedule", `appt_reschedule_${appointmentId}`),
    ]);
  }

  buttons.push([Markup.button.callback("⬅️ Back", "my_appointments")]);
  return Markup.inlineKeyboard(buttons);
}

function yesNoPrompt(action: string, id: string) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Yes", `${action}_yes_${id}`),
      Markup.button.callback("❌ No", `no_action`),
    ],
  ]);
}

function inlineKeyboard(keyboards: InlineKeyboardButton[][]) {
  return Markup.inlineKeyboard(keyboards);
}

export const keyboards = {
  mainMenu,
  backToMainMenu,
  backButton,
  confirmBooking,
  confirmAction,
  appointmentActions,
  yesNoPrompt,
  inlineKeyboard,
};
