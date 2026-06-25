import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Product, products as fallbackProducts } from "../data/products";
import { mapProductRow } from "../lib/products";

interface ProductRow {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  price: number;
  old_price: number | null;
  size: string | null;
  type: string | null;
  usage: string[] | null;
  image: string | null;
  gallery: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  stock: number | null;
  badge: string | null;
  ingredients: string | null;
  storage: string | null;
  benefits: string[] | null;
  how_to_use: { area: string; method: string }[] | null;
}

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getRelatedProducts: (id: string, limit?: number) => Product[];
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data?.length) {
      setProducts(data.map(row => mapProductRow(row as ProductRow)));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("products-stock")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          const row = payload.new as ProductRow;
          setProducts((prev) =>
            prev.map((p) =>
              p.id === row.id
                ? {
                    ...p,
                    stock: row.stock ?? 0,
                    price: Number(row.price),
                    oldPrice: row.old_price ? Number(row.old_price) : undefined,
                    reviews: row.reviews_count ?? p.reviews,
                    rating: Number(row.rating ?? p.rating),
                  }
                : p,
            ),
          );
        },
      )
      .subscribe();

    const onFocus = () => { fetchProducts(); };
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchProducts]);

  const getProductById = (id: string) => products.find(p => p.id === id);

  const getRelatedProducts = (id: string, limit = 4) =>
    products.filter(p => p.id !== id).slice(0, limit);

  return (
    <ProductsContext.Provider value={{ products, loading, refreshProducts: fetchProducts, getProductById, getRelatedProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
