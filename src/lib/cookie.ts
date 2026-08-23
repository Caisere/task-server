import { CookieOptions, Response, Request } from "express";
import { env } from "../config/env";
import { JwtPayload } from "../types";
import {
  generateAccessToken,
  generateCsrfToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./jwt";

const ACCESS_COOKIE = "access_cookie";
const REFRESH_COOKIE = "refresh_cookie";
const CSRF_COOKIE = "csrf_token";

const COOKIE_SAME_SITE =
  env.cookie_same_site === "strict" ||
  env.cookie_same_site === "none" ||
  env.cookie_same_site === "lax"
    ? env.cookie_same_site
    : "lax";

function createCookieOptions(maxAge: number, csrf?: boolean): CookieOptions {
  return {
    httpOnly: !csrf,
    sameSite: COOKIE_SAME_SITE,
    secure: env.isProduction,
    maxAge,
    path: "/",
  };
}

export function setAuthCookies(res: Response, payload: JwtPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const csrfToken = generateCsrfToken();

  const accessMaxAge = 15 * 60 * 1000;
  const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie(ACCESS_COOKIE, accessToken, createCookieOptions(accessMaxAge));
  res.cookie(REFRESH_COOKIE, refreshToken, createCookieOptions(refreshMaxAge));
  res.cookie(CSRF_COOKIE, csrfToken, createCookieOptions(refreshMaxAge, true));
}

export function clearAuthCookies(res: Response) {
  const clearOptions: CookieOptions = {
    sameSite: COOKIE_SAME_SITE,
    secure: Boolean(env.cookie_secure || true),
    path: "/",
  };

  res.clearCookie(ACCESS_COOKIE, clearOptions);
  res.clearCookie(REFRESH_COOKIE, clearOptions);
  res.clearCookie(CSRF_COOKIE, clearOptions);
}

export function verifyRefreshCookie(req: Request): string | undefined {
  const refreshToken = req.cookies?.["refresh_cookie"];
  if (!refreshToken) return undefined;

  try {
    const user = verifyRefreshToken(refreshToken);
    return user.id;
  } catch (error) {
    return undefined;
  }
}
