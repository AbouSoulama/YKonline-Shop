import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  ADMIN_EMAIL,
  formatItems,
  orderEmailHtml,
  sendResendEmail,
} from "../_shared/resend.ts";
import { buildOrderWhatsAppMessage, sendAdminWhatsApp } from "../_shared/whatsapp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const whatsappMsg = buildOrderWhatsAppMessage(order, type, formatItems);
    const results = { emailCustomer: false, emailAdmin: false, whatsapp: false, whatsappProvider: "" };
    const errors: string[] = [];

    // Admin alert first on paid orders (immediate notification)
    if (type === "paid") {
      const adminResult = await sendResendEmail(
        resendKey,
        [ADMIN_EMAIL],
        `🚨 PAID ORDER #${order.order_number} — $${Number(order.total).toFixed(2)}`,
        `<div style="font-family:Arial,sans-serif;padding:24px">
          <h2 style="color:#0B6623">💰 Payment confirmed — new order!</h2>
          <p><strong>#${order.order_number}</strong> — ${order.customer_name} (${order.customer_email})</p>
          <p>Phone: ${(order.shipping_address as { phone?: string })?.phone ?? "—"}</p>
          <p style="font-size:18px;font-weight:bold;color:#FF7900">Total: $${Number(order.total).toFixed(2)}</p>
          <p>Status: ${order.status}</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${whatsappMsg}</pre>
          <p style="margin-top:16px"><a href="https://ykonline.shop/admin">Open admin dashboard</a></p>
        </div>`,
      );
      results.emailAdmin = adminResult.ok;
      if (!adminResult.ok && adminResult.error) errors.push(`admin: ${adminResult.error}`);

      const wa = await sendAdminWhatsApp(whatsappMsg);
      results.whatsapp = wa.ok;
      results.whatsappProvider = wa.provider ?? "";
      if (!wa.ok && wa.error) errors.push(`whatsapp: ${wa.error}`);
    }

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
        orderEmailHtml(order, "Your order is on its way!", "Great news! Your order has been shipped and is on its way to you."),
      );
      results.emailCustomer = r.ok;
      if (!r.ok && r.error) errors.push(`customer: ${r.error}`);
    }

    if (type === "delivered" && order.customer_email) {
      const r = await sendResendEmail(
        resendKey,
        [order.customer_email as string],
        `Your order has been delivered — #${order.order_number}`,
        orderEmailHtml(order, "Order delivered!", "Your order has been delivered. We hope you enjoy your purchase!"),
      );
      results.emailCustomer = r.ok;
      if (!r.ok && r.error) errors.push(`customer: ${r.error}`);
    }

    if (type === "created") {
      const adminResult = await sendResendEmail(
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
      if (!adminResult.ok && adminResult.error) errors.push(`admin: ${adminResult.error}`);

      const wa = await sendAdminWhatsApp(whatsappMsg);
      results.whatsapp = wa.ok;
      results.whatsappProvider = wa.provider ?? "";
      if (!wa.ok && wa.error) errors.push(`whatsapp: ${wa.error}`);
    }

    const success = type === "paid"
      ? (results.emailAdmin || results.whatsapp)
      : (results.emailCustomer || results.emailAdmin || results.whatsapp);

    return new Response(JSON.stringify({
      success,
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
