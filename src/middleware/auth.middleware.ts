import { NextFunction, Request, Response } from "express";
import { appError } from "../lib/appError";
import { verifyAccessToken } from "../lib/jwt";
import { JwtPayload } from "../types";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new appError(401, "Access Token is required...");
  }

  const token = authHeader.split(" ")[1];

  req.user = verifyAccessToken(token) as JwtPayload;

  next();
}
