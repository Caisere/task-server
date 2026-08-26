import { env } from "../config/env"

const redisUrl = new URL(env.redis_url)

export const bullmqConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  maxRetriesRequest: null
}