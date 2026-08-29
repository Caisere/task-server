import { pool } from "../lib/db";
import { DBUserRow, DBUserWithPasswordRow, User } from "../types";

// find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<DBUserRow>(
    "SELECT id, email, role, created_at FROM users WHERE email = $1",
    [email],
  );

  return result.rows[0];
}

// create new user
export async function createUser(
  email: string,
  password: string,
): Promise<User> {
  const result = await pool.query<DBUserRow>(
    `
      INSERT INTO users (email, password_hash) 
      VALUES ($1, $2)
      RETURNING (id, email, role, created_at)
    `,
    [email, password],
  );

  return result.rows[0];
}

// find user with password returned data
export async function findUserByEmailWithPassword(
  email: string,
): Promise<DBUserWithPasswordRow> {
  const result = await pool.query<DBUserWithPasswordRow>(
    `
      SELECT id, email, password_hash, role, created_at
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
}

export async function findUserByGoogleId(
  googleId: string,
): Promise<User | null> {
  const result = await pool.query<User>(
    `
      SELECT id, email, role, created_at
      FROM users
      WHERE google_id = $1
    `,
    [googleId],
  );

  return result.rows[0] ?? null;
}

export async function linkGoogleIdToUser(
  userId: string,
  googleId: string,
): Promise<User> {
  const result = await pool.query<DBUserRow>(
    `
      UPDATE user
      SET google_id = $1, updated_at = NOW()
      FROM users
      WHERE id = $2
      RETURNING id, email, role, created_at
    `,
    [googleId, userId],
  );

  return result.rows[0];
}

export async function createGoogleUser(
  email: string,
  googleId: string,
): Promise<User> {
  const result = await pool.query<DBUserRow>(
    `
      INSERT INTO users (email, google_id)
      VALUES ($1, $2)
      RETURNING id, email, role, created_at
    `, [email, googleId]
  );

  return result.rows[0];
}
