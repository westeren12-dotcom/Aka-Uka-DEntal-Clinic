import prisma from "../utils/prisma";

// Service name mapping: English → Uzbek (for updating existing data)
const SERVICE_NAME_MAP: Record<string, { uz: string; ru: string; descUz: string; descRu: string }> = {
  "Dental Cleaning": { uz: "Tish tozalash", ru: "Чистка зубов", descUz: "Tishlarni professional tozalash va parlatish", descRu: "Профессиональная чистка и полировка зубов" },
  "Dental Treatment": { uz: "Tish davolash", ru: "Лечение зубов", descUz: "Umumiy tish davolash va plomba qo'yish", descRu: "Общее лечение зубов и пломбирование" },
  "Teeth Whitening": { uz: "Tish oqartirish", ru: "Отбеливание зубов", descUz: "Professional tish oqartirish protsedurasi", descRu: "Профессиональное отбеливание зубов" },
  "Dental Implant": { uz: "Tish implantatsiya", ru: "Зубной имплант", descUz: "Tish implantatsiyasi o'rnatish", descRu: "Установка зубного импланта" },
  "Braces": { uz: "Brekеты", ru: "Брекеты", descUz: "Ortodontik breketlar o'rnatish", descRu: "Установка ортодонтических брекетов" },
  "Crown": { uz: "Tish toji", ru: "Коронка", descUz: "Tish toji o'rnatish", descRu: "Установка зубной коронки" },
  "Consultation": { uz: "Konsultatsiya", ru: "Консультация", descUz: "Umumiy stomatologik konsultatsiya", descRu: "Общая стоматологическая консультация" },
  "X-Ray / Diagnostics": { uz: "Rentgen / Diagnostika", ru: "Рентген / Диагностика", descUz: "Tish rentgeni va diagnostik tekshiruv", descRu: "Рентген зубов и диагностическая съемка" },
};

// Doctor name mapping: English → Uzbek
const DOCTOR_NAME_MAP: Record<string, { uz: string; ru: string; specUz: string; specRu: string; descUz: string; descRu: string }> = {
  "Dr. Musobek": { uz: "Dr. Musobek", ru: "Др. Мусобек", specUz: "Bosh stomatolog", specRu: "Главный стоматолог", descUz: "Bosh stomatolog va asoschi, 15+ yillik tajriba", descRu: "Главный стоматолог и основатель, опыт более 15 лет" },
  "Dr. Karimova": { uz: "Dr. Karimova", ru: "Др. Каримова", specUz: "Ortodont", specRu: "Ортодонт", descUz: "Brekетlar va tish tekislash bo'yicha mutaxassis", descRu: "Специалист по брекетам и выравниванию зубов" },
  "Dr. Toshmatov": { uz: "Dr. Toshmatov", ru: "Др. Ташматов", specUz: "Stomatolog-xirurg", specRu: "Хирург-стоматолог", descUz: "Tish implantatsiyasi va og'iz xirurgiyasi bo'yicha ekspert", descRu: "Эксперт по зубным имплантам и полостной хирургии" },
  "Dr. Nishonova": { uz: "Dr. Nishonova", ru: "Др. Нишонова", specUz: "Bolalar stomatologi", specRu: "Детский стоматолог", descUz: "Bolalar tish salomatligiga g'amxo'rlik", descRu: "Бережный уход за зубами детей" },
};

/**
 * Update existing English-named services/doctors to Uzbek
 */
