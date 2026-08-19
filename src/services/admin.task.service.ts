import { AppError } from "../lib/appError";
import {
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

export async function getAdminTask(
  query: AdminTaskQueryList,
): Promise<AdminTaskListResponse> {
  const trimmedSearch = query.search?.trim();
  const trimmedStatus = query.status?.trim().toUpperCase();

  if (trimmedStatus && !TASK_STATUSES.includes(trimmedStatus as TaskStatus)) {
    throw new AppError(
      400,
      "status must be between open, in_progress, or resolved",
    );
  }

  const tasks = await findAllTasks({ trimmedSearch, trimmedStatus });

  return {
    tasks,
  };
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

  return task;
}
