import { supabase } from "@/integrations/supabase/client";

export const IMAGE_BUCKET = "catalogue";
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024;

/** Uploads one image to secure storage and returns the public reference to store in the database. */
export async function uploadImage(file: File, folder: "products" | "categories" | "banners") {
  if (!ALLOWED.includes(file.type.toLowerCase())) {
    throw new Error("Unsupported image format. Please use JPG, PNG, WEBP, AVIF or GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large. Please upload a file under 10 MB.");
  }
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error("Image upload failed. Please try again.");
  return `/api/public/images/${path}`;
}

export async function uploadImages(files: File[], folder: "products" | "categories" | "banners") {
  const urls: string[] = [];
  for (const file of files) urls.push(await uploadImage(file, folder));
  return urls;
}
