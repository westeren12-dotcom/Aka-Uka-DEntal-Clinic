import dotenv from "dotenv";
dotenv.config();

import { startBot } from "./bot";
import { startApi } from "./api";

async function main() {
  console.log("🦷 Starting Dental Clinic System...");

  try {
    // Start API server
    startApi();

    // Start Telegram bot
    await startBot();

    console.log("✅ All systems are running!");
    console.log("   🤖 Telegram Bot: Active");
    console.log("   🌐 API Server: Active");
  } catch (error) {
    console.error("❌ Failed to start:", error);
    process.exit(1);
  }
}

main();
