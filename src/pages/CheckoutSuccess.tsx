import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Mail, PackageSearch } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { verifyCheckoutSession } from "../lib/payments";
import { fetchOrderByNumber } from "../lib/orders";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import { usePageMeta } from "../lib/seo";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const { refreshProducts } = useProducts();
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [customerEmail, setCustomerEmail] = useState(params.get("email") ?? "");
  const [paid, setPaid] = useState(false);

  usePageMeta({
    title: "Order Confirmed",
    description: "Your YKonline Shop order has been received.",
    path: "/checkout/success",
    noIndex: true,
  });

  useEffect(() => {
    const sessionId = params.get("session_id");
    const order = params.get("order");
    const emailParam = params.get("email");

    async function verify() {
      if (sessionId) {
        const result = await verifyCheckoutSession(sessionId);
        setPaid(result.paid);
        if (result.paid) clearCart();
      } else if (order) {
        const o = await fetchOrderByNumber(order);
        setPaid(o?.status === "paid" || o?.status === "processing" || o?.status === "shipped" || o?.status === "delivered");
        if (o?.status === "paid") clearCart();
        if (o?.customerEmail && !emailParam) setCustomerEmail(o.customerEmail);
      }
      if (order) setOrderNumber(order);
      if (emailParam) setCustomerEmail(emailParam);
      await refreshProducts();
      setLoading(false);
    }

    verify();
  }, [params, clearCart, refreshProducts]);

  const trackUrl = orderNumber
    ? `/track-order?order=${encodeURIComponent(orderNumber)}${customerEmail ? `&email=${encodeURIComponent(customerEmail)}` : ""}`
    : "/track-order";

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

      {customerEmail && (
        <div className="flex items-start gap-3 bg-cream/40 rounded-2xl p-4 mt-6 text-left">
          <Mail size={20} className="text-green shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to{" "}
            <span className="font-semibold text-gray-950">{customerEmail}</span>.
            Please check your inbox and spam folder.
          </p>
        </div>
      )}

      {orderNumber && (
        <div className="bg-cream/40 rounded-3xl p-6 mb-6 text-left mt-6">
          <p className="text-sm text-gray-500 mb-1">Order number</p>
          <p className="font-display font-bold text-xl text-green">#{orderNumber}</p>
          <p className="text-xs text-gray-500 mt-2">Keep this number to track your order later.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={trackUrl} className="btn-primary flex items-center justify-center gap-2">
          <PackageSearch size={18} /> Track my order
        </Link>
        <Link to="/shop" className="btn-outline">Continue shopping</Link>
      </div>

      <p className="text-sm text-gray-500 mt-8">
        Want to manage your orders easily?{" "}
        <Link to="/account" className="text-green font-semibold hover:text-orange">Create an account</Link>
        {" "}with the same email to link future purchases.
      </p>
    </div>
  );
}
