import bcrypt from "bcrypt";
import { HASH_SALT } from "../constants/auth.constant";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, HASH_SALT);
}

export async function confirmPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
