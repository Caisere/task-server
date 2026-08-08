import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL,
  allowOrigin: process.env.ALLOWED_ORIGINS,
} as const;
