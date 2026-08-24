import dotenv from "dotenv";
dotenv.config();

import { startBot } from "./bot";
import { startApi } from "./api";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🦷 Starting Dental Clinic System...");

  try {
    // Auto-run migrations
    console.log("📦 Running database migrations...");
    const { execSync } = require("child_process");
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("✅ Migrations applied");
    } catch (e) {
      console.log("⚠️ Migration skipped (may already be up to date)");
    }

    // Generate prisma client
    try {
      execSync("npx prisma generate", { stdio: "inherit" });
      console.log("✅ Prisma client generated");
    } catch (e) {
      console.log("⚠️ Prisma generate skipped");
    }

    startApi();
    await startBot();
    console.log("✅ All systems are running!");
  } catch (error) {
    console.error("❌ Failed to start:", error);
    process.exit(1);
  }
}

main();
