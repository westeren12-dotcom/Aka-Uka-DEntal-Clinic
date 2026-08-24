import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password for admin
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Create admin users
  const owner = await prisma.admin.upsert({
    where: { telegramId: BigInt(100000001) },
    update: {},
    create: {
      telegramId: BigInt(100000001),
      username: "clinic_owner",
      firstName: "Owner",
      lastName: "Admin",
      password: adminPassword,
      role: UserRole.OWNER,
    },
  });

  const manager = await prisma.admin.upsert({
    where: { telegramId: BigInt(100000002) },
    update: {},
    create: {
      telegramId: BigInt(100000002),
      username: "clinic_manager",
      firstName: "Manager",
      lastName: "Admin",
      password: adminPassword,
      role: UserRole.MANAGER,
    },
  });

  const receptionist = await prisma.admin.upsert({
    where: { telegramId: BigInt(100000003) },
    update: {},
    create: {
      telegramId: BigInt(100000003),
      username: "clinic_receptionist",
      firstName: "Receptionist",
      lastName: "Admin",
      password: adminPassword,
      role: UserRole.RECEPTIONIST,
    },
  });

  console.log("✅ Admin users created");

  // Create services
  const services = [
    {
      name: "Dental Cleaning",
      description: "Professional teeth cleaning and polishing",
      price: 150000,
      duration: 30,
    },
    {
      name: "Dental Treatment",
      description: "General dental treatment and fillings",
      price: 300000,
      duration: 45,
    },
    {
      name: "Teeth Whitening",
      description: "Professional teeth whitening procedure",
      price: 500000,
      duration: 60,
    },
    {
      name: "Dental Implant",
      description: "Dental implant placement surgery",
      price: 3000000,
      duration: 120,
    },
    {
      name: "Braces",
      description: "Orthodontic braces installation and adjustment",
      price: 5000000,
      duration: 60,
    },
    {
      name: "Crown",
      description: "Dental crown placement",
      price: 800000,
      duration: 60,
    },
    {
      name: "Consultation",
      description: "Initial dental consultation and examination",
      price: 100000,
      duration: 20,
    },
    {
      name: "X-Ray / Diagnostics",
      description: "Dental X-ray and diagnostic imaging",
      price: 80000,
      duration: 15,
    },
  ];

  const createdServices = [];
  for (const svc of services) {
    const created = await prisma.service.upsert({
      where: { name: svc.name },
      update: { price: svc.price, duration: svc.duration, description: svc.description },
      create: svc,
    });
    createdServices.push(created);
  }

  console.log("✅ Services created");

  // Create doctors
  const doctorsData = [
    {
      name: "Dr. Alisher Azizov",
      specialty: "General Dentistry",
      description: "Experienced general dentist with 10+ years of practice",
      workingDays: "Mon,Tue,Wed,Thu,Fri",
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
    },
    {
      name: "Dr. Nilufar Karimova",
      specialty: "Orthodontics",
      description: "Specialized in braces and alignment treatments",
      workingDays: "Mon,Wed,Fri",
      workingHoursStart: "10:00",
      workingHoursEnd: "17:00",
    },
    {
      name: "Dr. Rustam Toshmatov",
      specialty: "Oral Surgery",
      description: "Expert in implants and surgical procedures",
      workingDays: "Tue,Thu,Sat",
      workingHoursStart: "09:00",
      workingHoursEnd: "16:00",
    },
    {
      name: "Dr. Malika Rakhimova",
      specialty: "Pediatric Dentistry",
      description: "Gentle care for children's dental health",
      workingDays: "Mon,Tue,Wed,Thu,Fri",
      workingHoursStart: "09:00",
      workingHoursEnd: "15:00",
    },
  ];

  const createdDoctors = [];
  for (const doc of doctorsData) {
    const created = await prisma.doctor.upsert({
      where: { id: doc.name }, // This won't match, so it creates
      update: {},
      create: doc,
    });
    createdDoctors.push(created);
  }

  // If doctors already existed, fetch them
  const allDoctors = await prisma.doctor.findMany();
  if (allDoctors.length === 0) {
    for (const doc of doctorsData) {
      await prisma.doctor.create({ data: doc });
    }
  }

  const finalDoctors = await prisma.doctor.findMany();

  // Assign services to doctors
  for (const doctor of finalDoctors) {
    // Each doctor gets relevant services
    let serviceIndices: number[] = [];
    if (doctor.specialty === "General Dentistry") {
      serviceIndices = [0, 1, 5, 6, 7]; // Cleaning, Treatment, Crown, Consultation, X-Ray
    } else if (doctor.specialty === "Orthodontics") {
      serviceIndices = [4, 6]; // Braces, Consultation
    } else if (doctor.specialty === "Oral Surgery") {
      serviceIndices = [3, 5, 6, 7]; // Implant, Crown, Consultation, X-Ray
    } else if (doctor.specialty === "Pediatric Dentistry") {
      serviceIndices = [0, 1, 6]; // Cleaning, Treatment, Consultation
    }

    for (const idx of serviceIndices) {
      if (createdServices[idx]) {
        await prisma.doctorService.upsert({
          where: {
            doctorId_serviceId: {
              doctorId: doctor.id,
              serviceId: createdServices[idx].id,
            },
          },
          update: {},
          create: {
            doctorId: doctor.id,
            serviceId: createdServices[idx].id,
          },
        });
      }
    }
  }

  console.log("✅ Doctors created and assigned to services");

  // Create sample patients
  const patientsData = [
    { telegramId: BigInt(200000001), firstName: "Ali", lastName: "Valiyev", username: "ali_valiyev" },
    { telegramId: BigInt(200000002), firstName: "Vali", lastName: "Aliyev", username: "vali_aliyev" },
    { telegramId: BigInt(200000003), firstName: "Madina", lastName: "Karimova", username: "madina_k" },
    { telegramId: BigInt(200000004), firstName: "Aziz", lastName: "Nazarov", username: "aziz_n" },
    { telegramId: BigInt(200000005), firstName: "Dilnoza",lastName: "Ismoilova", username: "dilnoza_i" },
  ];

  for (const p of patientsData) {
    await prisma.patient.upsert({
      where: { telegramId: p.telegramId },
      update: {},
      create: { ...p, phoneNumber: "+99890" + String(Math.floor(Math.random() * 10000000)).padStart(7, "0") },
    });
  }

  console.log("✅ Sample patients created");

  // Create sample appointments
  const allPatients = await prisma.patient.findMany();
  const allServices = await prisma.service.findMany();
  const lastDoctors = await prisma.doctor.findMany();

  const today = new Date();
  const sampleAppointments = [
    { patientIdx: 0, doctorIdx: 0, serviceIdx: 6, dayOffset: 0, time: "09:00", status: "CONFIRMED" as const },
    { patientIdx: 1, doctorIdx: 0, serviceIdx: 0, dayOffset: 0, time: "10:00", status: "PENDING" as const },
    { patientIdx: 2, doctorIdx: 0, serviceIdx: 1, dayOffset: 0, time: "11:00", status: "CONFIRMED" as const },
    { patientIdx: 3, doctorIdx: 0, serviceIdx: 5, dayOffset: 1, time: "09:00", status: "PENDING" as const },
    { patientIdx: 4, doctorIdx: 1, serviceIdx: 4, dayOffset: 1, time: "10:00", status: "CONFIRMED" as const },
  ];

  for (const appt of sampleAppointments) {
    if (allPatients[appt.patientIdx] && lastDoctors[appt.doctorIdx] && allServices[appt.serviceIdx]) {
      const date = new Date(today);
      date.setDate(date.getDate() + appt.dayOffset);
      date.setHours(0, 0, 0, 0);

      await prisma.appointment.create({
        data: {
          patientId: allPatients[appt.patientIdx].id,
          doctorId: lastDoctors[appt.doctorIdx].id,
          serviceId: allServices[appt.serviceIdx].id,
          date,
          time: appt.time,
          status: appt.status,
        },
      });
    }
  }

  console.log("✅ Sample appointments created");

  // Create clinic settings
  const settingsData: Record<string, string> = {
    clinic_name: "Smile Dental Clinic",
    clinic_phone: "+998901234567",
    clinic_address: "Tashkent, Amir Temur street 15",
    clinic_google_maps: "https://maps.google.com/?q=41.3111,69.2797",
    clinic_working_hours: "Mon-Sat: 09:00 - 18:00",
    clinic_description: "Your trusted dental care provider with state-of-the-art equipment and experienced professionals.",
  };

  for (const [key, value] of Object.entries(settingsData)) {
    await prisma.clinicSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("✅ Clinic settings created");

  // Create FAQs
  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Simply tap 'Book Appointment' in the main menu and follow the steps to select a service, doctor, date, and time.",
    },
    {
      question: "What are your working hours?",
      answer: "We are open Monday to Saturday, 9:00 AM to 6:00 PM.",
    },
    {
      question: "Do you accept insurance?",
      answer: "Please contact us directly at our phone number to discuss insurance options.",
    },
    {
      question: "How can I cancel or reschedule my appointment?",
      answer: "Go to 'My Appointments' in the main menu. You can cancel or reschedule your upcoming appointments there.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, UzCard, Humo, and bank transfers. Payment is collected at the clinic.",
    },
    {
      question: "Is parking available?",
      answer: "Yes, there is parking available near our clinic. The address is Tashkent, Amir Temur street 15.",
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  console.log("✅ FAQs created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log("   - 3 Admin users (owner/admin123)");
  console.log(`   - ${createdServices.length} Services`);
  console.log(`   - ${finalDoctors.length} Doctors`);
  console.log(`   - ${patientsData.length} Patients`);
  console.log(`   - ${sampleAppointments.length} Sample appointments`);
  console.log("   - Clinic settings");
  console.log(`   - ${faqs.length} FAQs`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
