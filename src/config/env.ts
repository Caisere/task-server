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
  // default variables
  port: Number(process.env.PORT) || 4000,
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  nodeEnv: process.env.NODE_ENV ?? "development",

  // database variable
  dbUrl: checkRequiredEnvVariable("DATABASE_URL"),

  // logger variables
  logLevel: process.env.LOG_LEVEL,

  // cookies variables
  allowOrigin: process.env.ALLOWED_ORIGINS,
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
  cookie_secure: process.env.COOKIE_SECURE === "true",
  cookie_same_site: checkRequiredEnvVariable("COOKIE_SAME_SITE"),

  // Redis variables
  redis_url: checkRequiredEnvVariable("REDIS_URL"),
  cache_expiry: checkRequiredEnvVariable("GET_ALL_CACHED_TASK_EXPIRY"),

  // rate-limits variables
  auth_rate_limit_max_requests: checkRequiredEnvVariable(
    "AUTH_RATE_LIMIT_MAX_REQUESTS",
  ),
  tasks_rate_limit_max_requests: checkRequiredEnvVariable(
    "TASKS_RATE_LIMIT_MAX_REQUESTS",
  ),
  rate_limit_window_seconds: checkRequiredEnvVariable(
    "RATE_LIMIT_WINDOW_SECONDS",
  ),
  refresh_rate_limit_max_requests: checkRequiredEnvVariable(
    "REFRESH_COOKIE_RATE_LIMIT_MAX_REQUESTS",
  ),
  refresh_rate_limit_window_seconds: checkRequiredEnvVariable(
    "REFRESH_COOKIE_RATE_LIMIT_WINDOW_SECONDS",
  ),

  // cloudinary variables
  cloudinary_cloud_name: checkRequiredEnvVariable("CLOUDINARY_CLOUD_NAME"),
  cloudinary_cloud_api_key: checkRequiredEnvVariable(
    "CLOUDINARY_CLOUD_API_KEY",
  ),
  cloudinary_cloud_api_secret: checkRequiredEnvVariable(
    "CLOUDINARY_CLOUD_API_SECRET",
  ),

  // google variables
  googleClientId: checkRequiredEnvVariable("GOOGLE_CLIENT_ID"),
  googleClientSecret: checkRequiredEnvVariable("GOOGLE_CLIENT_SECRET"),
  googleCallbackUrl: checkRequiredEnvVariable("GOOGLE_CALLBACK_URL"),
} as const;
