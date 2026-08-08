import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function notFound(
  _req: Request,
  res: Response,
): void {
  res.status(404).json({
    success: false,
    message: "Route not Found",
  });
}
