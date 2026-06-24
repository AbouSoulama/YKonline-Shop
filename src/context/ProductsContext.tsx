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
