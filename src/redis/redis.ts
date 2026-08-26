import { Redis } from "ioredis";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export const redisClient = new Redis(env.redis_url);
const CACHE_EXPIRY_TIME = Number(env.cache_expiry);

redisClient.on("connect", () => {
  logger.info("Redis Client Connected Successfully");
});

redisClient.on("error", (err) => {
  logger.error({ err }, `Redis Client Error: ${err}`);
});

// redis connection
export async function connectRedis(): Promise<void> {
  // connect to redis if not already connected
  if (redisClient.status === "close") {
    await redisClient.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient.status === "ready" || redisClient.status === "connecting") {
    await redisClient.quit();
    logger.info("Redis Client Disconnected Gracefully");
  }
}

export async function setDataToRedis<T>(
  dataKey: string,
  data: T,
): Promise<void> {
  await redisClient.set(dataKey, JSON.stringify(data), "EX", CACHE_EXPIRY_TIME);
}