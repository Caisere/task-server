import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

export type FileUploadResponse = {
  secure_url: string;
  public_id: string;
};

cloudinary.config({
  cloud_name: env.cloudinary_cloud_name,
  api_key: env.cloudinary_cloud_api_key,
  api_secret: env.cloudinary_cloud_api_secret,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  options?: { folder?: string },
): Promise<FileUploadResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: options?.folder,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          secure_url: result?.secure_url ?? "",
          public_id: result?.public_id ?? "",
        });
      },
    );

    // sending raw image bytes to cloudinary
    uploadStream.end(buffer);
  });
}

export async function deleteBannerFromCloudinary(
  publicId: string,
): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
