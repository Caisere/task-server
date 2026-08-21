import { redisClient } from "../redis/redis";

// ==========================================
// ADMIN HELPERS
// ==========================================
export const ADMIN_GET_ALL_CACHED_TASK_KEY = "admin:tasks:all";

export function createAdminTaskCacheKey(taskId: string) {
  return `admin:task:${taskId}`;
}

export async function invalidateAdminTaskCacheKey(taskId: string) {
  return await redisClient.del(createAdminTaskCacheKey(taskId));
}

// invalidate admin get all task cache
export async function invalidateAdminCache() {
  return await redisClient.del(ADMIN_GET_ALL_CACHED_TASK_KEY);
}

// ==========================================
// USER HELPERS
// ==========================================

// create user tasks list cache key
export function createUserTaskListCacheKey(userId: string) {
  return `user:${userId}:tasks:lists`;
}

// create cache key for individual tasks viewed by a User(using userId and taskId)
export function createCacheKeyWithUserIdAndTaskId(
  userId: string,
  taskId: string,
) {
  return `task:user:${userId}:task:${taskId}`;
}

// invalidate user-task lists cache
export async function invalidateUserTaskCache(userId: string) {
  await redisClient.del(createUserTaskListCacheKey(userId));
}

// invalidate user-task cache
export async function invalidateCacheWithUserIdAndTaskId(
  userId: string,
  taskId: string,
) {
  await redisClient.del(createCacheKeyWithUserIdAndTaskId(userId, taskId));
}

// =====================================================================
// SHARED HELPERS
// =====================================================================
export async function invalidateTaskCachesForAdminAndUser(
  userId: string,
  taskId: string,
) {
  await Promise.all([
    invalidateAdminCache(),
    invalidateUserTaskCache(userId),
    invalidateCacheWithUserIdAndTaskId(userId, taskId),
    invalidateAdminTaskCacheKey(taskId),
  ]);
}
