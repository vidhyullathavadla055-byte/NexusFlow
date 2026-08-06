import "dotenv/config";

export const env = {
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017",
  mongoDbName: process.env.MONGO_DB_NAME || "nexusflow",
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev-only-insecure-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

if (!process.env.JWT_SECRET) {
  console.warn(
    "[env] JWT_SECRET is not set in .env — using an insecure dev default. " +
      "Set a real JWT_SECRET before deploying."
  );
}