import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017",
  mongoDbName: process.env.MONGO_DB_NAME || "nexusflow",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  smsProviderMode: process.env.SMS_PROVIDER_MODE || "mock",
  webhookTimeoutMs: Number(process.env.WEBHOOK_TIMEOUT_MS) || 5000,
  twilioSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  autoSimulate: process.env.AUTO_SIMULATE !== "false", // on by default — set to "false" to disable
  autoSimulateIntervalMs: Number(process.env.AUTO_SIMULATE_INTERVAL_MS) || 1500,
};
