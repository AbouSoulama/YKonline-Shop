import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

const sizes = ["All", "100g", "250g", "500g", "150ml", "Set", "Pack"];
const types: ("All" | "Raw" | "Whipped" | "Set")[] = ["All", "Raw", "Whipped", "Set"];
const usages = ["All", "Skin", "Hair", "Baby/Family", "Massage"];
const sorts = [
  { value: "popular", label: "Popularity" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Best Rated" },
];

export default function Shop() {
  const [size, setSize] = useState("All");
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [usage, setUsage] = useState("All");
  const [sort, setSort] = useState("popular");
  const [query, setQuery] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (size !== "All") list = list.filter((p) => p.size === size);
    if (type !== "All") list = list.filter((p) => p.type === type);
    if (usage !== "All") list = list.filter((p) => p.usage.includes(usage));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "newest": list.sort((a, b) => b.reviews - a.reviews); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [size, type, usage, sort, query]);

  const Filters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-gray-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${size === s ? "bg-green text-white border-green" : "border-cream text-gray-600 hover:border-green"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-display font-semibold text-gray-900 mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${type === t ? "bg-orange text-white border-orange" : "border-cream text-gray-600 hover:border-orange"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-display font-semibold text-gray-900 mb-3">Usage</h3>
        <div className="space-y-1">
          {usages.map((u) => (
            <label key={u} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1">
              <input type="radio" name="usage" checked={usage === u} onChange={() => setUsage(u)} className="accent-green" />
              {u}
            </label>
          ))}
        </div>
      </div>
      <button onClick={() => { setSize("All"); setType("All"); setUsage("All"); setQuery(""); }} className="text-sm text-green font-semibold hover:text-orange">Reset filters</button>
    </div>
  );

  return (
    <div className="fade-in">
      <section className="relative overflow-hidden bg-green py-16 text-white md:py-20">
        <img src="/images/hero-shea-premium.jpg" alt="Organic shea butter product selection" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-green via-green/90 to-green/40" />
        <div className="container-page relative">
          <p className="text-sm text-orange font-bold uppercase tracking-[0.22em]">Shop</p>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight tracking-[-0.05em] mt-2">Our Organic Shea Butters</h1>
          <p className="text-white/82 mt-4 max-w-2xl text-lg">Explore our selection of premium organic shea butters. Pure, rich and authentic, chosen to take care of your skin and hair naturally.</p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center justify-between">
          <form onSubmit={(e) => e.preventDefault()} className="relative md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="w-full pl-11 pr-4 py-3 rounded-full border border-cream bg-cream/30 focus:outline-none focus:border-green" />
          </form>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileFilters(!mobileFilters)} className="md:hidden flex items-center gap-2 px-4 py-3 rounded-full border border-cream font-semibold text-sm">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="flex items-center gap-2">
              <Grid size={18} className="text-green" />
              <List size={18} className="text-gray-400" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-3 rounded-full border border-cream bg-white text-sm font-semibold focus:outline-none focus:border-green">
              {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {mobileFilters && (
          <div className="md:hidden bg-cream/40 rounded-3xl p-5 mb-6">
            <Filters />
          </div>
        )}

        <div className="grid md:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden md:block">
            <div className="sticky top-32 bg-cream/40 rounded-3xl p-6">
              <Filters />
            </div>
          </aside>
          <div>
            <p className="text-sm text-gray-500 mb-5">{filtered.length} product{filtered.length > 1 ? "s" : ""} found</p>
            {filtered.length === 0 ? (
              <div className="bg-cream/40 rounded-3xl p-12 text-center">
                <p className="text-gray-600">No products match your filters. Try adjusting them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
