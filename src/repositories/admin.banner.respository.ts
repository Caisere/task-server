import { pool } from "../lib/db";
import { Banner } from "../types";

type CreateAdminBannerType = {
  secure_url: string;
  public_id: string;
};

// admin get all banners
export async function getAdminBanners(): Promise<Banner[]> {
  const result = await pool.query<Banner>(
    `
      SELECT id, image_url, cloudinary_public_id, created_at, updated_at
      FROM banners
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
}

// admin get individual banner function
export async function getBannerById(bannerId: string): Promise<Banner> {
  const result = await pool.query<Banner>(
    `
      SELECT id, image_url, cloudinary_public_id, created_at, updated_at
      FROM banners
      WHERE id = $1
    `,
    [bannerId],
  );

  return result.rows[0] ?? null;
}

// admin create banner
export async function createAdminBanner({
  secure_url,
  public_id,
}: CreateAdminBannerType): Promise<Banner | null> {
  const result = await pool.query<Banner>(
    `
      INSERT INTO banners (image_url, cloudinary_public_id)
      VALUES ($1, $2)
      RETURNING id, image_url, cloudinary_public_id, created_at, updated_at
    `,
    [secure_url, public_id],
  );

  return result.rows[0] ?? null;
}
