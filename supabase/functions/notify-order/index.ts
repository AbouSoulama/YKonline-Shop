import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "contact@ykonline.shop";
const ADMIN_WHATSAPP = Deno.env.get("ADMIN_WHATSAPP") || "13012669830";

function formatItems(items: Array<{ name: string; quantity: number; price: number; size?: string }>) {
  return items
    .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ""} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");
}

function orderEmailHtml(order: Record<string, unknown>, title: string, intro: string) {
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
      <p>Shipping: $${Number(order.shipping_cost ?? 0).toFixed(2)}</p>
      <p style="font-size:16px;font-weight:bold">Total: $${Number(order.total).toFixed(2)}</p>
      <p style="color:#666;font-size:13px">Questions? Reply to contact@ykonline.shop</p>
    </div>
  `;
}

async function sendEmail(resendKey: string, to: string[], subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "YKonline Shop <contact@ykonline.shop>",
      to,
      subject,
      html,
    }),
  });
  return res.ok;
}

async function sendWhatsApp(message: string) {
  const token = Deno.env.get("WHATSAPP_CLOUD_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  if (!token || !phoneId) return false;

  const to = ADMIN_WHATSAPP.replace(/\D/g, "");
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
      text: { body: message },
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, type = "created" } = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (error || !order) {
      return new Response(JSON.stringify({ error: "Order not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = (order.items as Array<{ name: string; quantity: number; price: number; size?: string }>) ?? [];
    const whatsappMsg = [
      type === "paid" ? "✅ NEW PAID ORDER" : "🛒 NEW ORDER (pending payment)",
      `Order #${order.order_number}`,
      `Customer: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      `Phone: ${(order.shipping_address as { phone?: string })?.phone ?? "—"}`,
      "",
      formatItems(items),
      "",
      `Total: $${Number(order.total).toFixed(2)}`,
      `Payment: ${order.payment_method ?? "stripe"}`,
    ].join("\n");

    const results = { emailCustomer: false, emailAdmin: false, whatsapp: false };

    if (resendKey) {
      if (type === "created" && order.customer_email) {
        results.emailCustomer = await sendEmail(
          resendKey,
          [order.customer_email as string],
          `Order received — #${order.order_number}`,
          orderEmailHtml(order, "We received your order!", "Thank you! Complete payment to confirm your order. We'll prepare it as soon as payment is received."),
        );
      }

      if (type === "paid" && order.customer_email) {
        results.emailCustomer = await sendEmail(
          resendKey,
          [order.customer_email as string],
          `Order confirmed — #${order.order_number}`,
          orderEmailHtml(order, "Thank you for your order!", "Your payment has been confirmed. We're preparing your order and will ship it soon."),
        );
      }

      results.emailAdmin = await sendEmail(
        resendKey,
        [ADMIN_EMAIL],
        `${type === "paid" ? "Paid order" : "New order"} #${order.order_number}`,
        `<div style="font-family:Arial,sans-serif;padding:24px">
          <h2 style="color:#0B6623">${type === "paid" ? "Payment confirmed" : "New order placed"}</h2>
          <p><strong>#${order.order_number}</strong> — ${order.customer_name} (${order.customer_email})</p>
          <p>Total: $${Number(order.total).toFixed(2)} · Status: ${order.status}</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${whatsappMsg}</pre>
        </div>`,
      );
    }

    results.whatsapp = await sendWhatsApp(whatsappMsg);

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
