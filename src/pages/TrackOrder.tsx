import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Package, Search, Loader2, Truck, CheckCircle2, Mail } from "lucide-react";
import { trackOrderByEmail } from "../lib/orders";
import type { Order } from "../lib/orders";
import { formatPrice } from "../context/CartContext";
import { mapOrderStatus, orderStatusColor, orderProgressIndex, ORDER_STATUS_STEPS } from "../lib/orderStatus";
import { usePageMeta } from "../lib/seo";

export default function TrackOrder() {
  usePageMeta({
    title: "Track My Order",
    description: "Track your YKonline Shop order status with your order number and email address.",
    path: "/track-order",
  });

  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    const result = await trackOrderByEmail(orderNumber, email);
    if (!result) {
      setError("No order found. Please verify your order number and the email used at checkout.");
    } else {
      setOrder(result);
    }
    setLoading(false);
  };

  const progress = order ? orderProgressIndex(order.status) : 0;

  return (
    <div className="container-page py-12 md:py-16 max-w-3xl">
      <div className="text-center mb-10">
        <p className="text-orange font-bold uppercase tracking-wider text-sm">Order tracking</p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-950 mt-2">Track my order</h1>
        <p className="text-gray-600 mt-3 max-w-xl mx-auto">
          Enter your order number and email address to see the current status of your purchase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-bold text-gray-700 mb-1.5">Order number</label>
            <input
              id="orderNumber"
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. YK-12345678"
              className="w-full px-4 py-3 rounded-xl border border-green/20 bg-white focus:outline-none focus:border-green"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-xl border border-green/20 bg-white focus:outline-none focus:border-green"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {loading ? "Searching..." : "Track order"}
        </button>
      </form>

      {order && (
        <div className="rounded-[1.5rem] border border-gray-100 bg-white overflow-hidden shadow-sm fade-in">
          <div className="p-6 md:p-8 border-b border-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10 text-green">
                  <Package size={26} />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-gray-950">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.createdAt} · {order.customerName}</p>
                </div>
              </div>
              <span className={`self-start rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${orderStatusColor(order.status)}`}>
                {mapOrderStatus(order.status)}
              </span>
            </div>

            {order.status !== "pending" && order.status !== "cancelled" && (
              <div className="mt-8">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-green transition-all"
                    style={{ width: `${Math.min(progress / ORDER_STATUS_STEPS.length, 1) * 100}%` }}
                  />
                  {ORDER_STATUS_STEPS.map((step, i) => {
                    const done = progress > i;
                    const active = progress === i + 1;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done || active ? "bg-green text-white" : "bg-gray-100 text-gray-400"}`}>
                          {done ? <CheckCircle2 size={16} /> : <Truck size={14} />}
                        </div>
                        <span className={`text-[10px] md:text-xs font-bold text-center ${done || active ? "text-green" : "text-gray-400"}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 bg-gray-50/50">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Order items</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-3 border border-gray-100">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-950">{item.name} — {item.size}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-display font-bold text-green">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700">Total</span>
              <span className="font-display text-2xl font-bold text-green">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 rounded-[1.5rem] bg-cream/40 p-6 text-center">
        <Mail size={24} className="mx-auto text-green mb-3" />
        <p className="text-gray-600 text-sm">
          Need help? <Link to="/contact" className="text-green font-semibold hover:text-orange">Contact us</Link> or{" "}
          <Link to="/account" className="text-green font-semibold hover:text-orange">create an account</Link> to manage your orders.
        </p>
      </div>
    </div>
  );
}
