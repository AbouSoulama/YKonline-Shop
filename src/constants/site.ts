export const SITE_EMAIL = "contact@ykonline.shop";
export const ADMIN_WHATSAPP = "13012669830";

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/ykonlineshop",
  instagram: "https://instagram.com/ykonlineshop",
  pinterest: "https://pinterest.com/ykonlineshop",
  youtube: "https://youtube.com/@ykonlineshop",
} as const;

export const STORE_ADDRESS = "3812 Light Arms Pl, Waldorf, MD 20602, United States";
export const SHIPPING_RATE_PER_KM = 0.69;
export const STORE_COORDS = { lat: 38.6098, lng: -76.943 };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
