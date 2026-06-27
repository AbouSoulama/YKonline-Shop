import { supabase, isSupabaseConfigured } from "./supabase";
import type { Product } from "../data/products";
import { slugify } from "../constants/site";

interface ProductRow {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  price: number;
  old_price: number | null;
  size: string | null;
  type: string | null;
  usage: string[] | null;
  image: string | null;
  gallery: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  stock: number | null;
  badge: string | null;
  ingredients: string | null;
  storage: string | null;
  benefits: string[] | null;
  how_to_use: { area: string; method: string }[] | null;
  created_at?: string | null;
}

interface ProductRowWithDate extends ProductRow {
  created_at?: string | null;
}

export function mapProductRow(row: ProductRowWithDate): Product {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    longDescription: row.long_description ?? "",
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    size: row.size ?? "",
    type: (row.type as Product["type"]) ?? "Raw",
    usage: row.usage ?? [],
    image: row.image ?? "",
    gallery: row.gallery ?? (row.image ? [row.image] : []),
    rating: Number(row.rating ?? 0),
    reviews: row.reviews_count ?? 0,
    stock: row.stock ?? 0,
    badge: row.badge ?? undefined,
    ingredients: row.ingredients ?? "",
    storage: row.storage ?? "",
    benefits: row.benefits ?? [],
    howToUse: row.how_to_use ?? [],
    createdAt: row.created_at ?? undefined,
  };
}

function rowFromProduct(p: Product) {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    long_description: p.longDescription || p.description,
    price: p.price,
    old_price: p.oldPrice ?? null,
    size: p.size,
    type: p.type,
    usage: p.usage,
    image: p.image,
    gallery: p.gallery?.length ? p.gallery : [p.image],
    rating: p.rating,
    reviews_count: p.reviews,
    stock: p.stock,
    badge: p.badge ?? null,
    ingredients: p.ingredients,
    storage: p.storage,
    benefits: p.benefits ?? [],
    how_to_use: p.howToUse ?? [],
  };
}

export function generateProductId(name: string, size: string): string {
  const base = slugify(`${name}-${size}`);
  return base || `product-${Date.now()}`;
}

export async function upsertProduct(product: Product, isNew = false): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  const row = rowFromProduct(product) as Record<string, unknown>;
  if (isNew) row.created_at = new Date().toISOString();

  const { error } = await supabase.from("products").upsert(row);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function fetchProductStock(id: string): Promise<number | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.from("products").select("stock").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data.stock ?? 0;
}
