import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types";
import { AppError } from "./appError";
import crypto from "crypto";

const accessTokenOptions = {
  expiresIn: env.access_token_expiry_time,
} as SignOptions;

const refreshTokenOptions = {
  expiresIn: env.refresh_token_expiry_time,
} as SignOptions;

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.access_token_secret_key, accessTokenOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.refresh_token_secret_key, refreshTokenOptions);
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.access_token_secret_key) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "Session expired, please log in again");
    }
    throw new AppError(401, "Invalid or Expired Token...");
  }
}

export function verifyRefreshToken(refreshToken: string): JwtPayload {
  try {
    return jwt.verify(refreshToken, env.refresh_token_secret_key) as JwtPayload;
  } catch (error) {
    throw new AppError(401, "Invalid or Expired Token...");
  }
}
