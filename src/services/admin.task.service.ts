import { env } from "../config/env";
import { AppError } from "../lib/appError";
import {
  ADMIN_GET_ALL_CACHED_TASK_KEY,
  createAdminTaskCacheKey,
  invalidateTaskCachesForAdminAndUser,
} from "../lib/cache-helper";
import { redisClient } from "../redis/redis";
import {
  admGetTaskById,
  findAllTasks,
  updateTaskStatus,
} from "../repositories/admin.task.respository";
import { Task } from "../types";

type AdminTaskQueryList = {
  search?: string;
  status?: string;
};

type AdminTaskListResponse = {
  tasks: Task[];
};

const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

const GET_ALL_CACHED_TASK_EXPIRY = Number(env.cache_expiry);

export async function fetchAdminTask(
  query: AdminTaskQueryList,
): Promise<AdminTaskListResponse> {
  const trimmedSearch = query.search?.trim();
  const trimmedStatus = query.status?.trim().toUpperCase();

  if (trimmedStatus && !TASK_STATUSES.includes(trimmedStatus as TaskStatus)) {
    throw new AppError(
      400,
      "status must be between pending, in_progress, or resolved",
    );
  }
  const tasks = await findAllTasks({ trimmedSearch, trimmedStatus });

  return {
    tasks,
  };
}

export async function getAdminTask(
  query: AdminTaskQueryList,
): Promise<AdminTaskListResponse> {
  const hasFilter = Boolean(query.search || query.status);

  if (hasFilter) {
    const tasks = await fetchAdminTask(query);
    return tasks;
  }

  const cachedTasks = await redisClient.get(ADMIN_GET_ALL_CACHED_TASK_KEY);

  if (cachedTasks) {
    return JSON.parse(cachedTasks) as AdminTaskListResponse;
  }

  const tasks = await fetchAdminTask(query);

  // set to redis
  await redisClient.setEx(
    ADMIN_GET_ALL_CACHED_TASK_KEY,
    GET_ALL_CACHED_TASK_EXPIRY,
    JSON.stringify(tasks),
  );

  return tasks;
}

export async function adminGetTaskById(taskId: string): Promise<Task> {
  const TASK_CACHE_KEY = createAdminTaskCacheKey(taskId);
  const cachedTask = await redisClient.get(TASK_CACHE_KEY);

  if (cachedTask) {
    return JSON.parse(cachedTask) as Task;
  }

  const task = await admGetTaskById(taskId);

  if (!task) {
    throw new AppError(404, "task not found");
  }

  await redisClient.setEx(
    TASK_CACHE_KEY,
    GET_ALL_CACHED_TASK_EXPIRY,
    JSON.stringify(task),
  );

  return task;
}

export async function adminUpdateTask(
  taskId: string,
  status: unknown,
): Promise<Task> {
  if (
    typeof status !== "string" ||
    !TASK_STATUSES.includes(status as TaskStatus)
  ) {
    throw new AppError(
      400,
      "status must be between pending, in_progress, or resolved",
    );
  }

  const task = await updateTaskStatus(taskId, status);

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  await invalidateTaskCachesForAdminAndUser(task.user_id, taskId);

  return task;
}
