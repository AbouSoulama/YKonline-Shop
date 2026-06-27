import { supabase, isSupabaseConfigured } from "./supabase";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "Please upload a JPG, PNG, WebP or GIF image.";
  if (file.size > MAX_SIZE) return "Image must be smaller than 5 MB.";
  return null;
}

export async function uploadProductImage(
  file: File,
  productId: string,
  slot: number,
): Promise<{ url: string } | { error: string }> {
  if (!isSupabaseConfigured) return { error: "Database not configured." };

  const validation = validateImageFile(file);
  if (validation) return { error: validation };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/img-${slot}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
