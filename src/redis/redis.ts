import { createClient } from "redis";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export const redisClient = createClient({
  url: env.redis_url,
});

redisClient.on("connect", () => {
  logger.info("Redis Client Connected Successfully");
});

redisClient.on("error", (err) => {
  logger.error({ err }, `Redis Client Error: ${err}`);
});

// redis connection
export async function connectRedis(): Promise<void> {
  // connect to redis if not already connected
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.quit();
    logger.info("Redis Client Disconnected Gracefully");
  }
}
