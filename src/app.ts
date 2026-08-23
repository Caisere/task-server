import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import cors from "cors";
import { env } from "./config/env";
import { apiRouters } from "./routes";
import cookieParser from 'cookie-parser'

const corsOptions = {
  origin: env.allowOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
};

export function createApp() {
  const app = express();

  // middleware
  app.set("trust proxy", true); 
  app.use(cors(corsOptions));
  app.use(cookieParser())
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRouters);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
