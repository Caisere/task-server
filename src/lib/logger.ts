import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.logLevel || "info",
  // Enable pretty printing only when running in development mode
  transport: env.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true, // enable colour tags
          translateTime: "SYS:standard", // human readable timeStamp
        },
      },
});
