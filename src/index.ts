import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🦷 Starting Dental Clinic System...");

  try {
    // Run prisma generate first
    console.log("📦 Generating Prisma client...");
    const { execSync } = require("child_process");
    try {
      execSync("npx prisma generate", { stdio: "inherit" });
      console.log("✅ Prisma client generated");
    } catch (e) {
      console.log("⚠️ Prisma generate skipped (may already be generated)");
    }

    // Push schema to database (creates tables)
    console.log("📦 Syncing database schema...");
    try {
      execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
      console.log("✅ Database schema synced");
    } catch (e) {
      console.log("⚠️ Schema push may have failed - check DATABASE_URL");
    }

    // Seed database if empty (using compiled service, not ts-node)
    const { seedDatabase } = await import("./services/seed.service");
    await seedDatabase();

    // Import and start services
    const { startBot } = await import("./bot");
    const { startApi } = await import("./api");

    startApi();
    await startBot();

    console.log("✅ All systems are running!");
  } catch (error: any) {
    console.error("❌ Failed to start:", error.message || error);
    
    // Don't exit if it's a database connection issue - log and keep trying
    if (error.message?.includes("Can't reach database")) {
      console.error("💡 DATABASE_URL may not be set or is incorrect");
      console.error("💡 Set DATABASE_URL in Railway Variables tab");
    }
    
    // For other critical errors, exit
    if (!error.message?.includes("database")) {
      process.exit(1);
    }
  }
}

main();
