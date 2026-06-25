import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface Review {
  id: string;
  customer: string;
  product: string;
  productId: string;
  rating: number;
  text: string;
  date: string;
  approved: boolean;
}

interface ReviewContextValue {
  reviews: Review[];
  approvedReviews: Review[];
  pendingReviews: Review[];
  loading: boolean;
  addReview: (review: Omit<Review, "id" | "date" | "approved">) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  getProductReviews: (productId: string) => Review[];
  getHomepageReviews: () => Review[];
  getProductRatingStats: (productId: string, fallback?: { rating: number; count: number }) => { rating: number; count: number };
}

const ReviewContext = createContext<ReviewContextValue | null>(null);
const STORAGE_KEY = "ykonline_reviews";

const defaultReviews: Review[] = [
  { id: "R001", customer: "Aminata", product: "Unrefined Organic Raw Shea Butter - 250g", productId: "raw-250g", rating: 5, text: "I love the texture. The butter melts well in my hands and leaves my skin very soft.", date: "Jan 10, 2026", approved: true },
  { id: "R002", customer: "Claire", product: "Unrefined Organic Raw Shea Butter - 100g", productId: "raw-100g", rating: 5, text: "Very good product, natural and effective. I also use it for my hair.", date: "Jan 08, 2026", approved: true },
  { id: "R003", customer: "Mariam", product: "Organic Whipped Shea Butter - 150ml", productId: "whipped-150ml", rating: 5, text: "Fast delivery and well-packaged product. I recommend.", date: "Jan 05, 2026", approved: true },
  { id: "R004", customer: "Sophie", product: "YKonline Shop Discovery Set", productId: "discovery-set", rating: 5, text: "A real discovery. My dry skin is visibly more comfortable and softer.", date: "Jan 03, 2026", approved: true },
];

interface ReviewRow {
  id: string;
  customer: string;
  product_id: string | null;
  product: string;
  rating: number;
  text: string;
  approved: boolean;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    customer: row.customer,
    product: row.product,
    productId: row.product_id ?? "",
    rating: row.rating,
    text: row.text,
    date: formatDate(row.created_at),
    approved: row.approved,
  };
}

function loadLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultReviews;
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(() => loadLocalReviews());
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const fetchReviews = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data.map(mapReview));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    }
  }, [reviews]);

  const approvedReviews = reviews.filter(r => r.approved);
  const pendingReviews = reviews.filter(r => !r.approved);

  const addReview = async (review: Omit<Review, "id" | "date" | "approved">) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          customer: review.customer,
          product_id: review.productId,
          product: review.product,
          rating: review.rating,
          text: review.text,
          approved: false,
        })
        .select()
        .single();

      if (!error && data) {
        setReviews(prev => [mapReview(data as ReviewRow), ...prev]);
      }
      return;
    }

    const newReview: Review = {
      ...review,
      id: `R${Date.now()}`,
      date: formatDate(new Date().toISOString()),
      approved: false,
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const approveReview = async (id: string) => {
    const review = reviews.find(r => r.id === id);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
      if (error) return;
    }
    const updated = reviews.map(r => r.id === id ? { ...r, approved: true } : r);
    setReviews(updated);
    if (review?.productId) {
      const approved = updated.filter(r => r.approved && r.productId === review.productId);
      const count = approved.length;
      const rating = count ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
      if (isSupabaseConfigured) {
        await supabase.from("products").update({ reviews_count: count, rating: count ? rating : null }).eq("id", review.productId);
      }
    }
  };

  const deleteReview = async (id: string) => {
    const review = reviews.find(r => r.id === id);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) return;
    }
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    if (review?.productId) {
      const approved = updated.filter(r => r.approved && r.productId === review.productId);
      const count = approved.length;
      const rating = count ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
      if (isSupabaseConfigured) {
        await supabase.from("products").update({ reviews_count: count, rating: count ? rating : null }).eq("id", review.productId);
      }
    }
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter(r => r.approved && r.productId === productId);
  };

  const getProductRatingStats = (productId: string, fallback?: { rating: number; count: number }) => {
    const approved = reviews.filter(r => r.approved && r.productId === productId);
    if (!approved.length) {
      return { rating: fallback?.rating ?? 0, count: fallback?.count ?? 0 };
    }
    const count = approved.length;
    const rating = Math.round((approved.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10;
    return { rating, count };
  };

  const getHomepageReviews = () => approvedReviews.slice(0, 6);

  return (
    <ReviewContext.Provider value={{
      reviews, approvedReviews, pendingReviews, loading,
      addReview, approveReview, deleteReview, getProductReviews, getHomepageReviews, getProductRatingStats,
    }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewProvider");
  return ctx;
}
