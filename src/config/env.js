import "dotenv/config";

export const env = {
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017",
  mongoDbName: process.env.MONGO_DB_NAME || "nexusflow",
  port: process.env.PORT,
};