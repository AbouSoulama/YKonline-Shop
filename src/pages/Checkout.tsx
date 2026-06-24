import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, CreditCard, Check, ChevronLeft, Lock, Loader2, MapPin, AlertCircle } from "lucide-react";
import { useCart, formatPrice } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { calculateShipping, STORE_ADDRESS } from "../lib/shipping";
import { createOrder } from "../lib/orders";
import { createCheckoutSession } from "../lib/payments";
import { validateEmail, validateName, validatePhone } from "../lib/validation";

const PAYMENT_METHODS = [
  {
    id: "card" as const,
    label: "Credit Card",
    logo: (
      <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
        <rect width="48" height="32" rx="4" fill="#1A1F71" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">VISA</text>
      </svg>
    ),
  },
  {
    id: "paypal" as const,
    label: "PayPal",
    logo: (
      <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
        <rect width="48" height="32" rx="4" fill="#003087" />
        <text x="24" y="14" textAnchor="middle" fill="#009CDE" fontSize="8" fontWeight="bold" fontFamily="Arial">Pay</text>
        <text x="24" y="24" textAnchor="middle" fill="#012169" fontSize="8" fontWeight="bold" fontFamily="Arial">Pal</text>
      </svg>
    ),
  },
  {
    id: "stripe" as const,
    label: "Stripe",
    logo: (
      <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
        <rect width="48" height="32" rx="4" fill="#635BFF" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">stripe</text>
      </svg>
    ),
  },
];

