import { Request } from "express";
import { PASSWORD_LENGTH } from "../constants/auth.constant";
import { AppError } from "../lib/appError";
import { confirmPassword, hashPassword } from "../lib/bcrypt";
import { generateAccessToken, verifyRefreshToken } from "../lib/jwt";
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
} from "../repositories/user.repository";
import { JwtPayload } from "../types";

// register
export async function registerUser(
  email: string,
  password: string,
): Promise<void> {
  if (!email || !password) {
    throw new AppError(400, "Email and Password are required");
  }

  if (password.length < PASSWORD_LENGTH) {
    throw new AppError(
      400,
      `Password must be at least ${PASSWORD_LENGTH} characters long...`,
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError(409, "User with email already exist");
  }

  // hash password
  const hashedPassword = await hashPassword(password);

  await createUser(normalizedEmail, hashedPassword);
}

// login
export async function loginUser(
  email: string,
  password: string,
): Promise<JwtPayload> {
  if (!email || !password) {
    throw new AppError(400, "Email and Password are required");
  }

  // normalise email
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmailWithPassword(normalizedEmail);

  if (!user || !user.password_hash) {
    throw new AppError(400, "Invalid email or password");
  }

  const confirmedPassword = await confirmPassword(password, user.password_hash);

  if (!confirmedPassword) {
    throw new AppError(400, "Invalid email or password");
  }

  // sign-jwt
  // const accessToken = generateAccessToken({
  //   id: user.id,
  //   email: user.email,
  //   role: user.role,
  // });

  // return accessToken
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return payload;
}

export async function validateRefreshToken(req: Request): Promise<JwtPayload> {
  const refreshToken = req.cookies?.["refresh_cookie"];

  if (!refreshToken) {
    throw new AppError(401, "No refresh token provided");
  }

  // sync — throws on invalid/expired token, caught by the try/catch
  const decoded = verifyRefreshToken(refreshToken);

  // confirm the user/token is still valid
  const user = await findUserByEmail(decoded.email);
  if (!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return payload;
}
