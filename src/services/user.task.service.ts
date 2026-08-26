import { env } from "../config/env";
import { AppError } from "../lib/appError";
import {
  createCacheKeyWithUserIdAndTaskId,
  createUserTaskListCacheKey,
  invalidateAdminCache,
  invalidateTaskCachesForAdminAndUser,
  invalidateUserTaskCache,
} from "../lib/cache-helper";
import { redisClient, setDataToRedis } from "../redis/redis";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTaskByUserId,
  updateTask,
} from "../repositories/user.task.respository";
import { Task } from "../types";

const CACHE_EXPIRY_TIME = Number(env.cache_expiry);

function validateTitle(title: unknown): string {
  if (typeof title !== "string") {
    throw new AppError(400, "Invalid title property");
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length > 100) {
    throw new AppError(400, "Title can't be more than 100 characters");
  }

  return trimmedTitle;
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  const USER_CACHED_TASKLISTS = createUserTaskListCacheKey(userId);

  const userCachedTaskList = await redisClient.get(USER_CACHED_TASKLISTS);

  if (userCachedTaskList) {
    return JSON.parse(userCachedTaskList) as Task[];
  }

  const tasks = await getTaskByUserId(userId);

  if (!tasks.length) {
    throw new AppError(
      400,
      "No tasks for this user yet. Proceed to create task...",
    );
  }

  await setDataToRedis(USER_CACHED_TASKLISTS, tasks);

  return tasks;
}

export async function getUserTaskById(
  userId: string,
  taskId: string,
): Promise<Task> {
  const USER_CACHED_TASK = createCacheKeyWithUserIdAndTaskId(userId, taskId);

  const cachedUserTask = await redisClient.get(USER_CACHED_TASK);

  if (cachedUserTask) {
    return JSON.parse(cachedUserTask) as Task;
  }

  const task = await getTaskById(userId, taskId);

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  await setDataToRedis(USER_CACHED_TASK, task);

  return task;
}

export async function createUserTask(
  userId: string,
  title: unknown,
): Promise<Task> {
  const validatedTitle = validateTitle(title);

  const newTask = await createTask(userId, validatedTitle);

  await Promise.all([invalidateAdminCache(), invalidateUserTaskCache(userId)]);

  return newTask;
}

export async function updateUserTask(
  userId: string,
  title: unknown,
  taskId: string,
): Promise<Task> {
  const valiatedTitle = validateTitle(title);

  const task = await updateTask(userId, valiatedTitle, taskId);

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  await invalidateTaskCachesForAdminAndUser(userId, taskId);

  return task;
}

export async function deleteUserTask(
  taskId: string,
  userId: string,
): Promise<void> {
  const deleted = await deleteTask(taskId, userId);

  if (!deleted) {
    throw new AppError(404, "Task not found");
  }

  await invalidateTaskCachesForAdminAndUser(userId, taskId);
}
