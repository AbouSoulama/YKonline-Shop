export function discountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function stockLabel(stock: number): { text: string; className: string } {
  if (stock <= 0) {
    return { text: "Out of stock", className: "text-red-600 font-semibold" };
  }
  if (stock <= 5) {
    return { text: `Only ${stock} left in stock`, className: "text-orange font-semibold" };
  }
  if (stock <= 15) {
    return { text: `${stock} in stock — selling fast`, className: "text-amber-700 font-medium" };
  }
  return { text: `${stock} in stock`, className: "text-gray-600" };
}
