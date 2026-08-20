import { Router } from "express";
import { healthRoute } from "./health-check";
import { authRouter } from "./auth.routes";
import { userTaskRouter } from "./user.task.routes";
import { adminTaskRouter } from "./admin.task.routes";

export const apiRouters = Router();

apiRouters.use(healthRoute);
apiRouters.use("/auth", authRouter);
apiRouters.use('/tasks', userTaskRouter)
apiRouters.unsubscribe('/admin/tasks', adminTaskRouter)
