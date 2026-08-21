import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Mail, MessageCircle, PackageSearch } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { verifyCheckoutSession } from "../lib/payments";
import { fetchOrderByNumber } from "../lib/orders";
import { useCart, calcTax } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import { usePageMeta } from "../lib/seo";
import {
  buildPaidOrderWhatsAppMessage,
  consumeStoredWhatsAppUrl,
  getOrderWhatsAppUrl,
  openOrderWhatsApp,
} from "../lib/whatsappOrder";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const { refreshProducts } = useProducts();
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [customerEmail, setCustomerEmail] = useState(params.get("email") ?? "");
  const [paid, setPaid] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

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
    const fromCheckoutWa = params.get("wa") === "1";

    async function verify() {
      let orderData = null as Awaited<ReturnType<typeof fetchOrderByNumber>>;

      if (sessionId) {
        const result = await verifyCheckoutSession(sessionId);
        setPaid(result.paid);
        if (result.paid) clearCart();
      }

      if (order) {
        orderData = await fetchOrderByNumber(order);
        const isPaid =
          orderData?.status === "paid" ||
          orderData?.status === "processing" ||
          orderData?.status === "shipped" ||
          orderData?.status === "delivered" ||
          fromCheckoutWa;
        setPaid(Boolean(isPaid));
        if (orderData?.status === "paid") clearCart();
        if (orderData?.customerEmail && !emailParam) setCustomerEmail(orderData.customerEmail);
        setOrderNumber(order);
      }

      if (emailParam) setCustomerEmail(emailParam);

      // URL saved when payment succeeded on checkout (already opened once)
      const stored = consumeStoredWhatsAppUrl();
      if (stored) {
        setWhatsappUrl(stored);
      } else if (orderData) {
        const itemsSubtotal = orderData.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const tax = calcTax(itemsSubtotal, 0);
        const msg = buildPaidOrderWhatsAppMessage({
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          items: orderData.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            size: i.size,
          })),
          subtotal: itemsSubtotal,
          shippingCost: orderData.shippingCost,
          tax,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          shippingAddress: orderData.shippingAddress,
        });
        const url = getOrderWhatsAppUrl(msg);
        setWhatsappUrl(url);
        // Redirect / session flows that didn't open WhatsApp on checkout
        if (!fromCheckoutWa && (orderData.status === "paid" || orderData.status === "processing")) {
          openOrderWhatsApp(msg);
        }
      }

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

      {whatsappUrl && (
        <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-3xl p-6 mb-6 text-left">
          <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MessageCircle size={18} className="text-[#25D366]" />
            Send your order on WhatsApp
          </p>
          <p className="text-sm text-gray-600 mb-4">
            WhatsApp should open with your complete order. If it did not open automatically, tap the button below to send it to the shop.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <MessageCircle size={18} /> Open WhatsApp
          </a>
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