export default function Checkout() {
  const { items, subtotal, discount, shipping, shippingDistanceKm, setShippingCost, total, setIsOpen } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("stripe");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<{ cost: number; expressCost: number; distanceKm: number } | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  const [form, setForm] = useState({
    email: user?.email ?? "",
    phone: "",
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    address: "",
    city: "",
    country: "United States",
  });

  const activeShipping = shippingMethod === "express" && quote ? quote.expressCost : (quote?.cost ?? shipping);
  const orderTotal = subtotal - discount + activeShipping;

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center max-w-lg">
        <h1 className="font-display text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some of our premium organic shea butters to get started.</p>
        <Link to="/shop" className="btn-primary">Browse products</Link>
      </div>
    );
  }

  const validateStep1 = () => {
    const emailErr = validateEmail(form.email);
    if (emailErr) return emailErr;
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) return phoneErr;
    const fnErr = validateName(form.firstName);
    if (fnErr) return fnErr;
    const lnErr = validateName(form.lastName);
    if (lnErr) return lnErr;
    if (!form.address.trim() || form.address.length < 5) return "Please enter a valid delivery address.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.country.trim()) return "Please enter your country.";
    return null;
  };

  const computeShipping = async () => {
    setCalculatingShipping(true);
    setError("");
    try {
      const result = await calculateShipping(form.address, form.city, form.country);
      setQuote(result);
      setShippingCost(result.cost, result.distanceKm);
    } catch {
      setError("Unable to calculate shipping. Please check your address.");
    }
    setCalculatingShipping(false);
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setCalculatingShipping(true);
      try {
        const result = await calculateShipping(form.address, form.city, form.country);
        setQuote(result);
        setShippingCost(result.cost, result.distanceKm);
        setStep(2);
      } catch {
        setError("Unable to calculate shipping. Please verify your address.");
      }
      setCalculatingShipping(false);
      return;
    }

    if (step === 2) {
      const cost = shippingMethod === "express" && quote ? quote.expressCost : (quote?.cost ?? 0);
      setShippingCost(cost, quote?.distanceKm ?? 0);
      setStep(3);
      return;
    }

    // Step 3 — real payment via Stripe
    setLoading(true);
    const finalShipping = shippingMethod === "express" && quote ? quote.expressCost : (quote?.cost ?? shipping);
    const finalTotal = subtotal - discount + finalShipping;

    const order = await createOrder({
      customerEmail: form.email.trim().toLowerCase(),
      customerName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      items,
      subtotal,
      discount,
      shippingCost: finalShipping,
      shippingDistanceKm: quote?.distanceKm ?? shippingDistanceKm,
      total: finalTotal,
      paymentMethod: payment,
      shippingAddress: {
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        phone: form.phone.trim(),
      },
      userId: user?.id,
    });

    if (!order) {
      setError("Unable to create order. Please try again.");
      setLoading(false);
      return;
    }

    const checkout = await createCheckoutSession({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      paymentMethod: payment,
      successUrl: `${window.location.origin}/checkout/success`,
      cancelUrl: `${window.location.origin}/checkout`,
    });

    if ("error" in checkout) {
      setError(checkout.error);
      setLoading(false);
      return;
    }

    window.location.href = checkout.url;
  };

  return (
    <div className="fade-in">
      <section className="bg-cream/40 py-8 border-b border-cream">
        <div className="container-page">
          <Link to="/shop" onClick={() => setIsOpen(false)} className="text-sm text-gray-600 hover:text-green flex items-center gap-1 inline-flex"><ChevronLeft size={16} /> Continue shopping</Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-3">Checkout</h1>
          <div className="flex items-center gap-2 mt-4 text-sm">
            {["Delivery", "Shipping", "Payment"].map((l, i) => (
              <div key={l} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? "bg-green text-white" : step === i + 1 ? "bg-orange text-white" : "bg-cream text-gray-500"}`}>{step > i + 1 ? <Check size={14} /> : i + 1}</span>
                <span className={step >= i + 1 ? "text-gray-900 font-semibold" : "text-gray-500"}>{l}</span>
                {i < 2 && <span className="text-gray-300">-</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10 grid lg:grid-cols-[1fr_420px] gap-10">
        <form onSubmit={handleContinue} className="space-y-6">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-cream">
              <h2 className="font-display text-2xl font-bold mb-2">Delivery address</h2>
              <p className="text-sm text-gray-500 mb-5 flex items-start gap-2">
                <MapPin size={16} className="text-green shrink-0 mt-0.5" />
                Shipping is calculated from our store: {STORE_ADDRESS} at $0.69/km
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Email</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">Phone</label><input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">First name</label><input required type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">Last name</label><input required type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Street address</label><input required type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">City</label><input required type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">Country</label><input required type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-cream">
              <h2 className="font-display text-2xl font-bold mb-5">Shipping method</h2>
              {calculatingShipping ? (
                <div className="flex items-center gap-2 text-gray-500"><Loader2 size={18} className="animate-spin" /> Calculating distance...</div>
              ) : quote ? (
                <p className="text-sm text-gray-600 mb-4">Distance from store: <strong>{quote.distanceKm} km</strong></p>
              ) : (
                <button type="button" onClick={computeShipping} className="text-sm text-green font-semibold mb-4 hover:text-orange">Recalculate shipping</button>
              )}
              <div className="space-y-3">
                {[
                  { id: "standard" as const, name: "Standard Shipping", time: "3-5 business days", price: quote?.cost ?? shipping },
                  { id: "express" as const, name: "Express Shipping", time: "1-2 business days", price: quote?.expressCost ?? shipping + 5 },
                ].map((m) => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer ${shippingMethod === m.id ? "border-green bg-green-light/30" : "border-cream"}`}>
                    <input type="radio" name="shipping" checked={shippingMethod === m.id} onChange={() => {
                      setShippingMethod(m.id);
                      const cost = m.id === "express" ? (quote?.expressCost ?? 0) : (quote?.cost ?? 0);
                      setShippingCost(cost, quote?.distanceKm ?? 0);
                    }} className="accent-green" />
                    <Truck className="text-green" size={22} />
                    <div className="flex-1">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.time}</p>
                    </div>
                    <p className="font-display font-bold text-green">{formatPrice(m.price)}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-cream">
              <h2 className="font-display text-2xl font-bold mb-5">Payment method</h2>
              <p className="text-sm text-gray-500 mb-4">Payments are processed securely via Stripe. No card data is stored on our servers.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {PAYMENT_METHODS.map((p) => (
                  <button type="button" key={p.id} onClick={() => setPayment(p.id)} className={`flex flex-col items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition-colors ${payment === p.id ? "border-green bg-green-light/30 text-green" : "border-cream text-gray-600 hover:border-green"}`}>
                    {p.logo}
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl bg-cream/40 p-4 text-sm text-gray-600">
                {payment === "paypal"
                  ? "You will be redirected to PayPal via Stripe to complete your payment securely."
                  : "You will be redirected to Stripe Checkout to enter your payment details securely."}
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500"><Lock size={14} className="text-green" /> SSL encrypted · PCI compliant via Stripe</div>
            </div>
          )}

          <div className="flex justify-between gap-3">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="btn-outline" disabled={loading}>Back</button>}
            <div className="ml-auto">
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading || calculatingShipping}>
                {loading && <Loader2 size={18} className="animate-spin" />}
                {step < 3 ? "Continue" : `Pay ${formatPrice(orderTotal)}`}
              </button>
            </div>
          </div>
        </form>

        <aside className="bg-cream/40 rounded-3xl p-6 h-fit lg:sticky lg:top-32">
          <h3 className="font-display font-bold text-lg mb-4">Order summary</h3>
          <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
            {items.map((i) => (
              <div key={i.id} className="flex gap-3">
                <div className="relative">
                  <img src={i.image} alt={i.name} className="w-16 h-16 rounded-xl object-cover bg-white" />
                  <span className="absolute -top-2 -right-2 bg-green text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{i.quantity}</span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold line-clamp-2">{i.name}</p>
                  <p className="text-xs text-gray-500">{i.size}</p>
                  <p className="font-display font-bold text-green text-sm">{formatPrice(i.price * i.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-cream pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green"><span>Discount (WELCOME10)</span><span className="font-semibold">-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between">
              <span>Shipping{shippingDistanceKm > 0 ? ` (${shippingDistanceKm} km)` : ""}</span>
              <span className="font-semibold">{activeShipping > 0 ? formatPrice(activeShipping) : "—"}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-cream">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-bold text-green">{formatPrice(orderTotal)}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1"><ShieldCheck size={14} className="text-green" /> Secure payment</div>
            <div className="flex items-center gap-1"><Truck size={14} className="text-green" /> Distance-based</div>
            <div className="flex items-center gap-1"><CreditCard size={14} className="text-green" /> Stripe & PayPal</div>
            <div className="flex items-center gap-1"><Check size={14} className="text-green" /> Satisfaction</div>
          </div>
        </aside>
      </section>
    </div>
  );
}
