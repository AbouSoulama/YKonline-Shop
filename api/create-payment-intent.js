import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    return res.status(500).json({ error: "Stripe secret key not configured." });
  }

  try {
    const { orderId } = req.body ?? {};
    if (!orderId) return res.status(400).json({ error: "orderId is required." });

    const supabase = createClient(supabaseUrl!, serviceKey!);
    const { data: order, error } = await supabase.from("orders").select("total, order_number").eq("id", orderId).single();

    if (error || !order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2024-11-20.acacia" });
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: "usd",
      metadata: { order_id: orderId, order_number: order.order_number },
      automatic_payment_methods: { enabled: true },
    });

    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json({ clientSecret: intent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
