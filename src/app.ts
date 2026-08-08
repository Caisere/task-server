import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import cors from "cors";
import { env } from "./config/env";
import { apiRouters } from "./routes";

const corsOptions = {
  origin: env.allowOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

export function createApp() {
  const app = express();

  // middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRouters);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
