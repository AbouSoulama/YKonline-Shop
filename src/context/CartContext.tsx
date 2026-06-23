import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  discount: number;
  shipping: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ykonline_cart";
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FLAT = 4.9;

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateQuantity = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const discount = useMemo(() => {
    const code = promoCode.trim().toUpperCase();
    if (code === "WELCOME10" && subtotal > 0) return subtotal * 0.1;
    return 0;
  }, [promoCode, subtotal]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    if (subtotal - discount >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_FLAT;
  }, [subtotal, discount]);

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
        discount,
        shipping,
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
export const FREE_SHIPPING_AMOUNT = FREE_SHIPPING_THRESHOLD;
