import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

async function notifyPaidOrder(orderId: string) {
  const notifyRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, type: "paid" }),
  });
  const notifyData = await notifyRes.json().catch(() => ({}));
  if (!notifyRes.ok || !notifyData.success) {
    console.error("notify-order failed from stripe-webhook:", notifyData);
  }
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
        await notifyPaidOrder(orderId);
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
        await notifyPaidOrder(orderId);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
