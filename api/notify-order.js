import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@ykonline.shop";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "YKonline Shop <onboarding@resend.dev>";

function formatItems(items) {
  return items
    .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ""} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");
}

function orderEmailHtml(order, title, intro) {
  const items = order.items ?? [];
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
      <p>Shipping: $${Number(order.shipping_cost ?? 0).toFixed(2)}</p>
      <p style="font-size:16px;font-weight:bold">Total: $${Number(order.total).toFixed(2)}</p>
      <p style="color:#666;font-size:13px">Questions? Reply to contact@ykonline.shop</p>
    </div>
  `;
}

async function sendEmail(resendKey, to, subject, html) {
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
    return { ok: false, error };
  }
  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!resendKey) {
    return res.status(500).json({ error: "RESEND_API_KEY is not configured." });
  }
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Supabase service credentials not configured." });
  }

  try {
    const { orderId, type = "created" } = req.body ?? {};
    if (!orderId) return res.status(400).json({ error: "orderId is required." });

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).single();

    if (error || !order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const items = order.items ?? [];
    const whatsappMsg = [
      type === "paid" ? "✅ NEW PAID ORDER" : "🛒 NEW ORDER (pending payment)",
      `Order #${order.order_number}`,
      `Customer: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      "",
      formatItems(items),
      "",
      `Total: $${Number(order.total).toFixed(2)}`,
    ].join("\n");

    const results = { emailCustomer: false, emailAdmin: false };
    const errors = [];

    if (type === "created" && order.customer_email) {
      const r = await sendEmail(
        resendKey,
        [order.customer_email],
        `Order received — #${order.order_number}`,
        orderEmailHtml(order, "We received your order!", "Thank you! Complete payment to confirm your order."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok) errors.push(`customer: ${r.error}`);
    }

    if (type === "paid" && order.customer_email) {
      const r = await sendEmail(
        resendKey,
        [order.customer_email],
        `Order confirmed — #${order.order_number}`,
        orderEmailHtml(order, "Thank you for your order!", "Your payment has been confirmed. We're preparing your order."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok) errors.push(`customer: ${r.error}`);
    }

    const adminResult = await sendEmail(
      resendKey,
      [ADMIN_EMAIL],
      `${type === "paid" ? "Paid order" : "New order"} #${order.order_number}`,
      `<div style="font-family:Arial,sans-serif;padding:24px">
        <h2 style="color:#0B6623">${type === "paid" ? "Payment confirmed" : "New order placed"}</h2>
        <p><strong>#${order.order_number}</strong> — ${order.customer_name} (${order.customer_email})</p>
        <p>Total: $${Number(order.total).toFixed(2)}</p>
        <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${whatsappMsg}</pre>
      </div>`,
    );
    results.emailAdmin = adminResult.ok;
    if (!adminResult.ok) errors.push(`admin: ${adminResult.error}`);

    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json({
      success: results.emailCustomer || results.emailAdmin,
      ...results,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
