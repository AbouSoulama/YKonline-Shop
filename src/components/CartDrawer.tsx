import { X, Minus, Plus, ShoppingBag, Trash2, Tag, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart, formatPrice } from "../context/CartContext";
import { useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, discount, shipping, total, promoCode, setPromoCode, clearCart } = useCart();
  const [applied, setApplied] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      setApplied(true);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl transition-transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-cream">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <ShoppingBag size={20} className="text-green" /> Your Cart
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-green" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center mb-4">
              <ShoppingBag size={40} className="text-green" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-gray-500 text-sm mb-6">Discover our premium organic shea butters.</p>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="btn-primary">
              Shop now
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-green-light border border-green/20 rounded-2xl p-3 text-sm flex items-center gap-2 text-green">
                <Truck size={16} /> Shipping calculated at checkout based on your distance from our store ($0.69/km)
              </div>

              {items.map((item) => (
                <div key={item.id} className="flex gap-3 border border-cream rounded-2xl p-3">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-cream" />
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500" aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-cream rounded-full">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-green" aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-green" aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-display font-bold text-green">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <form onSubmit={handleApply} className="flex gap-2 pt-2">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setApplied(false); }}
                    placeholder="Promo code"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full border border-cream bg-cream/30 focus:outline-none focus:border-green text-sm"
                  />
                </div>
                <button type="submit" className="btn-accent !py-2.5 !px-5 text-sm">Apply</button>
              </form>
              {applied && <p className="text-green text-xs font-semibold">Discount applied with WELCOME10</p>}
            </div>

            <div className="border-t border-cream p-5 space-y-2 bg-cream/30">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green"><span>Discount</span><span className="font-semibold">-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className="font-semibold text-gray-400">At checkout</span></div>
              <div className="flex justify-between text-lg pt-2 border-t border-cream">
                <span className="font-display font-semibold">Subtotal</span>
                <span className="font-display font-bold text-green">{formatPrice(subtotal - discount)}</span>
              </div>
              <Link to="/checkout" onClick={() => setIsOpen(false)} className="btn-primary w-full mt-3">
                Checkout
              </Link>
              <button onClick={() => { clearCart(); setIsOpen(false); }} className="text-xs text-gray-500 hover:text-red-500 w-full text-center mt-1">
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
