import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const orderNumber = payload.orderNumber || `YK-${Date.now().toString().slice(-8)}`;
    const userId = payload.userId?.startsWith("local-") ? null : (payload.userId ?? null);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: payload.customerEmail,
        customer_name: payload.customerName,
        items: payload.items,
        subtotal: payload.subtotal,
        discount_amount: payload.discount ?? 0,
        promo_code: payload.promoCode ?? null,
        total: payload.total,
        shipping_cost: payload.shippingCost,
        shipping_distance_km: payload.shippingDistanceKm,
        shipping_address: payload.shippingAddress,
        payment_method: payload.paymentMethod,
        status: "pending",
        order_number: orderNumber,
      })
      .select("id, order_number")
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: error?.message || "Unable to create order." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ orderId: data.id, orderNumber: data.order_number }), {
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
