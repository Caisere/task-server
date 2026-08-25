import multer from "multer";
import { AppError } from "../lib/appError";

export const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    // if (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError(400, "Only image upload is allowed"));
    }
    callback(null, true);
  },
});

export const uploadSingleBannerImage = upload.single("image");
