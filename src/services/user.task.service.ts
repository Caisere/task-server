import { AppError } from "../lib/appError";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTaskByUserId,
  updateTask,
} from "../repositories/user.task.respository";
import { Task } from "../types";

function validateTitle(title: unknown): string {
  if (typeof title !== "string") {
    throw new AppError(400, "Invalid title property");
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length > 100) {
    throw new AppError(400, "Title can't be more that 100 characters");
  }

  return trimmedTitle;
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  return getTaskByUserId(userId);
}

export async function getUserTaskById(
  userId: string,
  taskId: string,
): Promise<Task> {
  const task = await getTaskById(userId, taskId);

  if (!task) {
    throw new AppError(404, "task not found");
  }

  return task;
}

export async function createUserTask(
  userId: string,
  title: unknown,
): Promise<Task> {
  const validatedTitle = validateTitle(title);

  return createTask(userId, validatedTitle);
}

export async function updateUserTask(
  userId: string,
  title: unknown,
  taskId: string,
): Promise<Task> {
  const valiatedTitle = validateTitle(title);

  const task = updateTask(userId, valiatedTitle, taskId);

  if (!task) {
    throw new AppError(404, "task not found");
  }

  return task;
}

export async function deleteUserTask(
  taskId: string,
  userId: string,
): Promise<void> {
  const deleted = await deleteTask(taskId, userId);

  if (!deleted) {
    throw new AppError(404, "task not found");
  }
}
