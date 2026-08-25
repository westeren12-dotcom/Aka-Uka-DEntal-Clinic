import prisma from "../utils/prisma";

export async function seedDatabase(): Promise<void> {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      console.log("✅ Database already seeded");
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

    // Create bilingual services
    const services = await Promise.all([
      prisma.service.create({
        data: {
          name: "Dental Cleaning",
          nameRu: "Чистка зубов",
          description: "Professional teeth cleaning and polishing",
          descriptionRu: "Профессиональная чистка и полировка зубов",
          price: 150000,
          duration: 30,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Dental Treatment",
          nameRu: "Лечение зубов",
          description: "General dental treatment and fillings",
          descriptionRu: "Общее лечение зубов и пломбирование",
          price: 300000,
          duration: 45,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Teeth Whitening",
          nameRu: "Отбеливание зубов",
          description: "Professional teeth whitening procedure",
          descriptionRu: "Профессиональное отбеливание зубов",
          price: 500000,
          duration: 60,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Dental Implant",
          nameRu: "Зубной имплант",
          description: "Dental implant installation",
          descriptionRu: "Установка зубного импланта",
          price: 2000000,
          duration: 120,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Braces",
          nameRu: "Брекеты",
          description: "Orthodontic braces installation",
          descriptionRu: "Установка ортодонтических брекетов",
          price: 3000000,
          duration: 60,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Crown",
          nameRu: "Коронка",
          description: "Dental crown installation",
          descriptionRu: "Установка зубной коронки",
          price: 800000,
          duration: 90,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "Consultation",
          nameRu: "Консультация",
          description: "General dental consultation",
          descriptionRu: "Общая стоматологическая консультация",
          price: 50000,
          duration: 20,
          isActive: true,
        },
      }),
      prisma.service.create({
        data: {
          name: "X-Ray / Diagnostics",
          nameRu: "Рентген / Диагностика",
          description: "Dental X-ray and diagnostic imaging",
          descriptionRu: "Рентген зубов и диагностическая съемка",
          price: 100000,
          duration: 15,
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ Created ${services.length} bilingual services`);

    // Create bilingual doctors
    const doctors = await Promise.all([
      prisma.doctor.create({
        data: {
          name: "Dr. Musobek",
          nameRu: "Др. Мусобек",
          specialty: "Chief Dentist",
          specialtyRu: "Главный стоматолог",
          description: "Chief dentist and founder with 15+ years of experience",
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
          specialty: "Orthodontist",
          specialtyRu: "Ортодонт",
          description: "Specialist in braces and teeth alignment",
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
          specialty: "Oral Surgeon",
          specialtyRu: "Хирург-стоматолог",
          description: "Expert in dental implants and oral surgery",
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
          specialty: "Pediatric Dentist",
          specialtyRu: "Детский стоматолог",
          description: "Gentle care for children's dental health",
          descriptionRu: "Бережный уход за зубами детей",
          workingDays: "Mon,Tue,Wed,Thu,Fri",
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ Created ${doctors.length} bilingual doctors`);

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
      { key: "clinic_name", value: "Aka-Uka Dental Clinic" },
      { key: "clinic_phone", value: "+998901234567" },
      { key: "clinic_address", value: "Tashkent, Amir Temur street 15" },
      { key: "clinic_google_maps", value: "https://maps.google.com/?q=41.3111,69.2797" },
      { key: "clinic_working_hours", value: "Mon-Sat: 09:00 - 18:00" },
    ];
    await prisma.clinicSettings.createMany({ data: settings });
    console.log("✅ Created clinic settings");

    // Create bilingual FAQs
    const faqs = [
      {
        question: "What are your working hours?",
        answer: "We are open Monday to Saturday, from 09:00 to 18:00. We are closed on Sundays.",
        category: "general",
      },
      {
        question: "Каковы ваши часы работы?",
        answer: "Мы работаем с понедельника по субботу, с 09:00 до 18:00. В воскресенье выходной.",
        category: "general",
      },
      {
        question: "How can I book an appointment?",
        answer: "You can book an appointment directly through this Telegram bot! Just click '📅 Book Appointment'.",
        category: "booking",
      },
      {
        question: "Как записаться на приём?",
        answer: "Вы можете записаться прямо через этот Telegram бот! Нажмите '📅 Записаться на приём'.",
        category: "booking",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept cash, bank transfers, and card payments. All prices are listed in the Services section.",
        category: "payment",
      },
      {
        question: "Какие способы оплаты вы принимаете?",
        answer: "Мы принимаем наличные, банковские переводы и оплату картой. Все цены указаны в разделе Услуги.",
        category: "payment",
      },
      {
        question: "Can I cancel or reschedule my appointment?",
        answer: "Yes! Go to '📋 My Appointments' in the bot menu to reschedule or cancel.",
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
