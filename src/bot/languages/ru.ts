export const ru = {
  // Main menu
  welcome: (name: string) =>
    `🦷 Добро пожаловать в <b>${name}</b>!\n\nВаш цифровой стоматологический приём. 👋\nЧем мы можем вам помочь сегодня?`,

  // Menu buttons
  btnBookAppointment: "📅 Записаться на приём",
  btnServices: "🦷 Услуги",
  btnPrices: "💰 Цены",
  btnDoctors: "👨‍⚕️ Врачи",
  btnMyAppointments: "📋 Мои записи",
  btnLocation: "📍 Адрес",
  btnContact: "📞 Контакты",
  btnFaq: "❓ Частые вопросы",
  btnBack: "⬅️ Назад",
  btnMainMenu: "🏠 Главное меню",
  btnConfirm: "✅ Подтвердить",
  btnChange: "🔄 Изменить",
  btnCancel: "❌ Отменить",
  btnYes: "✅ Да",
  btnNo: "❌ Нет",
  btnAll: "📋 Все",
  btnUpcoming: "📅 Предстоящие",
  btnPast: "📆 Прошедшие",
  btnCancelled: "🚫 Отменённые",
  btnReschedule: "🔄 Перенести",
  btnAskAI: "🤖 Задать вопрос",
  btnBackToMenu: "🏠 В главное меню",

  // Booking
  selectService: "🦷 Выберите услугу:",
  selectDoctor: "👨‍⚕️ Выберите врача:",
  selectDate: "📅 Выберите дату:",
  selectTime: "🕐 Выберите время:",
  enterName: "👤 Введите ваше имя:",
  enterPhone: "📞 Введите номер телефона:",
  appointmentSummary: "📋 <b>Итог записи:</b>",
  patient: "👤 Пациент",
  service: "🦷 Услуга",
  doctor: "👨‍⚕️ Врач",
  date: "📅 Дата",
  time: "🕐 Время",
  price: "💰 Цена",
  duration: "⏱ Длительность",
  confirmed: "✅ Запись успешно подтверждена!",
  cancelled: "❌ Запись отменена.",
  noSlots: "⚠️ На эту дату нет свободных мест. Выберите другую дату.",

  // Services
  servicesTitle: "🦷 <b>Список услуг:</b>",
  pricesTitle: "💰 <b>Цены:</b>",
  serviceEntry: (name: string, desc: string, price: string, duration: number) =>
    `🦷 <b>${name}</b>\n📝 ${desc}\n💰 ${price}\n⏱ ${duration} минут`,

  // Doctors
  doctorsTitle: "👨‍⚕️ <b>Наши врачи:</b>",
  doctorEntry: (name: string, spec: string, desc: string, days: string, hours: string) =>
    `👨‍⚕️ <b>${name}</b>\n🔬 ${spec}\n📝 ${desc}\n📅 ${days}\n🕐 ${hours}`,
  doctorServices: "Услуги:",

  // My appointments
  myAppointmentsTitle: "📋 <b>Мои записи:</b>",
  noAppointments: "📋 У вас пока нет записей.",
  appointmentEntry: (service: string, doctor: string, date: string, time: string, status: string) =>
    `🦷 ${service}\n👨‍⚕️ ${doctor}\n📅 ${date} 🕐 ${time}\n📌 ${status}`,
  statusPending: "⏳ Ожидание",
  statusConfirmed: "✅ Подтверждено",
  statusCompleted: "✔️ Выполнено",
  statusCancelled: "❌ Отменено",

  // Location
  locationTitle: "📍 <b>Наш адрес:</b>",
  address: "Адрес",
  workingHours: "Часы работы",
  openMaps: "🗺 Открыть на карте",

  // Contact
  contactTitle: "📞 <b>Контакты:</b>",
  phone: "Телефон",
  sendMessage: "✉ Написать сообщение",

  // FAQ
  faqTitle: "❓ <b>Частые вопросы:</b>",
  askQuestion: "🤖 Напишите ваш вопрос, я отвечу!",

  // Errors
  error: "❌ Произошла ошибка. Попробуйте снова.",
  dbError: "❌ База данных не готова. Подождите и попробуйте снова.",
  noPermission: "❌ У вас нет доступа.",

  // Admin
  adminToday: "📅 <b>СЕГОДНЯШНИЕ ЗАПИСИ:</b>",
  adminEarnings: "💰 <b>СЕГОДНЯШНИЙ ДОХОД:</b>",
  adminStats: "📊 <b>СТАТИСТИКА:</b>",
  total: "Итого",
  patients: "Пациенты",
  appointments: "Записи",
};
