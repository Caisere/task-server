import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { appError } from "../lib/appError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, "unhandled error");

  if (err instanceof appError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
