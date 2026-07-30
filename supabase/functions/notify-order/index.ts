import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  ADMIN_EMAIL,
  formatItems,
  formatShippingAddress,
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

    // Never email/WhatsApp for unpaid "created" orders
    if (type === "created") {
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        reason: "No notifications for unpaid orders.",
        ...results,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "paid") {
      const wa = await sendAdminWhatsApp(whatsappMsg);
      results.whatsapp = wa.ok;
      results.whatsappProvider = wa.provider ?? "";
      if (!wa.ok && wa.error) errors.push(`whatsapp: ${wa.error}`);
    }

    if (resendKey) {
      if (type === "paid") {
        const adminResult = await sendResendEmail(
          resendKey,
          [ADMIN_EMAIL],
          `🚨 PAID ORDER #${order.order_number} — $${Number(order.total).toFixed(2)}`,
          `<div style="font-family:Arial,sans-serif;padding:24px">
            <h2 style="color:#0B6623">💰 Payment confirmed — new order!</h2>
            <p><strong>#${order.order_number}</strong> — ${order.customer_name} (${order.customer_email})</p>
            <p><strong>Shipping address:</strong></p>
            <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${formatShippingAddress(order.shipping_address)}</pre>
            <p style="font-size:18px;font-weight:bold;color:#FF7900">Total: $${Number(order.total).toFixed(2)}</p>
            <p>Status: ${order.status}</p>
            <pre style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap">${whatsappMsg}</pre>
            <p style="margin-top:16px"><a href="https://ykonline.shop/admin">Open admin dashboard</a></p>
          </div>`,
        );
        results.emailAdmin = adminResult.ok;
        if (!adminResult.ok && adminResult.error) errors.push(`admin: ${adminResult.error}`);
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
    } else if (type === "paid" || type === "shipped" || type === "delivered") {
      errors.push("email: RESEND_API_KEY is not configured (WhatsApp still attempted).");
    }

    const success = results.whatsapp || results.emailAdmin || results.emailCustomer;

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
