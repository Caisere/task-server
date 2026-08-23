import { NextFunction, Request, Response } from "express";
import { redisClient } from "../redis/redis";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { AppError } from "../lib/appError";
import { verifyRefreshCookie } from "../lib/cookie";

const RATE_LIMIT_WINDOW_SECONDS = Number(env.rate_limit_window_seconds);
const RATE_LIMIT_MAX_REQUEST = Number(env.auth_rate_limit_max_requests);
const REFRESH_COOKIE_RATE_LIMIT_MAX_REQUESTS = Number(
  env.refresh_rate_limit_max_requests,
);
const REFRESH_COOKIE_RATE_LIMIT_WINDOW_SECONDS = Number(
  env.refresh_rate_limit_window_seconds,
);
const TASKS_RATE_LIMIT_MAX_REQUESTS = Number(env.tasks_rate_limit_max_requests);

// export async function authRateLimit(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     const ip = req.ip || "unknown";
//     const authRateLimitKey = `rate_limit:auth:${ip}`;

//     const requestCount = await redisClient.incr(authRateLimitKey);

//     // Attach expiration window on the very first request
//     if (requestCount === 1) {
//       await redisClient.expire(authRateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
//     } else {
//       // guard against race conditions where a key loses its expiration window
//       const currentTtl = await redisClient.ttl(authRateLimitKey);
//       if (currentTtl === -1) {
//         await redisClient.expire(authRateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
//       }
//     }

//     res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUEST);
//     res.setHeader(
//       "X-RateLimit-Remaining",
//       Math.max(0, RATE_LIMIT_MAX_REQUEST - requestCount),
//     );

//     if (requestCount > RATE_LIMIT_MAX_REQUEST) {
//       logger.warn({ ip, requestCount }, "Rate limit threshold breached");
//       return res.status(429).json({
//         success: false,
//         message: "Too many requests. Please try again later",
//       });
//     }

//     next();
//   } catch (error) {
//     logger.error({ err: error }, "Rate limit evaluation failure");
//     next(error);
//   }
// }

// export async function taskRateLimit(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     const userId = req.user!.id;
//     const taskRateLimitKey = `rate_limit:task:${userId}`;

//     const requestCount = await redisClient.incr(taskRateLimitKey);

//     if (requestCount === 1) {
//       await redisClient.expire(taskRateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
//     } else {
//       const currentExpireTtl = await redisClient.ttl(taskRateLimitKey);
//       if (currentExpireTtl === -1) {
//         await redisClient.expire(taskRateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
//       }
//     }

//     res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUEST);
//     res.setHeader(
//       "X-RateLimit-Remaining",
//       Math.max(0, RATE_LIMIT_MAX_REQUEST - requestCount),
//     );

//     if (requestCount > RATE_LIMIT_MAX_REQUEST) {
//       logger.warn({ userId, requestCount }, "Rate limit threshold breached");
//       return res.status(429).json({
//         success: false,
//         message: "Too many requests. Please try again later",
//       });
//     }

//     next();
//   } catch (error) {
//     logger.error(
//       { err: error },
//       "Rate limit evaluation failure - Failing Open",
//     );
//     next();
//   }
// }

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  getIdentifier: (req: Request) => string | undefined;
  keyPrefix: string;
}

export function createGenericRateLimiter(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = options.getIdentifier(req);

      if (!identifier) {
        return next();
      }

      const rateLimitKey = `rate_limit:${options.keyPrefix}:${identifier}`;
      const rateLimitCount = await redisClient.incr(rateLimitKey);

      if (rateLimitCount === 1) {
        await redisClient.expire(rateLimitKey, options.windowSeconds);
      } else {
        const rateLimitTtl = await redisClient.ttl(rateLimitKey);
        if (rateLimitTtl === -1) {
          await redisClient.expire(rateLimitKey, options.windowSeconds);
        }
      }

      res.setHeader("X-RateLimit-Limit", options.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, options.maxRequests - rateLimitCount),
      );

      if (rateLimitCount > options.maxRequests) {
        logger.warn(
          { identifier, rateLimitCount, prefix: options.keyPrefix },
          "Rate limit threshold breached",
        );
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later",
        });
      }

      next();
    } catch (error) {
      logger.error(
        { err: error },
        "Rate limit evaluation failure - Failing Open",
      );
      next();
    }
  };
}

export const authenticationRateLimit = createGenericRateLimiter({
  windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  maxRequests: RATE_LIMIT_MAX_REQUEST,
  keyPrefix: "auth",
  getIdentifier: (req) => req.ip || "unknown",
});

export const tasksRateLimit = createGenericRateLimiter({
  windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  maxRequests: TASKS_RATE_LIMIT_MAX_REQUESTS,
  keyPrefix: "tasks",
  getIdentifier: (req) => req.user?.id,
});

export const refreshRateLimit = createGenericRateLimiter({
  windowSeconds: REFRESH_COOKIE_RATE_LIMIT_WINDOW_SECONDS,
  maxRequests: REFRESH_COOKIE_RATE_LIMIT_MAX_REQUESTS,
  keyPrefix: "refresh",
  getIdentifier: (req) => verifyRefreshCookie(req),
});
