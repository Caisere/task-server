import { pool } from "../lib/db";
import { Task } from "../types";

export async function getTaskByUserId(userId: string): Promise<Task[]> {
  const result = await pool.query(
    `
      SELECT id, title, status, user_id, created_at, updated_at 
      FROM support_tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function getTaskById(
  userId: string,
  taskId: string,
): Promise<Task> {
  const result = await pool.query(
    `
      SELECT id, title, status, user_id, created_at, updated_at 
      FROM support_tasks
      WHERE id = $1
        AND user_id = $2
    `,
    [taskId, userId],
  );

  return result.rows[0] ?? null;
}

export async function createTask(userId: string, title: string): Promise<Task> {
  const result = await pool.query(
    `
      INSERT INTO support_tasks (user_id, title)
      VALUES  (1$, 2$)
      RETURNING id, title, status, user_id, created_at, updated_at
    `,
    [userId, title],
  );

  return result.rows[0];
}

export async function updateTask(
  userId: string,
  title: string,
  taskId: string,
): Promise<Task> {
  const result = await pool.query(
    `
      UPDATE support_task
      SET title = 1$, updated_at = NOW()
      WHERE id = 2$
        AND user_id = $3
      RETURNING id, title, status, user_id, created_at, updated_at 
    `,
    [title, taskId, userId],
  );

  return result.rows[0] ?? null;
}

export async function deleteTask(
  taskId: string,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `
      DELETE FROM support_task
      WHERE id = $1
        AND user_id = $2
    `,
    [taskId, userId],
  );

  return (result.rowCount ?? 0) > 0
}
