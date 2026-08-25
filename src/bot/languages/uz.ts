export const uz = {
  // Main menu
  welcome: (name: string) =>
    `🦷 <b>${name}</b> ga xush kelibsiz!\n\nSizning raqamli stomatologiya qabulxonasiz. 👋\nBugun sizga qanday yordam bera olamiz?`,

  // Menu buttons
  btnBookAppointment: "📅 Uchrashuv belgilash",
  btnServices: "🦷 Xizmatlar",
  btnPrices: "💰 Narxlar",
  btnDoctors: "👨‍⚕️ Shifokorlar",
  btnMyAppointments: "📋 Mening uchrashuvlarim",
  btnLocation: "📍 Manzil",
  btnContact: "📞 Bog'lanish",
  btnFaq: "❓ Ko'p beriladigan savollar",
  btnBack: "⬅️ Orqaga",
  btnMainMenu: "🏠 Asosiy menyu",
  btnConfirm: "✅ Tasdiqlash",
  btnChange: "🔄 O'zgartirish",
  btnCancel: "❌ Bekor qilish",
  btnYes: "✅ Ha",
  btnNo: "❌ Yo'q",
  btnAll: "📋 Barchasi",
  btnUpcoming: "📅 Kelayotgan",
  btnPast: "📆 O'tgan",
  btnCancelled: "🚫 Bekor qilingan",
  btnReschedule: "🔄 Vaqtni o'zgartirish",
  btnAskAI: "🤖 Savol berish",
  btnBackToMenu: "🏠 Asosiy menyuga",

  // Booking
  selectService: "🦷 Xizmatni tanlang:",
  selectDoctor: "👨‍⚕️ Shifokorni tanlang:",
  selectDate: "📅 Sanani tanlang:",
  selectTime: "🕐 Vaqtni tanlang:",
  enterName: "👤 Ismingizni kiriting:",
  enterPhone: "📞 Telefon raqamingizni kiriting:",
  appointmentSummary: "📋 <b>Uchrashuv xulosasi:</b>",
  patient: "👤 Bemor",
  service: "🦷 Xizmat",
  doctor: "👨‍⚕️ Shifokor",
  date: "📅 Sana",
  time: "🕐 Vaqt",
  price: "💰 Narx",
  duration: "⏱ Davomiylik",
  confirmed: "✅ Uchrashuv muvaffaqiyatli tasdiqlandi!",
  cancelled: "❌ Uchrashuv bekor qilindi.",
  noSlots: "⚠️ Bu sanada bo'sh vaqt yo'q. Boshqa sana tanlang.",

  // Services
  servicesTitle: "🦷 <b>Xizmatlar ro'yxati:</b>",
  pricesTitle: "💰 <b>Narxlar:</b>",
  serviceEntry: (name: string, desc: string, price: string, duration: number) =>
    `🦷 <b>${name}</b>\n📝 ${desc}\n💰 ${price}\n⏱ ${duration} daqiqa`,

  // Doctors
  doctorsTitle: "👨‍⚕️ <b>Shifokorlar:</b>",
  doctorEntry: (name: string, spec: string, desc: string, days: string, hours: string) =>
    `👨‍⚕️ <b>${name}</b>\n🔬 ${spec}\n📝 ${desc}\n📅 ${days}\n🕐 ${hours}`,
  doctorServices: "Xizmatlar:",

  // My appointments
  myAppointmentsTitle: "📋 <b>Mening uchrashuvlarim:</b>",
  noAppointments: "📋 Sizda hali uchrashuv yo'q.",
  appointmentEntry: (service: string, doctor: string, date: string, time: string, status: string) =>
    `🦷 ${service}\n👨‍⚕️ ${doctor}\n📅 ${date} 🕐 ${time}\n📌 ${status}`,
  statusPending: "⏳ Kutilmoqda",
  statusConfirmed: "✅ Tasdiqlangan",
  statusCompleted: "✔️ Tugallangan",
  statusCancelled: "❌ Bekor qilinGAN",

  // Location
  locationTitle: "📍 <b>Klinikamiz manzili:</b>",
  address: "Manzil",
  workingHours: "Ish vaqti",
  openMaps: "🗺 Xaritada ko'rish",

  // Contact
  contactTitle: "📞 <b>Bog'lanish:</b>",
  phone: "Telefon",
  sendMessage: "✉ Xabar yozish",

  // FAQ
  faqTitle: "❓ <b>Ko'p beriladigan savollar:</b>",
  askQuestion: "🤖 Savolingizni yozing, men javob beraman!",

  // Late cancel / no-show
  lateCancelMessage: (doctor: string, service: string) =>
    `⚠️ <b>Uchrashuv bekor qilindi!</b>\n\nSiz belgilangan vaqtdan 10 daqiqa kechdingiz.\n\n👨‍⚕️ Shifokor: ${doctor}\n🦷 Xizmat: ${service}\n\nKeyingi uchrashuv uchun qaytadan belgilang.`,

  // Reminders
  reminder2h: (time: string, doctor: string, service: string) =>
    `🔔 <b>Eslatma</b>\n\nUchrashingizga 2 soat qoldi.\n🕐 ${time}\n👨‍⚕️ ${doctor}\n🦷 ${service}`,
  reminder1h: (time: string, doctor: string, service: string) =>
    `🔔 <b>Eslatma</b>\n\nUchrashingizga 1 soat qoldi.\n🕐 ${time}\n👨‍⚕️ ${doctor}\n🦷 ${service}`,
  reminder30m: (time: string, doctor: string, service: string) =>
    `⏰ <b>Eslatma</b>\n\nUchrashingizga 30 daqiqa qoldi!\n🕐 ${time}\n👨‍⚕️ ${doctor}\n🦷 ${service}`,
  reminder10m: (time: string, doctor: string, service: string) =>
    `🚨 <b>Ogohlantirish!</b>\n\nUchrashingizga atigi 10 daqiqa qoldi!\n🕐 ${time}\n👨‍⚕️ ${doctor}\n🦷 ${service}\n\nIltimos, tezroq yetib keling!`,
  reminderConfirm: "✅ Tasdiqlayman, kelaman",
  reminderCancel: "❌ Bekor qilaman",
  lateCancelTitle: "⚠️ Uchrashuv bekor qilindi",

  // Errors
  error: "❌ Xatolik yuz berdi. Qayta urinib ko'ring.",
  dbError: "❌ Ma'lumotlar bazasi tayyor emas. Biroz kutib qayta urinib ko'ring.",
  noPermission: "❌ Sizda ruxsat yo'q.",

  // Admin
  adminToday: "📅 <b>BUGUNGI UCHRASHUVLAR:</b>",
  adminEarnings: "💰 <b>BUGUNGI DAROMAD:</b>",
  adminStats: "📊 <b>STATISTIKA:</b>",
  total: "Jami",
  patients: "Bemorlar",
  appointments: "Uchrashuvlar",
};