export async function updateExistingDataToUzbek(): Promise<void> {
  console.log("🔄 Checking for English data to update to Uzbek...");

  let updatedServices = 0;
  let updatedDoctors = 0;

  // Update services with English names to Uzbek
  for (const [engName, data] of Object.entries(SERVICE_NAME_MAP)) {
    try {
      const result = await prisma.service.updateMany({
        where: { name: engName },
        data: { name: data.uz, nameRu: data.ru, description: data.descUz, descriptionRu: data.descRu },
      });
      if (result.count > 0) {
        updatedServices += result.count;
        console.log(`  ✅ Updated service: ${engName} → ${data.uz}`);
      }
    } catch (e) { /* skip */ }
  }

  // Also check for any service with English-only names (no nameRu)
  const servicesWithoutRu = await prisma.service.findMany({ where: { nameRu: null } });
  for (const s of servicesWithoutRu) {
    const mapping = Object.values(SERVICE_NAME_MAP).find(m => m.uz === s.name || m.ru === s.name);
    if (mapping) {
      await prisma.service.update({ where: { id: s.id }, data: { nameRu: mapping.ru, descriptionRu: mapping.descRu } });
      updatedServices++;
    }
  }

  // Update doctors with English names to Uzbek
  for (const [engName, data] of Object.entries(DOCTOR_NAME_MAP)) {
    try {
      const result = await prisma.doctor.updateMany({
        where: { name: engName },
        data: { nameRu: data.ru, specialty: data.specUz, specialtyRu: data.specRu, description: data.descUz, descriptionRu: data.descRu },
      });
      if (result.count > 0) {
        updatedDoctors += result.count;
        console.log(`  ✅ Updated doctor: ${engName} → ${data.uz}`);
      }
    } catch (e) { /* skip */ }
  }

  if (updatedServices > 0 || updatedDoctors > 0) {
    console.log(`✅ Updated ${updatedServices} services and ${updatedDoctors} doctors to Uzbek`);
  } else {
    console.log("✅ All data already in Uzbek");
  }
}

