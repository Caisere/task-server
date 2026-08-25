import { env } from "../config/env";
import { AppError } from "../lib/appError";
import {
  ADMIN_GET_ALL_CACHED_BANNER_KEY,
  createAdminBannerCacheKey,
  invalidateAdminBannerCache,
} from "../lib/cache-helper";
import { uploadToCloudinary } from "../lib/cloudinary";
import { logger } from "../lib/logger";
import { redisClient } from "../redis/redis";
import {
  createAdminBanner,
  getAdminBanners,
  getBannerById,
} from "../repositories/admin.banner.respository";
import { Banner } from "../types";

const CACHE_EXPIRY_TIME = Number(env.cache_expiry);

export async function getAdminBannerService(): Promise<Banner[]> {
  const cachedBanner = await redisClient.get(ADMIN_GET_ALL_CACHED_BANNER_KEY);

  if (cachedBanner) {
    return JSON.parse(cachedBanner) as Banner[];
  }

  const banners = await getAdminBanners();

  if (banners.length === 0) {
    throw new AppError(404, "No Banners created yet!");
  }

  await redisClient.setEx(
    ADMIN_GET_ALL_CACHED_BANNER_KEY,
    CACHE_EXPIRY_TIME,
    JSON.stringify(banners),
  );

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

  await redisClient.setEx(
    CACHED_BANNER_KEY,
    CACHE_EXPIRY_TIME,
    JSON.stringify(banner),
  );

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
