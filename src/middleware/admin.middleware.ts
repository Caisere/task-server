import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/appError";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role === "ADMIN") {
    next(
      new AppError(
        403,
        "Admin Access required. You do not have permission to perform this action",
      ),
    );

    return;
  }

  next();
}
