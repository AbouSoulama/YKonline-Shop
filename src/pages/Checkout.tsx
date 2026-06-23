import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, CreditCard, Check, ChevronLeft, Lock } from "lucide-react";
import { useCart, formatPrice } from "../context/CartContext";

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit Card",
    logo: (
      <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
        <rect width="48" height="32" rx="4" fill="#1A1F71" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">VISA</text>
      </svg>
    ),
  },
  {
    id: "paypal",
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
    id: "stripe",
    label: "Stripe",
    logo: (
      <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
        <rect width="48" height="32" rx="4" fill="#635BFF" />
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">stripe</text>
      </svg>
    ),
  },
] as const;

export default function Checkout() {
  const { items, subtotal, discount, shipping, total, clearCart, setIsOpen } = useCart();
  const [step, setStep] = useState(1);
  const [placed, setPlaced] = useState(false);
  const [payment, setPayment] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("card");

  if (items.length === 0 && !placed) {
    return (
      <div className="container-page py-20 text-center max-w-lg">
        <h1 className="font-display text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some of our premium organic shea butters to get started.</p>
        <Link to="/shop" className="btn-primary">Browse products</Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container-page py-20 text-center max-w-2xl">
        <div className="w-20 h-20 rounded-full bg-green flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-white" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Thank you for your order!</h1>
        <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
        <p className="text-gray-500 text-sm mb-8">A confirmation email has been sent to your email address.</p>
        <div className="bg-cream/40 rounded-3xl p-6 mb-8 text-left">
          <p className="text-sm text-gray-500 mb-1">Order number</p>
          <p className="font-display font-bold text-xl text-green">#YK-{Math.floor(Math.random() * 90000 + 10000)}</p>
        </div>
        <Link to="/shop" className="btn-primary">Continue shopping</Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    clearCart();
    setPlaced(true);
  };

  return (
    <div className="fade-in">
      <section className="bg-cream/40 py-8 border-b border-cream">
        <div className="container-page">
          <Link to="/shop" onClick={() => setIsOpen(false)} className="text-sm text-gray-600 hover:text-green flex items-center gap-1 inline-flex"><ChevronLeft size={16} /> Continue shopping</Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-3">Checkout</h1>
          <div className="flex items-center gap-2 mt-4 text-sm">
            {["Information", "Shipping", "Payment"].map((l, i) => (
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
        <form onSubmit={submit} className="space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-cream">
              <h2 className="font-display text-2xl font-bold mb-5">Contact information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Email</label><input required type="email" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">Phone</label><input required type="tel" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">First name</label><input required type="text" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">Last name</label><input required type="text" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Address</label><input required type="text" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div><label className="block text-sm font-semibold mb-1">City</label><input required type="text" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Country</label><input required type="text" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-cream">
              <h2 className="font-display text-2xl font-bold mb-5">Shipping method</h2>
              <div className="space-y-3">
                {[
                  { id: "standard", name: "Standard Shipping", time: "3-5 business days", price: shipping === 0 ? "Free" : formatPrice(shipping) },
                  { id: "express", name: "Express Shipping", time: "1-2 business days", price: formatPrice(shipping === 0 ? 0 : shipping + 5) },
                ].map((m, i) => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer ${i === 0 ? "border-green bg-green-light/30" : "border-cream"}`}>
                    <input type="radio" name="shipping" defaultChecked={i === 0} className="accent-green" />
                    <Truck className="text-green" size={22} />
                    <div className="flex-1">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.time}</p>
                    </div>
                    <p className="font-display font-bold text-green">{m.price}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-cream">
              <h2 className="font-display text-2xl font-bold mb-5">Payment method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {PAYMENT_METHODS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition-colors ${payment === p.id ? "border-green bg-green-light/30 text-green" : "border-cream text-gray-600 hover:border-green"}`}
                  >
                    {p.logo}
                    {p.label}
                  </button>
                ))}
              </div>
              {payment === "card" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1">Card number</label><input required type="text" placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                  <div><label className="block text-sm font-semibold mb-1">Expiry</label><input required type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                  <div><label className="block text-sm font-semibold mb-1">CVC</label><input required type="text" placeholder="123" className="w-full px-4 py-3 rounded-2xl border border-cream bg-cream/30 focus:outline-none focus:border-green" /></div>
                </div>
              )}
              {payment === "paypal" && (
                <p className="rounded-2xl bg-cream/40 p-4 text-sm text-gray-600">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              )}
              {payment === "stripe" && (
                <p className="rounded-2xl bg-cream/40 p-4 text-sm text-gray-600">
                  Your payment will be processed securely via Stripe.
                </p>
              )}
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500"><Lock size={14} className="text-green" /> Your payment information is encrypted and secure.</div>
            </div>
          )}

          <div className="flex justify-between gap-3">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="btn-outline">Back</button>}
            <div className="ml-auto"><button type="submit" className="btn-primary">{step < 3 ? "Continue" : `Pay ${formatPrice(total)}`}</button></div>
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
            <div className="flex justify-between"><span>Shipping</span><span className="font-semibold">{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between text-lg pt-2 border-t border-cream">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-bold text-green">{formatPrice(total)}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1"><ShieldCheck size={14} className="text-green" /> Secure payment</div>
            <div className="flex items-center gap-1"><Truck size={14} className="text-green" /> Fast shipping</div>
            <div className="flex items-center gap-1"><CreditCard size={14} className="text-green" /> Stripe & PayPal</div>
            <div className="flex items-center gap-1"><Check size={14} className="text-green" /> Satisfaction</div>
          </div>
        </aside>
      </section>
    </div>
  );
}
