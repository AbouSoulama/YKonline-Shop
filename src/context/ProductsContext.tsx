import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Product, products as fallbackProducts } from "../data/products";

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

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    longDescription: row.long_description ?? "",
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    size: row.size ?? "",
    type: (row.type as Product["type"]) ?? "Raw",
    usage: row.usage ?? [],
    image: row.image ?? "",
    gallery: row.gallery ?? [],
    rating: Number(row.rating ?? 0),
    reviews: row.reviews_count ?? 0,
    stock: row.stock ?? 0,
    badge: row.badge ?? undefined,
    ingredients: row.ingredients ?? "",
    storage: row.storage ?? "",
    benefits: row.benefits ?? [],
    howToUse: row.how_to_use ?? [],
  };
}

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
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
      setProducts(data.map(row => mapProduct(row as ProductRow)));
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
    <ProductsContext.Provider value={{ products, loading, getProductById, getRelatedProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
