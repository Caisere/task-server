import { Request, Response, Router } from "express";

export const healthRoute = Router();

healthRoute.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Health Route is working",
  });
});
