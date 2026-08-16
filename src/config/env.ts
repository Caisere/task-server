import dotenv from "dotenv";

dotenv.config();

function checkRequiredEnvVariable(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing env variables for ${key}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL,
  allowOrigin: process.env.ALLOWED_ORIGINS,
  dbUrl: checkRequiredEnvVariable("DATABASE_URL"),
  jwt_secret_key: checkRequiredEnvVariable("JWT_SECRET_KEY"),
  jwt_expiry_time: checkRequiredEnvVariable("JWT_EXPIRY_PERIOD"),
} as const;
