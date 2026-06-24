import { supabase, isSupabaseConfigured } from "./supabase";
import { getCheckoutCancelUrl, getCheckoutSuccessUrl } from "./siteUrl";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export const isStripeConfigured = Boolean(stripePublishableKey?.startsWith("pk_"));
export const isPayPalConfigured = Boolean(paypalClientId);

export function getStripePublishableKey() {
  return isStripeConfigured ? stripePublishableKey : null;
}

export function getPayPalClientId() {
  return isPayPalConfigured ? paypalClientId : null;
}

function extractFunctionError(data: unknown, error: { message: string } | null): string | null {
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  if (error?.message?.includes("non-2xx")) {
    return "Payment server is unavailable. Please try card payment or contact support.";
  }
  return error?.message ?? null;
}

export async function createCardPaymentIntent(orderId: string): Promise<{ clientSecret: string } | { error: string }> {
  if (!isSupabaseConfigured) return { error: "Payment system not configured." };

  const { data, error } = await supabase.functions.invoke("create-payment-intent", {
    body: { orderId },
  });

  const fnError = extractFunctionError(data, error);
  if (fnError) return { error: fnError };
  if (!data?.clientSecret) return { error: "Could not initialize card payment." };
  return { clientSecret: data.clientSecret };
}

export async function createStripeCheckout(params: {
  orderId: string;
  orderNumber: string;
}): Promise<{ url: string } | { error: string }> {
  if (!isSupabaseConfigured) return { error: "Payment system not configured." };

  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      paymentMethod: "stripe",
      successUrl: getCheckoutSuccessUrl(),
      cancelUrl: getCheckoutCancelUrl(),
    },
  });

  if (error) return { error: extractFunctionError(data, error) ?? "Stripe Checkout could not be created." };
  if (data?.error) return { error: data.error };
  if (!data?.url) return { error: "Stripe Checkout could not be created." };
  return { url: data.url };
}

export async function createPayPalOrder(params: {
  orderId: string;
  orderNumber: string;
  total: number;
}): Promise<{ paypalOrderId: string } | { error: string }> {
  if (!isSupabaseConfigured) return { error: "Payment system not configured." };

  const { data, error } = await supabase.functions.invoke("create-paypal-order", {
    body: params,
  });

  if (error) return { error: extractFunctionError(data, error) ?? "PayPal order could not be created." };
  if (data?.error) return { error: data.error };
  if (!data?.paypalOrderId) return { error: "PayPal order could not be created." };
  return { paypalOrderId: data.paypalOrderId };
}

export async function capturePayPalOrder(paypalOrderId: string, orderId: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("capture-paypal-order", {
    body: { paypalOrderId, orderId },
  });

  const fnError = extractFunctionError(data, error);
  if (fnError) return { success: false, error: fnError };
  if (data?.error) return { success: false, error: data.error };
  return { success: data?.status === "COMPLETED" };
}

export async function verifyCheckoutSession(sessionId: string): Promise<{ paid: boolean; orderId?: string }> {
  if (!isSupabaseConfigured) return { paid: false };

  const { data, error } = await supabase.functions.invoke("verify-checkout", {
    body: { sessionId },
  });

  if (error || !data) return { paid: false };
  return { paid: data.paid === true, orderId: data.orderId };
}
