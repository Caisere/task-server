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
  access_token_secret_key: checkRequiredEnvVariable("ACCESS_TOKEN_SECRET_KEY"),
  access_token_expiry_time: checkRequiredEnvVariable(
    "ACCESS_TOKEN_EXPIRY_PERIOD",
  ),
  refresh_token_secret_key: checkRequiredEnvVariable(
    "REFRESH_TOKEN_SECRET_KEY",
  ),
  refresh_token_expiry_time: checkRequiredEnvVariable(
    "REFRESH_TOKEN_EXPIRY_PERIOD",
  ),
  cookie_secure: process.env.COOKIE_SECURE === 'true',
  cookie_same_site: checkRequiredEnvVariable("COOKIE_SAME_SITE"),
} as const;
