import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendOrderEmail(order: Record<string, unknown>) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey || !order.customer_email) return;

  const items = (order.items as Array<{ name: string; quantity: number; price: number }>) ?? [];
  const itemsHtml = items
    .map((i) => `<tr><td style="padding:8px 0">${i.name} × ${i.quantity}</td><td style="padding:8px 0;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`)
    .join("");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "YKonline Shop <contact@ykonline.shop>",
      to: [order.customer_email as string],
      subject: `Order confirmed — #${order.order_number}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <h1 style="color:#0B6623">Thank you for your order!</h1>
          <p>Hi ${order.customer_name ?? "there"},</p>
          <p>Your payment has been confirmed. We're preparing your order.</p>
          <p style="font-size:18px;font-weight:bold;color:#0B6623">Order #${order.order_number}</p>
          <table style="width:100%;border-top:1px solid #eee;margin:16px 0">${itemsHtml}</table>
          <p style="font-size:16px;font-weight:bold">Total: $${Number(order.total).toFixed(2)}</p>
          <p style="color:#666;font-size:13px">Questions? Reply to contact@ykonline.shop</p>
        </div>
      `,
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, stripeSessionId, paymentMethod } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: before } = await supabase.from("orders").select("status").eq("id", orderId).single();
    const wasPaid = before?.status === "paid";

    const { data: fulfilled, error: fulfillError } = await supabase.rpc("fulfill_order", {
      p_order_id: orderId,
      p_stripe_session_id: stripeSessionId ?? null,
      p_payment_method: paymentMethod ?? null,
    });

    if (fulfillError) {
      return new Response(JSON.stringify({ error: fulfillError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!wasPaid && fulfilled) {
      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (order) await sendOrderEmail(order);
    }

    return new Response(JSON.stringify({ success: true }), {
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
