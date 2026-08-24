import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { uploadSingleBannerImage } from "../middleware/banner.middleware";
import {
  createAdminBannerService,
  getAdminBannerById,
  getAdminBannerService,
} from "../services/admin.banner.service";

export const adminBannerRouter = Router();

adminBannerRouter.use(authenticate, requireAdmin);

adminBannerRouter.get("/", async (_req, res, next) => {
  try {
    const banners = await getAdminBannerService();

    res.status(200).json({
      success: true,
      message: "All Admin Banners",
      data: {
        banners,
      },
    });
  } catch (error) {
    next(error);
  }
});

adminBannerRouter.get("/:bannerId", async (req, res, next) => {
  try {
    const bannerId = req.params.bannerId;
    const banner = await getAdminBannerById(bannerId);

    res.status(200).json({
      success: true,
      data: {
        banner,
      },
    });
  } catch (error) {
    next(error);
  }
});

adminBannerRouter.post("/", uploadSingleBannerImage, async (req, res, next) => {
  try {
    const file = req.file;
    const banner = await createAdminBannerService(file);

    res.status(201).json({
      success: true,
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
});
