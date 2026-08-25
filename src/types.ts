export type User = {
  id: string;
  email: string;
  role: string;
  created_at: Date;
};

export type DBUserRow = {
  id: string;
  email: string;
  role: string;
  created_at: Date;
};

export type DBUserWithPasswordRow = DBUserRow & {
  password_hash: string | null;
};

export type JwtPayload = {
  id: string;
  email: string;
  role: string;
};

export type Task = {
  id: string;
  title: string;
  status: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};


export type Banner = {
  id: string,
  image_url: string,
  cloudinary_public_id: string,
  created_at: Date,
  updated_at: Date
}
