import { Router } from "express";
import { healthRoute } from "./health-check";
import { authRouter } from "./auth.routes";
import { userTaskRouter } from "./user.task.routes";
import { adminTaskRouter } from "./admin.task.routes";
import { adminBannerRouter } from "./admin.banner.routes";
import { requireCsrf } from "../middleware/auth.middleware";

export const apiRouters = Router();

apiRouters.use(healthRoute);
apiRouters.use("/auth", authRouter);
apiRouters.use("/tasks", requireCsrf, userTaskRouter);
apiRouters.use("/admin/tasks", requireCsrf, adminTaskRouter);
apiRouters.use("/admin/banner", requireCsrf, adminBannerRouter);
