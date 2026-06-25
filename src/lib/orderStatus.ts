export function mapOrderStatus(status: string): string {
  const m: Record<string, string> = {
    pending: "Pending payment",
    paid: "Processing",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return m[status.toLowerCase()] ?? "Pending";
}

export function orderStatusColor(status: string): string {
  const s = mapOrderStatus(status);
  const colors: Record<string, string> = {
    "Pending payment": "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green/10 text-green",
    Cancelled: "bg-red-100 text-red-700",
    Pending: "bg-gray-100 text-gray-600",
  };
  return colors[s] ?? "bg-gray-100 text-gray-600";
}

export const ORDER_STATUS_STEPS = ["Processing", "Shipped", "Delivered"] as const;

export function orderProgressIndex(status: string): number {
  const s = status.toLowerCase();
  if (s === "delivered") return 3;
  if (s === "shipped") return 2;
  if (s === "paid" || s === "processing") return 1;
  return 0;
}
