import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

export const config = {
  databaseUrl: required("DATABASE_URL"),
  botToken: required("BOT_TOKEN"),
  adminTelegramIds: process.env.ADMIN_TELEGRAM_IDS?.split(",").map((id) => BigInt(id.trim())) || [],
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  aiApiKey: process.env.AI_API_KEY || "",
  aiProvider: process.env.AI_PROVIDER || "openai",
  clinic: {
    name: process.env.CLINIC_NAME || "Smile Dental Clinic",
    phone: process.env.CLINIC_PHONE || "+998901234567",
    address: process.env.CLINIC_ADDRESS || "Tashkent, Amir Temur street 15",
    googleMapsUrl: process.env.GOOGLE_MAPS_URL || "https://maps.google.com/?q=41.3111,69.2797",
    workingHours: process.env.CLINIC_WORKING_HOURS || "Mon-Sat: 09:00 - 18:00",
  },
  port: parseInt(process.env.PORT || "3001", 10),
  adminPort: parseInt(process.env.ADMIN_PORT || "5173", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
};
