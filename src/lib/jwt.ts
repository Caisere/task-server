import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types";
import { appError } from "./appError";

const options = {
  expiresIn: env.jwt_expiry_time,
} as SignOptions;

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt_secret_key, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.jwt_secret_key) as JwtPayload;
  } catch (error) {
    throw new appError(401, "Invalid or Expired Token...");
  }
}