export async function seedDatabase(): Promise<void> {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      console.log("✅ Database already seeded, checking for Uzbek updates...");
      await updateExistingDataToUzbek();
      return;
    }

    console.log("🌱 Seeding database with initial data...");

    // Create default admins
    const bcrypt = require("bcryptjs");
    const defaultPassword = await bcrypt.hash("admin123", 12);

    await prisma.admin.createMany({
      data: [
        {
          telegramId: BigInt(100000001),
          username: "owner",
          firstName: "System",
          lastName: "Owner",
          password: defaultPassword,
          role: "OWNER",
          isActive: true,
        },
        {
          telegramId: BigInt(100000002),
          username: "manager",
          firstName: "System",
          lastName: "Manager",
          password: defaultPassword,
          role: "MANAGER",
          isActive: true,
        },
        {
          telegramId: BigInt(100000003),
          username: "receptionist",
          firstName: "System",
          lastName: "Reception",
          password: defaultPassword,
          role: "RECEPTIONIST",
          isActive: true,
        },
      ],
    });
    console.log("✅ Created 3 default admins (password: admin123)");

    // Create bilingual services (Uzbek primary, Russian secondary)
    const services = await Promise.all([
      prisma.service.create({
        data: {
          name: "Tish tozalash",
          nameRu: "Чистка зубов",
          description: "Tishlarni professional tozalash va parlatish",
          descriptionRu: "Профессиональная чистка и полировка зубов",
          price: 150000,
          duration: 30,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Tish davolash",
          nameRu: "Лечение зубов",
          description: "Umumiy tish davolash va plomba qo'yish",
          descriptionRu: "Общее лечение зубов и пломбирование",
          price: 300000,
          duration: 45,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Tish oqartirish",
          nameRu: "Отбеливание зубов",
          description: "Professional tish oqartirish protsedurasi",
          descriptionRu: "Профессиональное отбеливание зубов",
          price: 500000,
          duration: 60,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Tish implantatsiya",
          nameRu: "Зубной имплант",
          description: "Tish implantatsiyasi o'rnatish",
          descriptionRu: "Установка зубного импланта",
          price: 2000000,
          duration: 120,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Brekеты",
          nameRu: "Брекеты",
          description: "Ortodontik breketlar o'rnatish",
          descriptionRu: "Установка ортодонтических брекетов",
          price: 3000000,
          duration: 60,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Tish toji",
          nameRu: "Коронка",
          description: "Tish toji o'rnatish",
          descriptionRu: "Установка зубной коронки",
          price: 800000,
          duration: 90,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Konsultatsiya",
          nameRu: "Консультация",
          description: "Umumiy stomatologik konsultatsiya",
          descriptionRu: "Общая стоматологическая консультация",
          price: 50000,
          duration: 20,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Rentgen / Diagnostika",
          nameRu: "Рентген / Диагностика",
          description: "Tish rentgeni va diagnostik tekshiruv",
          descriptionRu: "Рентген зубов и диагностическая съемка",
          price: 100000,
          duration: 15,
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ Created ${services.length} bilingual services (Uzbek + Russian)`);

    // Create bilingual doctors (Uzbek primary, Russian secondary)
    const doctors = await Promise.all([
      prisma.doctor.create({
        data: {
          name: "Dr. Musobek",
          nameRu: "Др. Мусобек",
          specialty: "Bosh stomatolog",
          specialtyRu: "Главный стоматолог",
          description: "Bosh stomatolog va asoschi, 15+ yillik tajriba",
          descriptionRu: "Главный стоматолог и основатель, опыт более 15 лет",
          workingDays: "Mon,Tue,Wed,Thu,Fri",
          workingHoursStart: "09:00",
          workingHoursEnd: "17:00",
          isActive: true,
        },
      }),
      prisma.doctor.create({
        data: {
          name: "Dr. Karimova",
          nameRu: "Др. Каримова",
          specialty: "Ortodont",
          specialtyRu: "Ортодонт",
          description: "Brekетlar va tish tekislash bo'yicha mutaxassis",
          descriptionRu: "Специалист по брекетам и выравниванию зубов",
          workingDays: "Mon,Wed,Fri",
          workingHoursStart: "10:00",
          workingHoursEnd: "18:00",
          isActive: true,
        },
      }),
      prisma.doctor.create({
        data: {
          name: "Dr. Toshmatov",
          nameRu: "Др. Ташматов",
          specialty: "Stomatolog-xirurg",
          specialtyRu: "Хирург-стоматолог",
          description: "Tish implantatsiyasi va og'iz xirurgiyasi bo'yicha ekspert",
          descriptionRu: "Эксперт по зубным имплантам и полостной хирургии",
          workingDays: "Tue,Thu,Sat",
          workingHoursStart: "09:00",
          workingHoursEnd: "16:00",
          isActive: true,
        },
      }),
      prisma.doctor.create({
        data: {
          name: "Dr. Nishonova",
          nameRu: "Др. Нишонова",
          specialty: "Bolalar stomatologi",
          specialtyRu: "Детский стоматолог",
          description: "Bolalar tish salomatligiga g'amxo'rlik",
          descriptionRu: "Бережный уход за зубами детей",
          workingDays: "Mon,Tue,Wed,Thu,Fri",
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ Created ${doctors.length} bilingual doctors (Uzbek + Russian)`);

    // Assign services to doctors
    const allServiceIds = services.map((s) => s.id);
    for (const doctor of doctors) {
      for (const serviceId of allServiceIds) {
        try {
          await prisma.doctorService.create({
            data: { doctorId: doctor.id, serviceId },
          });
        } catch (e) {
          // Skip duplicates
        }
      }
    }
    console.log("✅ Assigned services to doctors");

    // Create clinic settings
    const settings = [
      { key: "clinic_name", value: "Aka-Uka Stomatologiya Klinikasi" },
      { key: "clinic_phone", value: "+998901234567" },
      { key: "clinic_address", value: "Toshkent, Amir Temur ko'chasi 15" },
      { key: "clinic_google_maps", value: "https://maps.google.com/?q=41.3111,69.2797" },
      { key: "clinic_working_hours", value: "Dush-Shan: 09:00 - 18:00" },
    ];
    await prisma.clinicSettings.createMany({ data: settings });
    console.log("✅ Created clinic settings");

    // Create bilingual FAQs
    const faqs = [
      {
        question: "Ish vaqtlaringiz qanday?",
        answer: "Biz Dushanbadan Shanbagacha, 09:00 dan 18:00 gacha ishlaymiz. Yakshanba kuni dam olish.",
        category: "general",
      },
      {
        question: "Каковы ваши часы работы?",
        answer: "Мы работаем с понедельника по субботу, с 09:00 до 18:00. В воскресенье выходной.",
        category: "general",
      },
      {
        question: "Qanday qilib uchrashuv belgilashim mumkin?",
        answer: "Siz ushbu Telegram boti orqali to'g'ridan-to'g'ri uchrashuv belgilashingiz mumkin! '📅 Uchrashuv belgilash' tugmasini bosing.",
        category: "booking",
      },
      {
        question: "Как записаться на приём?",
        answer: "Вы можете записаться прямо через этот Telegram бот! Нажмите '📅 Записаться на приём'.",
        category: "booking",
      },
      {
        question: "Qanday to'lov usullarini qabul qilasizlar?",
        answer: "Biz naqd pul, bank o'tkazmalari va karta to'lovlarini qabul qilamiz. Barcha narxlar Xizmatlar bo'limida ko'rsatilgan.",
        category: "payment",
      },
      {
        question: "Какие способы оплаты вы принимаете?",
        answer: "Мы принимаем наличные, банковские переводы и оплату картой. Все цены указаны в разделе Услуги.",
        category: "payment",
      },
      {
        question: "Uchrashuvimni bekor qila yoki o'zgartira olamanmi?",
        answer: "Ha! Bot menyusidagi '📋 Mening uchrashuvlarim' bo'limiga o'ting.",
        category: "booking",
      },
      {
        question: "Можно ли отменить или перенести запись?",
        answer: "Да! Перейдите в '📋 Мои записи' в меню бота, чтобы перенести или отменить.",
        category: "booking",
      },
    ];
    await prisma.fAQ.createMany({ data: faqs });
    console.log(`✅ Created ${faqs.length} bilingual FAQs`);

    // Create sample patients
    const patients = await Promise.all([
      prisma.patient.create({
        data: {
          telegramId: BigInt(111111111),
          firstName: "Ali",
          lastName: "Valiyev",
          username: "ali_valiyev",
          phoneNumber: "+998901234568",
        },
      }),
      prisma.patient.create({
        data: {
          telegramId: BigInt(222222222),
          firstName: "Vali",
          lastName: "Karimov",
          username: "vali_karimov",
          phoneNumber: "+998901234569",
        },
      }),
      prisma.patient.create({
        data: {
          telegramId: BigInt(333333333),
          firstName: "Madina",
          lastName: "Aliyeva",
          username: "madina_ali",
          phoneNumber: "+998901234570",
        },
      }),
    ]);
    console.log(`✅ Created ${patients.length} sample patients`);

    // Create sample appointments
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = [
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        serviceId: services[0].id,
        date: tomorrow,
        time: "09:00",
        status: "CONFIRMED" as const,
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        serviceId: services[4].id,
        date: tomorrow,
        time: "11:00",
        status: "PENDING" as const,
      },
      {
        patientId: patients[2].id,
        doctorId: doctors[0].id,
        serviceId: services[1].id,
        date: nextWeek,
        time: "14:00",
        status: "PENDING" as const,
      },
    ];

    for (const apt of appointments) {
      const appointment = await prisma.appointment.create({ data: apt });
      await prisma.payment.create({
        data: {
          appointmentId: appointment.id,
          amount: services.find((s) => s.id === apt.serviceId)!.price,
          status: apt.status === "CONFIRMED" ? "PAID" : "UNPAID",
        },
      });
    }
    console.log(`✅ Created ${appointments.length} sample appointments with payments`);

    console.log("🎉 Database seeded successfully!");
  } catch (error: any) {
    console.error("❌ Seeding error:", error.message || error);
  }
}
