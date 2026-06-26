import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  ADMIN_EMAIL,
  formatItems,
  orderEmailHtml,
  sendResendEmail,
} from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_WHATSAPP = Deno.env.get("ADMIN_WHATSAPP") || "13012669830";

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

    if (!resendKey) {
      return new Response(JSON.stringify({
        success: false,
        error: "RESEND_API_KEY is not configured in Supabase Edge Function secrets.",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      type === "paid" ? "✅ NEW PAID ORDER" : type === "shipped" ? "📦 ORDER SHIPPED" : type === "delivered" ? "✅ ORDER DELIVERED" : "🛒 NEW ORDER (pending payment)",
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
    const errors: string[] = [];

    if (type === "created" && order.customer_email) {
      const r = await sendResendEmail(
        resendKey,
        [order.customer_email as string],
        `Order received — #${order.order_number}`,
        orderEmailHtml(order, "We received your order!", "Thank you! Complete payment to confirm your order. We'll prepare it as soon as payment is received."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok && r.error) errors.push(`customer: ${r.error}`);
    }

    if (type === "paid" && order.customer_email) {
      const r = await sendResendEmail(
        resendKey,
        [order.customer_email as string],
        `Order confirmed — #${order.order_number}`,
        orderEmailHtml(order, "Thank you for your order!", "Your payment has been confirmed. We're preparing your order and will ship it soon."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok && r.error) errors.push(`customer: ${r.error}`);
    }

    if (type === "shipped" && order.customer_email) {
      const r = await sendResendEmail(
        resendKey,
        [order.customer_email as string],
        `Your order has been shipped — #${order.order_number}`,
        orderEmailHtml(order, "Your order is on its way!", "Great news! Your order has been shipped and is on its way to you. You can track it anytime from our website."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok && r.error) errors.push(`customer: ${r.error}`);
    }

    if (type === "delivered" && order.customer_email) {
      const r = await sendResendEmail(
        resendKey,
        [order.customer_email as string],
        `Your order has been delivered — #${order.order_number}`,
        orderEmailHtml(order, "Order delivered!", "Your order has been delivered. We hope you enjoy your purchase! Thank you for shopping with YKonline Shop."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok && r.error) errors.push(`customer: ${r.error}`);
    }

    if (type === "created" || type === "paid") {
      const adminResult = await sendResendEmail(
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
      results.emailAdmin = adminResult.ok;
      if (!adminResult.ok && adminResult.error) errors.push(`admin: ${adminResult.error}`);
    }

    results.whatsapp = await sendWhatsApp(whatsappMsg);

    return new Response(JSON.stringify({
      success: results.emailCustomer || results.emailAdmin,
      ...results,
      errors: errors.length ? errors : undefined,
    }), {
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
