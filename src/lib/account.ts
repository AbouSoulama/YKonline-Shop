import { supabase, isSupabaseConfigured } from "./supabase";
import type { CartItem } from "../context/CartContext";
import type { Order } from "./orders";

export interface Address {
  id: string;
  type: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface WishlistItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  oldPrice?: number;
  image: string;
}

function mapOrderStatus(status: string): string {
  const m: Record<string, string> = {
    pending: "Pending",
    paid: "Processing",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return m[status.toLowerCase()] ?? "Pending";
}

function statusColor(status: string): string {
  const s = mapOrderStatus(status);
  const colors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green/10 text-green",
    Cancelled: "bg-red-100 text-red-700",
  };
  return colors[s] ?? "bg-gray-100 text-gray-600";
}

export async function fetchUserOrders(userId: string, email: string): Promise<{
  ref: string;
  date: string;
  total: string;
  status: string;
  statusColor: string;
  items: { name: string; qty: number; price: string; image: string }[];
}[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`user_id.eq.${userId},customer_email.eq.${email}`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const items = (row.items as CartItem[]) ?? [];
    return {
      ref: `#${row.order_number ?? row.id.slice(0, 8)}`,
      date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      total: `$${Number(row.total).toFixed(2)}`,
      status: mapOrderStatus(row.status ?? "pending"),
      statusColor: statusColor(row.status ?? "pending"),
      items: items.map((i) => ({
        name: `${i.name} - ${i.size}`,
        qty: i.quantity,
        price: `$${(i.price * i.quantity).toFixed(2)}`,
        image: i.image,
      })),
    };
  });
}

export async function fetchAddresses(userId: string): Promise<Address[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    address: row.address,
    city: row.city ?? "",
    country: row.country ?? "",
    phone: row.phone ?? "",
    isDefault: row.is_default ?? false,
  }));
}

export async function saveAddress(userId: string, addr: Omit<Address, "id"> & { id?: string }): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  if (addr.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  }

  const payload = {
    user_id: userId,
    type: addr.type,
    address: addr.address,
    city: addr.city,
    country: addr.country,
    phone: addr.phone,
    is_default: addr.isDefault,
  };

  if (addr.id) {
    const { error } = await supabase.from("addresses").update(payload).eq("id", addr.id);
    return error ? { success: false, error: error.message } : { success: true };
  }

  const { error } = await supabase.from("addresses").insert(payload);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteAddress(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from("addresses").delete().eq("id", id);
}

export async function fetchWishlist(userId: string): Promise<WishlistItem[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("wishlist")
    .select("product_id, products(id, name, size, price, old_price, image)")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data
    .filter((row) => row.products)
    .map((row) => {
      const p = row.products as { id: string; name: string; size: string; price: number; old_price: number | null; image: string };
      return {
        productId: p.id,
        name: p.name,
        size: p.size,
        price: p.price,
        oldPrice: p.old_price ? Number(p.old_price) : undefined,
        image: p.image,
      };
    });
}

export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", userId).eq("product_id", productId).maybeSingle();
  if (data) {
    await supabase.from("wishlist").delete().eq("user_id", userId).eq("product_id", productId);
    return false;
  }
  await supabase.from("wishlist").insert({ user_id: userId, product_id: productId });
  return true;
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", userId).eq("product_id", productId).maybeSingle();
  return Boolean(data);
}

export async function updateProfile(userId: string, name: string, phone?: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  const { error } = await supabase.from("profiles").update({ name, phone: phone ?? null }).eq("id", userId);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error ? { success: false, error: error.message } : { success: true };
}

export type { Order };
