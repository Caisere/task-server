import { Router } from "express";
import { healthRoute } from "./health-check";
import { authRouter } from "./auth.routes";

export const apiRouters = Router();

apiRouters.use(healthRoute);
apiRouters.use("/auth", authRouter);
