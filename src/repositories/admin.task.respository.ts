import { pool } from "../lib/db";
import { Task } from "../types";

type AdminTaskListFilters = {
  trimmedSearch?: string;
  trimmedStatus?: string;
};

export async function findAllTasks(
  filters: AdminTaskListFilters,
): Promise<Task[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  let paramIndex = 1;

  if (filters.trimmedSearch) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${filters.trimmedSearch}%`);
    paramIndex++;
  }

  if (filters.trimmedStatus) {
    conditions.push(`status = $${paramIndex}`);
    values.push(filters.trimmedStatus);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT id, title, status, user_id, created_at, updated_at
      FROM support_tasks
      ${whereClause}
      ORDER BY created_at DESC
    `,
    values,
  );

  return result.rows;
}

export async function admGetTaskById(taskId: string): Promise<Task> {
  const result = await pool.query<Task>(
    `
      SELECT id, title, status, user_id, created_at, updated_at
      FROM support_tasks
      WHERE id = $1
    `,
    [taskId],
  );

  return result.rows[0] || null;
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
): Promise<Task> {
  const result = await pool.query<Task>(
    `
      UPDATE support_tasks
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, status, user_id, created_at, updated_at
    `,
    [status, taskId],
  );

  return result.rows[0] ?? null;
}
