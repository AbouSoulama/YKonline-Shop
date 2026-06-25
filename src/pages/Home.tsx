import { Leaf, Sparkles, Heart, ShieldCheck, Droplets, Hand, Sun, Star, ArrowRight, Check, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import SubscribeForm from "../components/SubscribeForm";
import { useProducts } from "../context/ProductsContext";
import { useReviews } from "../context/ReviewContext";
import { usePageMeta } from "../lib/seo";

const benefits = [
  { icon: Leaf, title: "100% Natural", desc: "A simple, rich and authentic care product for a healthier beauty routine." },
  { icon: Sparkles, title: "Premium Quality", desc: "Carefully selected shea butter for its texture, richness and versatility." },
  { icon: Heart, title: "Skin & Hair", desc: "Ideal for nourishing dry areas, protecting hair and softening skin." },
  { icon: ShieldCheck, title: "Secure Payment", desc: "Shop with confidence with a reliable and protected payment system." },
];

const usages = [
  { icon: Droplets, title: "Body", method: "Take a small amount, warm between hands, then apply." },
  { icon: Sun, title: "Skin", method: "Massage onto clean skin, focusing on dry areas." },
  { icon: Sparkles, title: "Hair", method: "Apply to lengths and ends, or as an oil treatment before shampoo." },
  { icon: Hand, title: "Feet & Hands", method: "Apply generously in the evening." },
];

// Reviews are now loaded from ReviewContext (shared store)

const commitments = [
  "Carefully selected products",
  "Simple, transparent ingredients",
  "Fast shipping worldwide",
  "Available customer service",
  "Natural beauty advice",
  "Secure online store",
];

export default function Home() {
  usePageMeta({
    title: "YKonline Shop - Natural Organic Premium Shea Butter",
    description: "Premium organic shea butter to naturally nourish your skin and hair. 100% natural, fast shipping worldwide.",
    path: "/",
  });

  const { products } = useProducts();
  const featured = products.slice(0, 4);
  const { getHomepageReviews } = useReviews();
  const reviews = getHomepageReviews();

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative min-h-[calc(100svh-116px)] overflow-hidden bg-green text-white">
        <img
          src="/images/hero-shea-premium.jpg"
          alt="Premium organic shea butter jars, shea nuts and botanical leaves"
          className="hero-zoom absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,36,14,0.96)_0%,rgba(11,102,35,0.88)_38%,rgba(11,102,35,0.34)_70%,rgba(0,0,0,0.06)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/55 to-transparent" />
        <div className="container-page relative z-10 flex min-h-[calc(100svh-116px)] items-center py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="reveal-up mb-4 font-display text-lg md:text-2xl font-semibold text-orange">
              Natural care that nourishes your beauty.
            </p>
            <h1 className="reveal-up delay-100 font-display text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.92] tracking-[-0.05em]">
              YKonline Shop
            </h1>
            <p className="reveal-up delay-200 mt-7 max-w-2xl text-base md:text-xl leading-relaxed text-white/90">
              Discover pure, rich and authentic organic shea butter, selected to care for your skin, your hair and your whole family.
            </p>
            <div className="reveal-up delay-300 mt-9 flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="btn-accent">
                Buy Now <ArrowRight size={18} />
              </Link>
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-white/10 px-8 py-4 font-display font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-green">
                Discover Our Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="relative -mt-1 border-b border-green/10 bg-white">
        <div className="premium-divider" />
        <div className="container-page py-8 grid grid-cols-2 md:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="group flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-green text-white transition-transform group-hover:scale-110">
                <b.icon size={22} />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-gray-950">{b.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-page">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-orange">BESTSELLERS</span>
              <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-gray-950">Our featured shea butters</h2>
            </div>
            <Link to="/shop" className="flex items-center gap-2 font-bold text-green transition-colors hover:text-orange">
              View all products <ArrowRight size={20} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container-page grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div className="order-2 md:order-1">
            <span className="text-orange font-bold text-sm uppercase tracking-wider">Why YKonline Shop</span>
            <h2 className="mt-2 mb-5 font-display text-4xl md:text-6xl font-extrabold leading-tight tracking-[-0.04em] text-gray-950">Natural, simple and effective care</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              At YKonline Shop, we believe in the power of natural care. Our organic shea butter is a beauty essential for those seeking a versatile, nourishing and skin-friendly product. Its generous texture melts upon contact with skin and helps provide comfort, softness and suppleness.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {commitments.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-green flex items-center justify-center shrink-0 mt-0.5"><Check size={12} className="text-white" /></span>
                  {c}
                </li>
              ))}
            </ul>
            <Link to="/about" className="btn-accent">Learn more about us <ArrowRight size={18} /></Link>
          </div>
          <div className="order-1 overflow-hidden rounded-[2.5rem] shadow-[0_30px_90px_rgba(139,90,43,0.22)] md:order-2">
            <img src="/images/raw-shea-jar.jpg" alt="Unrefined organic shea butter texture and jar" className="h-full min-h-[420px] w-full object-cover transition-transform duration-700 hover:scale-105" />
          </div>
        </div>
      </section>

      {/* Usage guide */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div className="md:sticky md:top-32">
            <span className="text-orange font-bold text-sm uppercase tracking-wider">How to use</span>
            <h2 className="mt-2 font-display text-4xl md:text-6xl font-extrabold leading-tight tracking-[-0.04em] text-gray-950">One butter. Many rituals.</h2>
            <p className="mt-5 text-gray-600 leading-relaxed">A few gestures are all it takes to integrate organic shea butter into your daily body, skin and hair care routine.</p>
            <Link to="/routines" className="btn-outline mt-8">See all routines</Link>
          </div>
          <div className="divide-y divide-green/15 border-y border-green/15">
            {usages.map((u, i) => (
              <div key={u.title} className="group grid gap-5 py-8 sm:grid-cols-[90px_1fr]">
                <div className="flex items-center gap-4">
                  <span className="font-display text-4xl font-extrabold text-green/20 transition-colors group-hover:text-orange">{String(i + 1).padStart(2, "0")}</span>
                  <u.icon className="text-green" size={26} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-gray-950">{u.title}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{u.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Carousel */}
      <ReviewsCarousel reviews={reviews} />

      {/* Commitments strip */}
      <section className="container-page py-16 md:py-20">
        <div className="grid grid-cols-1 divide-y divide-green/15 border-y border-green/15 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { icon: Sparkles, title: "Rigorous selection", desc: "Each batch is selected for its richness and authenticity." },
            { icon: Leaf, title: "Premium quality", desc: "100% pure, unrefined, organic shea butter, no compromise." },
            { icon: Heart, title: "Responsive service", desc: "A team at your disposal to advise and accompany you." },
          ].map((c) => (
            <div key={c.title} className="p-8 md:p-10">
              <div className="w-14 h-14 rounded-full bg-green flex items-center justify-center mb-4">
                <c.icon className="text-white" size={24} />
              </div>
              <h3 className="font-display font-bold text-2xl text-gray-950 mb-2">{c.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-page pb-16">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-orange to-orange-dark text-white p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Join the YKonline Shop community</h2>
              <p className="text-white/90">Receive our natural beauty tips, exclusive offers and new products.</p>
            </div>
            <SubscribeForm
              layout="row"
              className="bg-white rounded-full p-2 shadow-xl"
              inputClassName="flex-1 px-5 py-3 rounded-full text-gray-800 focus:outline-none"
              buttonClassName="bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors whitespace-nowrap"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Reviews Carousel Component ──
import type { Review } from "../context/ReviewContext";

function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const { approvedReviews } = useReviews();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const total = reviews.length;

  const next = useCallback(() => {
    if (total === 0) return;
    setCurrent(c => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setCurrent(c => (c - 1 + total) % total);
  }, [total]);

  const goTo = (i: number) => {
    setCurrent(i);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next, total]);

  if (total === 0) {
    return (
      <section className="bg-cream py-16 md:py-24">
        <div className="container-page text-center">
          <p className="text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
        </div>
      </section>
    );
  }

  const review = reviews[current];

  // Show 3 cards on desktop, single on mobile
  const getVisibleReviews = () => {
    if (total <= 3) return reviews;
    const arr = [];
    for (let i = 0; i < 3; i++) {
      arr.push(reviews[(current + i) % total]);
    }
    return arr;
  };

  const visible = getVisibleReviews();

  const stats = (() => {
    const approved = approvedReviews;
    const count = approved.length;
    if (count === 0) {
      return [
        { value: "—", label: "Average rating" },
        { value: "0", label: "Verified reviews" },
        { value: "—", label: "Would recommend" },
        { value: "0", label: "Happy customers" },
      ];
    }
    const avg = approved.reduce((sum, r) => sum + r.rating, 0) / count;
    const recommend = Math.round((approved.filter(r => r.rating >= 4).length / count) * 100);
    const uniqueCustomers = new Set(approved.map(r => r.customer)).size;
    return [
      { value: `${avg.toFixed(1)}/5`, label: "Average rating" },
      { value: `${count}+`, label: "Verified reviews" },
      { value: `${recommend}%`, label: "Would recommend" },
      { value: `${uniqueCustomers}+`, label: "Happy customers" },
    ];
  })();

  return (
    <section className="relative overflow-hidden bg-cream py-20 md:py-28">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,121,0,0.1),transparent_35rem)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(11,102,35,0.08),transparent_35rem)]" />

      <div className="container-page relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-orange mb-5">
              <Star size={14} className="fill-current" /> Customer Reviews
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-gray-950">
              What our customers<br />
              <span className="text-orange">are saying.</span>
            </h2>
          </div>

          {/* Navigation arrows */}
          {total > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { prev(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 8000); }}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green/20 text-green transition-all hover:border-orange hover:bg-orange hover:text-white"
                aria-label="Previous review"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => { next(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 8000); }}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green/20 text-green transition-all hover:border-orange hover:bg-orange hover:text-white"
                aria-label="Next review"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        {/* Cards grid - 3 on desktop, 1 on mobile */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {visible.map((r, i) => (
            <ReviewCard key={`${r.id}-${i}`} review={r} featured={i === 0} />
          ))}
        </div>

        {/* Mobile single card */}
        <div className="md:hidden">
          <ReviewCard review={review} featured />
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "h-3 w-10 bg-orange"
                    : "h-3 w-3 bg-green/20 hover:bg-green/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-green/10 bg-white p-5 text-center shadow-sm">
              <p className="font-display text-2xl md:text-3xl font-extrabold text-green">{s.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, featured }: { review: Review; featured?: boolean }) {
  return (
    <div className={`group relative overflow-hidden rounded-[2rem] p-7 md:p-8 transition-all duration-500 ${
      featured
        ? "bg-gradient-to-br from-orange to-orange-dark text-white shadow-[0_30px_80px_rgba(255,121,0,0.25)]"
        : "border border-green/10 bg-white text-gray-950 shadow-sm hover:shadow-md"
    }`}>
      {/* Quote icon */}
      <Quote size={48} className={`absolute top-5 right-5 ${featured ? "text-white/15" : "text-green/10"}`} />

      {/* Stars */}
      <div className="mb-5 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={18} className={i < review.rating
            ? (featured ? "text-white fill-white" : "text-orange fill-orange")
            : featured ? "text-white/20" : "text-gray-200"
          } />
        ))}
      </div>

      {/* Text */}
      <blockquote className={`font-display text-lg md:text-xl font-semibold leading-snug mb-6 ${featured ? "text-white" : "text-gray-800"}`}>
        "{review.text}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full font-extrabold text-sm ${
          featured ? "bg-white/20 text-white" : "bg-green/10 text-green"
        }`}>
          {review.customer[0]}
        </div>
        <div>
          <p className="font-bold text-sm">{review.customer}</p>
          <p className={`text-xs ${featured ? "text-white/70" : "text-gray-500"}`}>Verified buyer - {review.product}</p>
        </div>
      </div>
    </div>
  );
}
