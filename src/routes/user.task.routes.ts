import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createUserTask,
  deleteUserTask,
  getUserTaskById,
  getUserTasks,
  updateUserTask,
} from "../services/user.task.service";
import { tasksRateLimit } from "../middleware/rateLimit.middleware";

export const userTaskRouter = Router();

userTaskRouter.use(authenticate, tasksRateLimit);

userTaskRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const tasks = await getUserTasks(userId);

    return res.status(200).json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;

    const task = await getUserTaskById(userId, taskId);

    return res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.post("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const title = req.body.title;

    const task = await createUserTask(userId, title);

    return res.status(201).json({
      success: true,
      message: "Task created successfully...",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.patch("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const title = req.body.title;
    const taskId = req.params.id;

    const task = await updateUserTask(userId, title, taskId);

    return res.status(201).json({
      success: true,
      message: "Task updated successfully...",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;

    await deleteUserTask(taskId, userId);

    return res.status(204).json({
      success: true,
      message: "Task deleted successfully...",
    });
  } catch (error) {
    next(error);
  }
});
