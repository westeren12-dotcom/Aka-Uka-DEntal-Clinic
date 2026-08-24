import { uz } from "./uz";
import { ru } from "./ru";

export type Language = "uz" | "ru";

export const languages = { uz, ru };

export function t(lang: Language) {
  return languages[lang] || languages.uz;
}

export function languageKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇺🇿 O'zbek tili (Lotin)", callback_data: "lang_uz" }],
        [{ text: "🇷🇺 Русский язык", callback_data: "lang_ru" }],
      ],
    },
  };
}
