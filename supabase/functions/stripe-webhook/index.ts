import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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
          <p>Your payment has been confirmed.</p>
          <p style="font-size:18px;font-weight:bold;color:#0B6623">Order #${order.order_number}</p>
          <table style="width:100%">${itemsHtml}</table>
          <p style="font-weight:bold">Total: $${Number(order.total).toFixed(2)}</p>
        </div>
      `,
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId && session.payment_status === "paid") {
      const { data: before } = await supabase.from("orders").select("status").eq("id", orderId).single();
      await supabase.rpc("fulfill_order", {
        p_order_id: orderId,
        p_stripe_session_id: session.id,
        p_payment_method: "stripe",
      });
      if (before?.status !== "paid") {
        const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
        if (order) await sendOrderEmail(order);
      }
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.order_id;
    if (orderId) {
      const { data: before } = await supabase.from("orders").select("status").eq("id", orderId).single();
      await supabase.rpc("fulfill_order", {
        p_order_id: orderId,
        p_payment_method: "card",
      });
      if (before?.status !== "paid") {
        const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
        if (order) await sendOrderEmail(order);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
