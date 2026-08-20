import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { adminUpdateTask, getAdminTask } from "../services/admin.task.service";

export const adminTaskRouter = Router();

adminTaskRouter.use(authenticate, requireAdmin);

adminTaskRouter.get("/", async (req, res, next) => {
  try {
    const query = req.query;
    const tasks = await getAdminTask(query);

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

adminTaskRouter.patch("/:taskId/status", async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const status = req.body;
    const task = await adminUpdateTask(taskId, status);

    return res.status(200).json({
      success: true,
      message: `Status for task with taskId: ${taskId} updated successfully!`,
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
});
