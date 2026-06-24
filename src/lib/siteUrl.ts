export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://ykonline.shop";

export function getAuthRedirectUrl() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return `${window.location.origin}/auth/callback`;
  }
  return `${SITE_URL}/auth/callback`;
}

export function getCheckoutSuccessUrl() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return `${window.location.origin}/checkout/success`;
  }
  return `${SITE_URL}/checkout/success`;
}

export function getCheckoutCancelUrl() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return `${window.location.origin}/checkout`;
  }
  return `${SITE_URL}/checkout`;
}
