import dotenv from "dotenv";
dotenv.config();

import { startBot } from "./bot";
import { startApi } from "./api";

async function main() {
  console.log("🦷 Starting Dental Clinic System...");

  try {
    startApi();
    await startBot();
    console.log("✅ All systems are running!");
  } catch (error) {
    console.error("❌ Failed to start:", error);
    process.exit(1);
  }
}

main();
