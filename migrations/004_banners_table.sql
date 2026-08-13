CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_randon_uuid(),

  image_url TEXT NOT NULL,

  cloudinary_public_id TEXT NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);