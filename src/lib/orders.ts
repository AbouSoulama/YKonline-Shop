import { supabase, isSupabaseConfigured } from "./supabase";
import type { CartItem } from "../context/CartContext";

export interface OrderPayload {
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shippingCost: number;
  shippingDistanceKm: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  userId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  shippingCost: number;
  status: string;
  paymentMethod: string;
  items: CartItem[];
  shippingAddress?: OrderPayload["shippingAddress"];
  createdAt: string;
}

function generateOrderNumber(): string {
  return `YK-${Date.now().toString().slice(-8)}`;
}

export async function createOrder(payload: OrderPayload): Promise<{ orderId: string; orderNumber: string } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Database not configured. Please contact support." };
  }

  const orderNumber = generateOrderNumber();
  const userId = payload.userId?.startsWith("local-") ? null : (payload.userId ?? null);

  const rpcPayload = {
    p_user_id: userId,
    p_customer_email: payload.customerEmail,
    p_customer_name: payload.customerName,
    p_items: payload.items,
    p_subtotal: payload.subtotal,
    p_discount_amount: payload.discount,
    p_promo_code: payload.promoCode ?? null,
    p_total: payload.total,
    p_shipping_cost: payload.shippingCost,
    p_shipping_distance_km: payload.shippingDistanceKm,
    p_shipping_address: payload.shippingAddress,
    p_payment_method: payload.paymentMethod,
    p_order_number: orderNumber,
  };

  const { data: rpcData, error: rpcError } = await supabase.rpc("create_order", rpcPayload);

  if (!rpcError && rpcData?.id) {
    return { orderId: rpcData.id as string, orderNumber: rpcData.order_number as string };
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke("create-order", {
    body: {
      ...payload,
      orderNumber,
      userId,
    },
  });

  if (!fnError && fnData?.orderId) {
    return { orderId: fnData.orderId, orderNumber: fnData.orderNumber };
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_email: payload.customerEmail,
      customer_name: payload.customerName,
      items: payload.items,
      subtotal: payload.subtotal,
      discount_amount: payload.discount,
      promo_code: payload.promoCode ?? null,
      total: payload.total,
      shipping_cost: payload.shippingCost,
      shipping_distance_km: payload.shippingDistanceKm,
      shipping_address: payload.shippingAddress,
      payment_method: payload.paymentMethod,
      status: "pending",
      order_number: orderNumber,
    })
    .select("id, order_number")
    .single();

  if (error || !data) {
    return { error: error?.message || fnData?.error || rpcError?.message || "Unable to create order. Please try again." };
  }
  return { orderId: data.id, orderNumber: data.order_number };
}

export async function fetchOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    id: row.id,
    orderNumber: row.order_number ?? row.id.slice(0, 8),
    customerEmail: row.customer_email ?? "",
    customerName: row.customer_name ?? "",
    total: Number(row.total),
    shippingCost: Number(row.shipping_cost ?? 0),
    status: row.status ?? "pending",
    paymentMethod: row.payment_method ?? "",
    items: row.items as CartItem[],
    shippingAddress: row.shipping_address as OrderPayload["shippingAddress"] | undefined,
    createdAt: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from("orders").update({ status }).eq("id", id);

  if (status === "shipped" || status === "delivered") {
    void notifyOrderPlaced(id, status);
  }
}

export type OrderNotifyType = "created" | "paid" | "shipped" | "delivered";

function mapRowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    orderNumber: (row.order_number ?? row.orderNumber) as string,
    customerEmail: (row.customer_email ?? row.customerEmail ?? "") as string,
    customerName: (row.customer_name ?? row.customerName ?? "") as string,
    total: Number(row.total),
    shippingCost: Number(row.shipping_cost ?? row.shippingCost ?? 0),
    status: (row.status ?? "pending") as string,
    paymentMethod: (row.payment_method ?? row.paymentMethod ?? "") as string,
    items: row.items as CartItem[],
    shippingAddress: (row.shipping_address ?? row.shippingAddress) as OrderPayload["shippingAddress"] | undefined,
    createdAt: new Date(row.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

export async function trackOrderByEmail(orderNumber: string, email: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;

  const normalizedNumber = orderNumber.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: rpcData, error: rpcError } = await supabase.rpc("track_order", {
    p_order_number: normalizedNumber,
    p_email: normalizedEmail,
  });

  if (!rpcError && rpcData) {
    return mapRowToOrder(rpcData as Record<string, unknown>);
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke("track-order", {
    body: { orderNumber: normalizedNumber, email: normalizedEmail },
  });

  if (!fnError && fnData?.order) {
    return mapRowToOrder(fnData.order as Record<string, unknown>);
  }

  return null;
}

export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !data) return null;

  return mapRowToOrder(data);
}

export async function markOrderPaid(orderId: string, stripeSessionId?: string, paymentMethod?: string): Promise<{ success: boolean; notified?: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  const { data, error } = await supabase.functions.invoke("mark-order-paid", {
    body: { orderId, stripeSessionId, paymentMethod },
  });

  if (error) return { success: false, error: error.message };
  if (data?.error) return { success: false, error: data.error as string };
  return { success: true, notified: data?.notified as boolean | undefined };
}

async function invokeNotifyOrderApi(orderId: string, type: OrderNotifyType): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, type }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      return { success: false, error: payload.error || payload.errors?.join("; ") || "Email API failed." };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Email API failed." };
  }
}

export async function notifyOrderPlaced(orderId: string, type: OrderNotifyType = "created"): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Database not configured." };

  // Vercel API first (reliable when RESEND keys are on Vercel)
  const apiResult = await invokeNotifyOrderApi(orderId, type);
  if (apiResult.success) return { success: true };

  const { data, error } = await supabase.functions.invoke("notify-order", { body: { orderId, type } });
  if (!error && data?.success) return { success: true };

  const edgeError = error?.message || (data?.error as string) || (data?.errors as string[])?.join("; ");
  return { success: false, error: apiResult.error || edgeError || "Unable to send order emails." };
}

export async function validateCartStock(items: CartItem[]): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  for (const item of items) {
    const { data } = await supabase.from("products").select("stock, name").eq("id", item.id).maybeSingle();
    if (!data) continue;
    if ((data.stock ?? 0) < item.quantity) {
      return `Insufficient stock for ${data.name}. Only ${data.stock ?? 0} available.`;
    }
  }
  return null;
}
