import { NextFunction, Request, Response } from "express";
import { appError } from "../lib/appError";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role === "ADMIN") {
    next(
      new appError(
        403,
        "Admin Access required. You do not have permission to perform this action",
      ),
    );

    return;
  }

  next();
}
