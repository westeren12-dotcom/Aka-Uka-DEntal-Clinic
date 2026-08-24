import dotenv from "dotenv";
dotenv.config();

import { execSync } from "child_process";

const DATABASE_URL = process.env.DATABASE_URL;

function run(cmd: string, env?: Record<string, string>): boolean {
  try {
    execSync(cmd, {
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("🦷 Starting Dental Clinic System...");
  console.log("🔗 DATABASE_URL:", DATABASE_URL ? "SET" : "NOT SET");

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set!");
    process.exit(1);
  }

  // Step 1: Generate Prisma client
  console.log("\n📦 [1/3] Generating Prisma client...");
  if (!run("npx prisma generate")) {
    console.error("❌ Prisma generate failed");
    process.exit(1);
  }
  console.log("✅ Prisma client generated");

  // Step 2: Push schema to database
  console.log("\n📦 [2/3] Creating database tables...");
  if (!run("npx prisma db push --accept-data-loss")) {
    console.error("❌ Schema push failed");
    process.exit(1);
  }
  console.log("✅ Database tables ready");

  // Step 3: Seed database
  console.log("\n🌱 [3/3] Seeding database...");
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const { seedDatabase } = await import("./services/seed.service");
      await seedDatabase();
    } else {
      console.log("✅ Database already has data, skipping seed");
    }
  } catch (err: any) {
    console.error("⚠️ Seed check error:", err.message);
  }
  await prisma.$disconnect();

  // Step 4: Start services
  console.log("\n🚀 Starting services...");
  const { startBot } = await import("./bot");
  const { startApi } = await import("./api");

  startApi();
  await startBot();

  console.log("\n✅ All systems are running!");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
