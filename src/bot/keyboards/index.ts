import { Language, t } from "../languages";

export function mainMenu(lang: Language = "uz") {
  const tl = t(lang);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: tl.btnBookAppointment, callback_data: "book_appointment" }],
        [
          { text: tl.btnServices, callback_data: "show_services" },
          { text: tl.btnPrices, callback_data: "show_prices" },
        ],
        [{ text: tl.btnDoctors, callback_data: "show_doctors" }],
        [{ text: tl.btnMyAppointments, callback_data: "my_appointments" }],
        [
          { text: tl.btnLocation, callback_data: "show_location" },
          { text: tl.btnContact, callback_data: "show_contact" },
        ],
        [{ text: tl.btnFaq, callback_data: "show_faq" }],
      ],
    },
  };
}

export function backButton(lang: Language = "uz") {
  const tl = t(lang);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: tl.btnBack, callback_data: "main_menu" }],
      ],
    },
  };
}

export function backToMainMenu(lang: Language = "uz") {
  const tl = t(lang);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: tl.btnBackToMenu, callback_data: "main_menu" }],
      ],
    },
  };
}

// Keep old export for backward compatibility
export const keyboards = {
  mainMenu,
  backButton,
  backToMainMenu,
};
