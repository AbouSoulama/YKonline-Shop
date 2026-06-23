import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  addReview: (review: Omit<Review, "id" | "date" | "approved">) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;
  getProductReviews: (productId: string) => Review[];
  getHomepageReviews: () => Review[];
}

const ReviewContext = createContext<ReviewContextValue | null>(null);
const STORAGE_KEY = "ykonline_reviews";

const defaultReviews: Review[] = [
  { id: "R001", customer: "Aminata", product: "Unrefined Organic Raw Shea Butter - 250g", productId: "raw-250g", rating: 5, text: "I love the texture. The butter melts well in my hands and leaves my skin very soft.", date: "Jan 10, 2026", approved: true },
  { id: "R002", customer: "Claire", product: "Unrefined Organic Raw Shea Butter - 100g", productId: "raw-100g", rating: 5, text: "Very good product, natural and effective. I also use it for my hair.", date: "Jan 08, 2026", approved: true },
  { id: "R003", customer: "Mariam", product: "Organic Whipped Shea Butter - 150ml", productId: "whipped-150ml", rating: 5, text: "Fast delivery and well-packaged product. I recommend.", date: "Jan 05, 2026", approved: true },
  { id: "R004", customer: "Sophie", product: "YKonline Shop Discovery Set", productId: "discovery-set", rating: 5, text: "A real discovery. My dry skin is visibly more comfortable and softer.", date: "Jan 03, 2026", approved: true },
];

function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultReviews;
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(loadReviews);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const approvedReviews = reviews.filter(r => r.approved);
  const pendingReviews = reviews.filter(r => !r.approved);

  const addReview = (review: Omit<Review, "id" | "date" | "approved">) => {
    const newReview: Review = {
      ...review,
      id: `R${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      approved: false,
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const approveReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  };

  const deleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter(r => r.approved && r.productId === productId);
  };

  const getHomepageReviews = () => {
    return approvedReviews.slice(0, 6);
  };

  return (
    <ReviewContext.Provider value={{ reviews, approvedReviews, pendingReviews, addReview, approveReview, deleteReview, getProductReviews, getHomepageReviews }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewProvider");
  return ctx;
}
