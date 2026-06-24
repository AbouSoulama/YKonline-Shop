import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { verifyCheckoutSession } from "../lib/payments";
import { fetchOrderByNumber } from "../lib/orders";
import { useCart } from "../context/CartContext";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const sessionId = params.get("session_id");
    const order = params.get("order");

    async function verify() {
      if (sessionId) {
        const result = await verifyCheckoutSession(sessionId);
        setPaid(result.paid);
        if (result.paid) clearCart();
      } else if (order) {
        const o = await fetchOrderByNumber(order);
        setPaid(o?.status === "paid");
        if (o?.status === "paid") clearCart();
      }
      if (order) setOrderNumber(order);
      setLoading(false);
    }

    verify();
  }, [params, clearCart]);

  if (loading) {
    return (
      <div className="container-page py-24 text-center">
        <Loader2 size={40} className="mx-auto text-green animate-spin mb-4" />
        <p className="text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="container-page py-20 text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 rounded-full bg-green flex items-center justify-center mx-auto mb-6">
        <Check size={40} className="text-white" />
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
        {paid ? "Thank you for your order!" : "Order received"}
      </h1>
      <p className="text-gray-600 mb-2">
        {paid ? "Your payment was confirmed successfully." : "Your order is being processed."}
      </p>
      {orderNumber && (
        <div className="bg-cream/40 rounded-3xl p-6 mb-8 text-left mt-6">
          <p className="text-sm text-gray-500 mb-1">Order number</p>
          <p className="font-display font-bold text-xl text-green">#{orderNumber}</p>
        </div>
      )}
      <Link to="/shop" className="btn-primary">Continue shopping</Link>
    </div>
  );
}
