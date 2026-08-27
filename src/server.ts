import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { disconnectRedis } from "./redis/redis";
import "./workers/deleteCloudinaryImage.worker";
async function serverStartUp(): Promise<void> {
  try {
    // await connectRedis();

    const app = createApp();

    const server = app.listen(env.port, () => {
      logger.info(`Server is now running on port http://localhost:${env.port}`);
    });

    async function handleShutdown(signal: string) {
      logger.info(`Received ${signal}. Graceful shutdown starting...`);

      server.close(async () => {
        logger.info("HTTP Server stopped accepting new requests.");
        // Safely closes the Redis connection
        await disconnectRedis();
        process.exit(0);
      });
    }

    process.on("SIGINT", () => handleShutdown("SIGNIT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  } catch (error) {
    logger.error({ err: error }, "Failed to start the application server");
    process.exit(1);
  }
}

serverStartUp();
