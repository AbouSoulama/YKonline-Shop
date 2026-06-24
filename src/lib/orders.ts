import { supabase, isSupabaseConfigured } from "./supabase";
import type { CartItem } from "../context/CartContext";

export interface OrderPayload {
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  shippingDistanceKm: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
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
  createdAt: string;
}

function generateOrderNumber(): string {
  return `YK-${Date.now().toString().slice(-8)}`;
}

export async function createOrder(payload: OrderPayload): Promise<{ orderId: string; orderNumber: string } | null> {
  if (!isSupabaseConfigured) return null;

  const orderNumber = generateOrderNumber();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: payload.userId ?? null,
      customer_email: payload.customerEmail,
      customer_name: payload.customerName,
      items: payload.items,
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

  if (error || !data) return null;
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
    createdAt: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from("orders").update({ status }).eq("id", id);
}

export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    customerEmail: data.customer_email ?? "",
    customerName: data.customer_name ?? "",
    total: Number(data.total),
    shippingCost: Number(data.shipping_cost ?? 0),
    status: data.status ?? "pending",
    paymentMethod: data.payment_method ?? "",
    items: data.items as CartItem[],
    createdAt: new Date(data.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

export async function markOrderPaid(orderId: string, stripeSessionId?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from("orders").update({
    status: "paid",
    stripe_session_id: stripeSessionId ?? null,
  }).eq("id", orderId);
}
