import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/appError";
import { verifyAccessToken } from "../lib/jwt";
import { JwtPayload } from "../types";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // const authHeader = req.headers.authorization;

  // if (!authHeader?.startsWith("Bearer ")) {
  //   throw new appError(401, "Access Token is required...");
  // }

  // const accessToken = authHeader.split(" ")[1];
  const accessToken = req.cookies?.['access_cookie'];

  if (!accessToken) {
    throw new AppError(401, 'Authorized')
  }

  req.user = verifyAccessToken(accessToken) as JwtPayload;

  next();
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  // automatic bypass safe operations
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies?.["csrf_token"];
  const csrfHeader = req.header("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw new AppError(403, "Invalid csrf token");
  }

  next();
}
