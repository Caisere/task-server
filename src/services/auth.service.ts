import { PASSWORD_LENGTH } from "../constants/auth.constant";
import { appError } from "../lib/appError";
import { confirmPassword, hashPassword } from "../lib/bcrypt";
import { generateAccessToken } from "../lib/jwt";
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
} from "../repositories/user.repository";


// register
export async function registerUser(
  email: string,
  password: string,
): Promise<void> {
  if (!email || !password) {
    throw new appError(400, "Email and Password are required");
  }

  if (password.length < PASSWORD_LENGTH) {
    throw new appError(
      400,
      `Password must be at least ${PASSWORD_LENGTH} characters long...`,
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new appError(409, "User with email already exist");
  }

  // hash password
  const hashedPassword = await hashPassword(password);

  await createUser(normalizedEmail, hashedPassword);
}


// login
export async function loginUser(
  email: string,
  password: string,
): Promise<string> {
  if (!email || !password) {
    throw new appError(400, "Email and Password are required");
  }

  // normalise email
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmailWithPassword(normalizedEmail);

  if (!user.password_hash) {
    throw new appError(400, "Invalid email or password");
  }

  const confirmedPassword = await confirmPassword(password, user.password_hash);

  if (!confirmedPassword) {
    throw new appError(400, "Invalid email or password");
  }

  // sign-jwt
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return accessToken
}
