import { env } from "../config/env";
import { AppError } from "../lib/appError";
import {
  ADMIN_GET_ALL_CACHED_BANNER_KEY,
  createAdminBannerCacheKey,
  invalidateAdminBannerCache,
} from "../lib/cache-helper";
import { uploadToCloudinary } from "../lib/cloudinary";
import { logger } from "../lib/logger";
import { deleteCloudinaryImageJob } from "../queues/deleteCloudinaryImage.queue";
import { redisClient, setDataToRedis } from "../redis/redis";
import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
  getBannerById,
} from "../repositories/admin.banner.respository";
import { Banner } from "../types";

export async function getAdminBannerService(): Promise<Banner[]> {
  const cachedBanner = await redisClient.get(ADMIN_GET_ALL_CACHED_BANNER_KEY);

  if (cachedBanner) {
    return JSON.parse(cachedBanner) as Banner[];
  }

  const banners = await getAdminBanners();

  if (banners.length === 0) {
    throw new AppError(404, "No Banners created yet!");
  }

  await setDataToRedis(ADMIN_GET_ALL_CACHED_BANNER_KEY, banners);

  return banners;
}

export async function getAdminBannerById(bannerId: string): Promise<Banner> {
  const CACHED_BANNER_KEY = createAdminBannerCacheKey(bannerId);

  const cachedBanner = await redisClient.get(CACHED_BANNER_KEY);

  if (cachedBanner) {
    logger.info(`${cachedBanner}`);
    return JSON.parse(cachedBanner) as Banner;
  }

  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  await setDataToRedis(CACHED_BANNER_KEY, banner);

  return banner;
}

export async function createAdminBannerService(
  file: Express.Multer.File | undefined,
): Promise<Banner> {
  if (!file) {
    throw new AppError(400, "Image is required");
  }

  if (!file.buffer) {
    throw new AppError(400, "Invalid Image type");
  }

  const { secure_url, public_id } = await uploadToCloudinary(file.buffer, {
    folder: "task-server-project",
  });

  if (!secure_url || !public_id) {
    throw new AppError(500, "Cloudinary error occured");
  }

  const banner = await createAdminBanner({ secure_url, public_id });

  if (!banner) {
    throw new AppError(
      400,
      "Image successfully uploaded to cloud-storage, but error occured while uploading to the database",
    );
  }

  await invalidateAdminBannerCache();

  return banner;
}

export async function deleteAdminBannerService(
  bannerId: string,
): Promise<void> {
  const publicId = await deleteAdminBanner(bannerId);

  if (!publicId) {
    throw new AppError(404, "No banner found with the id supplied");
  }

  await invalidateAdminBannerCache();

  // delete BullMQ job
  await deleteCloudinaryImageJob(publicId)
}
