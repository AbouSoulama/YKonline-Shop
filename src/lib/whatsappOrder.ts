import { ADMIN_WHATSAPP } from "../constants/site";
import type { CartItem } from "../context/CartContext";

const WA_ORDER_KEY = "yk_wa_order_url";

export interface OrderWhatsAppDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  items: Array<{ name: string; quantity: number; price: number; size?: string }>;
  subtotal?: number;
  discount?: number;
  shippingCost: number;
  tax?: number;
  total: number;
  paymentMethod?: string;
  shippingAddress?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
}

function formatMoney(n: number) {
  return `$${Number(n).toFixed(2)}`;
}

export function buildPaidOrderWhatsAppMessage(details: OrderWhatsAppDetails): string {
  const lines: string[] = [
    "✅ NEW PAID ORDER — YKonline Shop",
    `Order #${details.orderNumber}`,
    `Customer: ${details.customerName}`,
    `Email: ${details.customerEmail}`,
  ];

  if (details.phone || details.shippingAddress?.phone) {
    lines.push(`Phone: ${details.phone || details.shippingAddress?.phone}`);
  }

  const addr = details.shippingAddress;
  if (addr) {
    lines.push(
      "Ship to:",
      [addr.address, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(", "),
    );
  }

  lines.push("", "Items:");
  for (const item of details.items) {
    const size = item.size ? ` (${item.size})` : "";
    lines.push(`• ${item.name}${size} × ${item.quantity} — ${formatMoney(item.price * item.quantity)}`);
  }

  lines.push("");
  if (details.subtotal !== undefined) lines.push(`Items: ${formatMoney(details.subtotal)}`);
  if (details.discount && details.discount > 0) lines.push(`Discount: -${formatMoney(details.discount)}`);
  lines.push(`Shipping: ${formatMoney(details.shippingCost)}`);
  if (details.tax !== undefined) lines.push(`Tax collected: ${formatMoney(details.tax)}`);
  lines.push(`Total: ${formatMoney(details.total)}`);
  if (details.paymentMethod) lines.push(`Payment: ${details.paymentMethod}`);
  lines.push("", "⚡ Please prepare and ship this order.");

  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

export function getOrderWhatsAppUrl(message: string): string {
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message.slice(0, 1500))}`;
}

/** Opens WhatsApp with the order message. Stores URL so success page can retry if blocked. */
export function openOrderWhatsApp(message: string): string {
  const url = getOrderWhatsAppUrl(message);
  try {
    sessionStorage.setItem(WA_ORDER_KEY, url);
  } catch {
    /* ignore */
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}

export function consumeStoredWhatsAppUrl(): string | null {
  try {
    const url = sessionStorage.getItem(WA_ORDER_KEY);
    if (url) sessionStorage.removeItem(WA_ORDER_KEY);
    return url;
  } catch {
    return null;
  }
}

export function cartItemsToWhatsAppItems(items: CartItem[]) {
  return items.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    price: i.price,
    size: i.size,
  }));
}
