import { formatShippingAddress } from "./resend.ts";

const ADMIN_WHATSAPP = Deno.env.get("ADMIN_WHATSAPP") || "13012669830";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("1") && digits.length === 11 ? digits : digits;
}

async function sendMetaWhatsApp(message: string): Promise<{ ok: boolean; error?: string }> {
  const token = Deno.env.get("WHATSAPP_CLOUD_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  if (!token || !phoneId) {
    return { ok: false, error: "Meta WhatsApp API not configured." };
  }

  const to = normalizePhone(ADMIN_WHATSAPP);
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message.slice(0, 4000) },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Meta WhatsApp error:", error);
    return { ok: false, error };
  }
  return { ok: true };
}

async function sendCallMeBotWhatsApp(message: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
  if (!apiKey) {
    return { ok: false, error: "CallMeBot API key not configured." };
  }

  const phone = normalizePhone(ADMIN_WHATSAPP);
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=%2B${phone}&text=${encodeURIComponent(message.slice(0, 1500))}&apikey=${apiKey}`;

  const res = await fetch(url);
  const body = await res.text();

  if (!res.ok || body.toLowerCase().includes("error")) {
    console.error("CallMeBot error:", body);
    return { ok: false, error: body };
  }
  return { ok: true };
}

/** Sends admin WhatsApp alert via Meta Cloud API, then CallMeBot fallback. */
export async function sendAdminWhatsApp(message: string): Promise<{ ok: boolean; provider?: string; error?: string }> {
  const meta = await sendMetaWhatsApp(message);
  if (meta.ok) return { ok: true, provider: "meta" };

  const callmebot = await sendCallMeBotWhatsApp(message);
  if (callmebot.ok) return { ok: true, provider: "callmebot" };

  return {
    ok: false,
    error: callmebot.error || meta.error || "No WhatsApp provider configured.",
  };
}

export function buildOrderWhatsAppMessage(
  order: Record<string, unknown>,
  type: string,
  formatItems: (items: Array<{ name: string; quantity: number; price: number; size?: string }>) => string,
): string {
  const items = (order.items as Array<{ name: string; quantity: number; price: number; size?: string }>) ?? [];
  const heading =
    type === "paid" ? "✅ NEW PAID ORDER — YKonline Shop"
    : type === "shipped" ? "📦 ORDER SHIPPED"
    : type === "delivered" ? "✅ ORDER DELIVERED"
    : "🛒 NEW ORDER (pending payment)";

  return [
    heading,
    `Order #${order.order_number}`,
    `Customer: ${order.customer_name}`,
    `Email: ${order.customer_email}`,
    `Ship to:\n${formatShippingAddress(order.shipping_address)}`,
    "",
    formatItems(items),
    "",
    `Total: $${Number(order.total).toFixed(2)}`,
    `Payment: ${order.payment_method ?? "stripe"}`,
    "",
    type === "paid" ? "⚡ Action required: prepare and ship this order." : "",
  ].filter(Boolean).join("\n");
}
