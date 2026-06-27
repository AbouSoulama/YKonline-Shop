export interface ShippingAddress {
  address: string;
  city: string;
  country: string;
  phone: string;
}

export function formatShippingAddress(addr: Partial<ShippingAddress> | null | undefined): string {
  if (!addr) return "—";
  const lines = [
    addr.address?.trim(),
    [addr.city?.trim(), addr.country?.trim()].filter(Boolean).join(", "),
    addr.phone?.trim() ? `Phone: ${addr.phone.trim()}` : "",
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "—";
}
