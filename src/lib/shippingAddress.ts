export interface ShippingAddress {
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone: string;
}

function normalizeAddr(addr: Partial<ShippingAddress> | null | undefined) {
  if (!addr || typeof addr !== "object") return null;
  return {
    address: addr.address?.trim() || "",
    city: addr.city?.trim() || "",
    state: addr.state?.trim() || "",
    postalCode: (addr.postalCode ?? (addr as { zip?: string }).zip)?.trim() || "",
    country: addr.country?.trim() || "",
    phone: addr.phone?.trim() || "",
  };
}

/** Lines: address, city, state, postal code, country, phone */
export function getShippingAddressLines(addr: Partial<ShippingAddress> | null | undefined): string[] {
  const a = normalizeAddr(addr);
  if (!a) return [];

  const lines = [
    a.address,
    a.city,
    a.state,
    a.postalCode,
    a.country,
    a.phone,
  ].filter(Boolean);

  return lines;
}

export function formatShippingAddress(addr: Partial<ShippingAddress> | null | undefined): string {
  const lines = getShippingAddressLines(addr);
  return lines.length ? lines.join("\n") : "—";
}

export function formatShippingAddressHtml(addr: Partial<ShippingAddress> | null | undefined): string {
  const lines = getShippingAddressLines(addr);
  if (!lines.length) return "<p style=\"margin:0;color:#666\">—</p>";
  return `<p style="margin:0;line-height:1.8;color:#333">${lines.map((l) => l.replace(/</g, "&lt;")).join("<br/>")}</p>`;
}
