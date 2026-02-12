import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change-me-in-prod",
  jwtExpiresIn: "7d",
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || "http://localhost:3000",
  postgresUrl: process.env.POSTGRES_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  emailProvider: process.env.EMAIL_PROVIDER || "console",
  resendApiKey: process.env.RESEND_API_KEY || "",
};

