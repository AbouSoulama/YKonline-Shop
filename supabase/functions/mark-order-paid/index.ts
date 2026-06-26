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

    let notifySuccess = false;
    if (!wasPaid && fulfilled) {
      const notifyRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, type: "paid" }),
      });
      const notifyData = await notifyRes.json().catch(() => ({}));
      notifySuccess = notifyRes.ok && !!notifyData.success;
      if (!notifySuccess) {
        console.error("notify-order failed after payment:", notifyData);
      }
    }

    return new Response(JSON.stringify({ success: true, notified: notifySuccess }), {
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
