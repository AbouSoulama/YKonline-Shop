import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@ykonline.shop";
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || "13012669830";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "YKonline Shop <onboarding@resend.dev>";

function formatItems(items) {
  return items
    .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ""} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");
}

function formatShippingAddress(addr) {
  if (!addr || typeof addr !== "object") return "—";
  const lines = [
    addr.address?.trim(),
    addr.city?.trim(),
    addr.state?.trim(),
    (addr.postalCode ?? addr.zip)?.trim(),
    addr.country?.trim(),
    addr.phone?.trim(),
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "—";
}

function formatShippingAddressHtml(addr) {
  const text = formatShippingAddress(addr);
  if (text === "—") return "<p style=\"margin:0;color:#666\">—</p>";
  return `<p style="margin:0;line-height:1.6;color:#333">${text.split("\n").map((l) => l.replace(/</g, "&lt;")).join("<br/>")}</p>`;
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

function buildWhatsAppMessage(order, type) {
  const items = order.items ?? [];
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

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

async function sendMetaWhatsApp(message) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false, error: "Meta WhatsApp API not configured." };

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
    return { ok: false, error };
  }
  return { ok: true, provider: "meta" };
}

async function sendCallMeBotWhatsApp(message) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) return { ok: false, error: "CallMeBot API key not configured." };

  const phone = normalizePhone(ADMIN_WHATSAPP);
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=%2B${phone}&text=${encodeURIComponent(message.slice(0, 1500))}&apikey=${apiKey}`;

  const res = await fetch(url);
  const body = await res.text();

  if (!res.ok || body.toLowerCase().includes("error")) {
    return { ok: false, error: body };
  }
  return { ok: true, provider: "callmebot" };
}

async function sendAdminWhatsApp(message) {
  const meta = await sendMetaWhatsApp(message);
  if (meta.ok) return meta;

  const callmebot = await sendCallMeBotWhatsApp(message);
  if (callmebot.ok) return callmebot;

  return { ok: false, error: callmebot.error || meta.error };
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

    const whatsappMsg = buildWhatsAppMessage(order, type);
    const results = { emailCustomer: false, emailAdmin: false, whatsapp: false, whatsappProvider: "" };
    const errors = [];

    if (type === "paid") {
      const adminResult = await sendEmail(
        resendKey,
        [ADMIN_EMAIL],
        `🚨 PAID ORDER #${order.order_number} — $${Number(order.total).toFixed(2)}`,
        `<div style="font-family:Arial,sans-serif;padding:24px">
          <h2 style="color:#0B6623">💰 Payment confirmed — new order!</h2>
          <p><strong>#${order.order_number}</strong> — ${order.customer_name} (${order.customer_email})</p>
          <p><strong>Shipping address:</strong></p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${formatShippingAddress(order.shipping_address)}</pre>
          <p style="font-size:18px;font-weight:bold;color:#FF7900">Total: $${Number(order.total).toFixed(2)}</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${whatsappMsg}</pre>
          <p style="margin-top:16px"><a href="https://ykonline.shop/admin">Open admin dashboard</a></p>
        </div>`,
      );
      results.emailAdmin = adminResult.ok;
      if (!adminResult.ok) errors.push(`admin: ${adminResult.error}`);

      const wa = await sendAdminWhatsApp(whatsappMsg);
      results.whatsapp = wa.ok;
      results.whatsappProvider = wa.provider ?? "";
      if (!wa.ok) errors.push(`whatsapp: ${wa.error}`);
    }

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

    if (type === "shipped" && order.customer_email) {
      const r = await sendEmail(
        resendKey,
        [order.customer_email],
        `Your order has been shipped — #${order.order_number}`,
        orderEmailHtml(order, "Your order is on its way!", "Great news! Your order has been shipped and is on its way to you."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok) errors.push(`customer: ${r.error}`);
    }

    if (type === "delivered" && order.customer_email) {
      const r = await sendEmail(
        resendKey,
        [order.customer_email],
        `Your order has been delivered — #${order.order_number}`,
        orderEmailHtml(order, "Order delivered!", "Your order has been delivered. We hope you enjoy your purchase!"),
      );
      results.emailCustomer = r.ok;
      if (!r.ok) errors.push(`customer: ${r.error}`);
    }

    if (type === "created") {
      const adminResult = await sendEmail(
        resendKey,
        [ADMIN_EMAIL],
        `New order (pending) #${order.order_number}`,
        `<div style="font-family:Arial,sans-serif;padding:24px">
          <h2 style="color:#0B6623">New order placed (awaiting payment)</h2>
          <p><strong>#${order.order_number}</strong> — ${order.customer_name} (${order.customer_email})</p>
          <p>Total: $${Number(order.total).toFixed(2)}</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${whatsappMsg}</pre>
        </div>`,
      );
      results.emailAdmin = adminResult.ok;
      if (!adminResult.ok) errors.push(`admin: ${adminResult.error}`);

      const wa = await sendAdminWhatsApp(whatsappMsg);
      results.whatsapp = wa.ok;
      results.whatsappProvider = wa.provider ?? "";
      if (!wa.ok) errors.push(`whatsapp: ${wa.error}`);
    }

    const success = type === "paid"
      ? (results.emailAdmin || results.whatsapp)
      : (results.emailCustomer || results.emailAdmin || results.whatsapp);

    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json({
      success,
      ...results,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
