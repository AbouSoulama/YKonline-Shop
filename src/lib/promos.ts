import { supabase, isSupabaseConfigured } from "./supabase";

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: "percent" | "fixed";
  uses: number;
  maxUses: number;
  active: boolean;
  expires: string;
}

export interface PromoValidation {
  valid: boolean;
  code?: string;
  discount?: number;
  type?: "percent" | "fixed";
  error?: string;
}

export async function validatePromoCode(code: string, subtotal: number): Promise<PromoValidation> {
  const trimmed = code.trim();
  if (!trimmed) return { valid: false, error: "Enter a promo code." };

  if (!isSupabaseConfigured) {
    if (trimmed.toUpperCase() === "WELCOME10" && subtotal > 0) {
      return { valid: true, code: "WELCOME10", discount: subtotal * 0.1, type: "percent" };
    }
    return { valid: false, error: "Invalid or expired promo code." };
  }

  const { data, error } = await supabase.rpc("validate_promo_code", {
    p_code: trimmed,
    p_subtotal: subtotal,
  });

  if (error) return { valid: false, error: error.message };
  const result = data as { valid: boolean; code?: string; discount?: number; type?: string; error?: string };
  if (!result?.valid) return { valid: false, error: result?.error ?? "Invalid or expired promo code." };
  return {
    valid: true,
    code: result.code,
    discount: Number(result.discount),
    type: result.type as "percent" | "fixed",
  };
}

export async function fetchPromoCodes(): Promise<PromoCode[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: true });
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    code: row.code,
    discount: Number(row.discount),
    type: row.type as "percent" | "fixed",
    uses: row.uses ?? 0,
    maxUses: row.max_uses ?? 0,
    active: row.active ?? false,
    expires: row.expires_at
      ? new Date(row.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "No expiry",
  }));
}

export async function upsertPromoCode(promo: Omit<PromoCode, "id"> & { id?: string }): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  const payload = {
    code: promo.code.toUpperCase(),
    discount: promo.discount,
    type: promo.type,
    max_uses: promo.maxUses,
    active: promo.active,
    expires_at: promo.expires !== "No expiry" ? new Date(promo.expires).toISOString() : null,
  };

  if (promo.id) {
    const { error } = await supabase.from("promo_codes").update(payload).eq("id", promo.id);
    return error ? { success: false, error: error.message } : { success: true };
  }

  const { error } = await supabase.from("promo_codes").insert(payload);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function togglePromoActive(id: string, active: boolean): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from("promo_codes").update({ active }).eq("id", id);
}
