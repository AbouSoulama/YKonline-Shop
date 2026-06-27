export const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "contact@ykonline.shop";
export const RESEND_FROM =
  Deno.env.get("RESEND_FROM_EMAIL") || "YKonline Shop <onboarding@resend.dev>";

export function formatItems(items: Array<{ name: string; quantity: number; price: number; size?: string }>) {
  return items
    .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ""} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");
}

export function formatShippingAddress(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "—";
  const a = addr as {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };
  const lines = [
    a.address?.trim(),
    a.city?.trim(),
    a.state?.trim(),
    (a.postalCode ?? a.zip)?.trim(),
    a.country?.trim(),
    a.phone?.trim(),
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "—";
}

export function formatShippingAddressHtml(addr: unknown): string {
  const text = formatShippingAddress(addr);
  if (text === "—") return "<p style=\"margin:0;color:#666\">—</p>";
  return `<p style="margin:0;line-height:1.6;color:#333">${text.split("\n").map((l) => l.replace(/</g, "&lt;")).join("<br/>")}</p>`;
}

export function orderEmailHtml(order: Record<string, unknown>, title: string, intro: string) {
  const items = (order.items as Array<{ name: string; quantity: number; price: number }>) ?? [];
  const itemsHtml = items
    .map((i) => `<tr><td style="padding:8px 0">${i.name} × ${i.quantity}</td><td style="padding:8px 0;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h1 style="color:#0B6623">${title}</h1>
      <p>Hi ${order.customer_name ?? "there"},</p>
      <p>${intro}</p>
      <p style="font-size:18px;font-weight:bold;color:#0B6623">Order #${order.order_number}</p>
      <table style="width:100%;border-top:1px solid #eee;margin:16px 0">${itemsHtml}</table>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#0B6623;text-transform:uppercase">Shipping address</p>
        ${formatShippingAddressHtml(order.shipping_address)}
      </div>
      <p>Shipping: $${Number(order.shipping_cost ?? 0).toFixed(2)}</p>
      <p style="font-size:16px;font-weight:bold">Total: $${Number(order.total).toFixed(2)}</p>
      <p style="color:#666;font-size:13px">Questions? Reply to contact@ykonline.shop</p>
    </div>
  `;
}

export async function sendResendEmail(
  resendKey: string,
  to: string[],
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      reply_to: ADMIN_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Resend API error:", error);
    return { ok: false, error };
  }
  return { ok: true };
}
