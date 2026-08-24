import { AppError } from "../lib/appError";
import { uploadToCloudinary } from "../lib/cloudinary";
import {
  createAdminBanner,
  getAdminBanners,
  getBannerById,
} from "../repositories/admin.banner.respository";
import { Banner } from "../types";

export async function getAdminBannerService(): Promise<Banner[]> {
  return getAdminBanners();
}

export async function getAdminBannerById(bannerId: string): Promise<Banner> {
  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

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

  return banner;
}
