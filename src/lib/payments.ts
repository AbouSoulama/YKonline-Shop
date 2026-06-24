import { supabase, isSupabaseConfigured } from "./supabase";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const isStripeConfigured = Boolean(stripePublishableKey);

export async function createCheckoutSession(params: {
  orderId: string;
  orderNumber: string;
  paymentMethod: "card" | "paypal" | "stripe";
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string } | { error: string }> {
  if (!isSupabaseConfigured) {
    return { error: "Payment system not configured. Please contact support." };
  }

  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: params,
  });

  if (error) {
    return { error: error.message || "Unable to start payment. Please try again." };
  }

  if (data?.error) {
    return { error: data.error };
  }

  if (!data?.url) {
    return { error: "Payment session could not be created." };
  }

  return { url: data.url };
}

export async function verifyCheckoutSession(sessionId: string): Promise<{ paid: boolean; orderId?: string }> {
  if (!isSupabaseConfigured) return { paid: false };

  const { data, error } = await supabase.functions.invoke("verify-checkout", {
    body: { sessionId },
  });

  if (error || !data) return { paid: false };
  return { paid: data.paid === true, orderId: data.orderId };
}
