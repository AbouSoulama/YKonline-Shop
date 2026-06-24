import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { validatePromoCode } from "../lib/promos";

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

interface AppliedPromo {
  code: string;
  discount: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number, maxStock?: number) => string | null;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number, maxStock?: number) => string | null;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  appliedPromo: AppliedPromo | null;
  applyPromo: () => Promise<string | null>;
  clearPromo: () => void;
  discount: number;
  shipping: number;
  shippingDistanceKm: number;
  setShippingCost: (cost: number, distanceKm?: number) => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ykonline_cart";
const PROMO_KEY = "ykonline_promo";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(() => {
    try {
      const raw = localStorage.getItem(PROMO_KEY);
      return raw ? (JSON.parse(raw) as AppliedPromo) : null;
    } catch {
      return null;
    }
  });
  const [shippingCost, setShippingCostState] = useState(0);
  const [shippingDistanceKm, setShippingDistanceKm] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedPromo) localStorage.setItem(PROMO_KEY, JSON.stringify(appliedPromo));
    else localStorage.removeItem(PROMO_KEY);
  }, [appliedPromo]);

  const setShippingCost = (cost: number, distanceKm = 0) => {
    setShippingCostState(cost);
    setShippingDistanceKm(distanceKm);
  };

  const addItem: CartContextValue["addItem"] = (item, qty = 1, maxStock) => {
    let error: string | null = null;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const newQty = (existing?.quantity ?? 0) + qty;
      if (maxStock !== undefined && newQty > maxStock) {
        error = maxStock === 0 ? `${item.name} is out of stock.` : `Only ${maxStock} available for ${item.name}.`;
        return prev;
      }
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, quantity: qty }];
    });
    if (!error) setIsOpen(true);
    return error;
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, qty: number, maxStock?: number) => {
    const next = Math.max(1, qty);
    if (maxStock !== undefined && next > maxStock) {
      return `Only ${maxStock} available.`;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: next } : i)));
    return null;
  };

  const clearCart = () => {
    setItems([]);
    setShippingCostState(0);
    setShippingDistanceKm(0);
    setAppliedPromo(null);
    setPromoCode("");
  };

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const applyPromo = useCallback(async () => {
    const result = await validatePromoCode(promoCode, subtotal);
    if (!result.valid || !result.discount) {
      setAppliedPromo(null);
      return result.error ?? "Invalid promo code.";
    }
    setAppliedPromo({ code: result.code ?? promoCode.toUpperCase(), discount: result.discount });
    return null;
  }, [promoCode, subtotal]);

  const clearPromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  const discount = appliedPromo?.discount ?? 0;
  const shipping = items.length === 0 ? 0 : shippingCost;
  const total = subtotal - discount + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isOpen,
        setIsOpen,
        promoCode,
        setPromoCode,
        appliedPromo,
        applyPromo,
        clearPromo,
        discount,
        shipping,
        shippingDistanceKm,
        setShippingCost,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
