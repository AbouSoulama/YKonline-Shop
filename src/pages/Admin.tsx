import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Package, Users, ShoppingCart, Tag, FileText, Star, Settings, LogOut,
  Plus, Edit, Trash2, Search, Download, Eye, ChevronDown, TrendingUp,
  DollarSign, ShoppingBag, UserCheck, Check, AlertCircle,
  ArrowUpRight, ArrowDownRight, Leaf
} from "lucide-react";
import { SITE_EMAIL } from "../constants/site";
import { useAuth, confirmLogout } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import { useProducts } from "../context/ProductsContext";
import { fetchOrders, updateOrderStatus as dbUpdateOrderStatus } from "../lib/orders";
import { fetchAllPosts, createBlogPost, deleteBlogPost, toggleBlogPostStatus, type BlogPost as BlogPostType } from "../lib/blog";
import { upsertProduct, deleteProduct as dbDeleteProduct, generateProductId } from "../lib/products";
import { fetchPromoCodes, upsertPromoCode, togglePromoActive as dbTogglePromo } from "../lib/promos";
import type { Product as StoreProduct } from "../data/products";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { slugify } from "../constants/site";

// ── Types ──
interface Product {
  id: string; name: string; tagline: string; description: string; size: string; type: string; price: number; oldPrice: number; stock: number; status: "Active" | "Draft"; image: string; badge: string; ingredients: string; storage: string; usage: string[];
}
interface Order {
  dbId: string; id: string; customer: string; email: string; date: string; total: number; status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"; items: number;
}
interface Customer {
  id: string; name: string; email: string; orders: number; spent: number; joined: string;
}
interface Promo {
  id: string; code: string; discount: number; type: "percent" | "fixed"; uses: number; maxUses: number; active: boolean; expires: string;
}
interface BlogPost {
  id: string; title: string; category: string; status: "Published" | "Draft"; date: string; views: number;
}
// Review type imported from ReviewContext

// ── Initial Data ──
const initProducts: Product[] = [
  { id: "P001", name: "Unrefined Organic Raw Shea Butter", tagline: "The ideal size to discover the benefits of natural shea.", description: "An organic raw shea butter, rich and versatile.", size: "100g", type: "Raw", price: 12.90, oldPrice: 14.90, stock: 120, status: "Active", image: "/images/raw-shea-jar.jpg", badge: "Best Seller", ingredients: "Butyrospermum Parkii Butter. 100% pure, unrefined, organic.", storage: "Store in a dry place, away from heat and direct light.", usage: ["Skin", "Hair", "Baby/Family"] },
  { id: "P002", name: "Unrefined Organic Raw Shea Butter", tagline: "The essential natural care for the whole family.", description: "Generous size for regular use.", size: "250g", type: "Raw", price: 24.90, oldPrice: 28.90, stock: 80, status: "Active", image: "/images/raw-shea-jar.jpg", badge: "Most Popular", ingredients: "Butyrospermum Parkii Butter. 100% pure, unrefined, organic.", storage: "Store in a dry place, away from heat and direct light.", usage: ["Skin", "Hair", "Baby/Family", "Massage"] },
  { id: "P003", name: "Unrefined Organic Raw Shea Butter", tagline: "The large economical size for regular routines.", description: "Ideal for families, frequent use or natural care enthusiasts.", size: "500g", type: "Raw", price: 42.90, oldPrice: 49.90, stock: 45, status: "Active", image: "/images/raw-shea-jar.jpg", badge: "Best Value", ingredients: "Butyrospermum Parkii Butter. 100% pure, unrefined, organic.", storage: "Store in a dry place, away from heat and direct light.", usage: ["Skin", "Hair", "Baby/Family", "Massage"] },
  { id: "P004", name: "Organic Whipped Shea Butter", tagline: "All the richness of shea in a light and airy texture.", description: "Whipped texture that melts quickly on the skin.", size: "150ml", type: "Whipped", price: 19.90, oldPrice: 22.90, stock: 90, status: "Active", image: "/images/whipped-shea-jar.jpg", badge: "New", ingredients: "Butyrospermum Parkii Butter, whipped. 100% natural, organic.", storage: "Store in a cool, dry place away from direct sunlight.", usage: ["Skin", "Hair", "Baby/Family"] },
  { id: "P005", name: "YKonline Shop Discovery Set", tagline: "The ideal set to discover or gift natural shea care.", description: "A selection of products to create a complete natural beauty routine.", size: "Set", type: "Set", price: 39.90, oldPrice: 49.90, stock: 30, status: "Active", image: "/images/shea-discovery-set.jpg", badge: "Gift Idea", ingredients: "Butyrospermum Parkii Butter. Multiple formats included.", storage: "Store in a dry place, away from heat and direct light.", usage: ["Skin", "Hair", "Baby/Family"] },
  { id: "P006", name: "Family Shea Butter Pack", tagline: "The generous pack for the whole family.", description: "A generous pack combining raw and whipped shea butter.", size: "Pack", type: "Set", price: 59.90, oldPrice: 72.90, stock: 25, status: "Active", image: "/images/shea-discovery-set.jpg", badge: "Family", ingredients: "Butyrospermum Parkii Butter. Raw and whipped formats.", storage: "Store in a dry place, away from heat and direct light.", usage: ["Skin", "Hair", "Baby/Family", "Massage"] },
];

const initOrders: Order[] = [
  { id: "YK-2026-1089", customer: "Sarah Johnson", email: "sarah@mail.com", date: "Jan 15, 2026", total: 67.80, status: "Pending", items: 3 },
  { id: "YK-2026-1088", customer: "Aminata Diallo", email: "aminata@mail.com", date: "Jan 14, 2026", total: 42.90, status: "Processing", items: 1 },
  { id: "YK-2026-1087", customer: "Claire Martin", email: "claire@mail.com", date: "Jan 13, 2026", total: 24.90, status: "Shipped", items: 1 },
  { id: "YK-2026-1086", customer: "Sophie Laurent", email: "sophie@mail.com", date: "Jan 12, 2026", total: 99.70, status: "Delivered", items: 4 },
  { id: "YK-2026-1085", customer: "Mariam Keita", email: "mariam@mail.com", date: "Jan 11, 2026", total: 19.90, status: "Delivered", items: 1 },
  { id: "YK-2026-1084", customer: "Emma Wilson", email: "emma@mail.com", date: "Jan 10, 2026", total: 59.90, status: "Cancelled", items: 2 },
];

const initCustomers: Customer[] = [
  { id: "C001", name: "Sarah Johnson", email: "sarah@mail.com", orders: 5, spent: 189.50, joined: "Oct 2025" },
  { id: "C002", name: "Aminata Diallo", email: "aminata@mail.com", orders: 8, spent: 312.20, joined: "Aug 2025" },
  { id: "C003", name: "Claire Martin", email: "claire@mail.com", orders: 3, spent: 74.70, joined: "Nov 2025" },
  { id: "C004", name: "Sophie Laurent", email: "sophie@mail.com", orders: 12, spent: 567.80, joined: "Jun 2025" },
  { id: "C005", name: "Mariam Keita", email: "mariam@mail.com", orders: 6, spent: 234.40, joined: "Sep 2025" },
  { id: "C006", name: "Emma Wilson", email: "emma@mail.com", orders: 2, spent: 84.80, joined: "Dec 2025" },
];

const initPromos: Promo[] = [
  { id: "PR001", code: "WELCOME10", discount: 10, type: "percent", uses: 342, maxUses: 0, active: true, expires: "Dec 31, 2026" },
  { id: "PR002", code: "SUMMER15", discount: 15, type: "percent", uses: 89, maxUses: 200, active: true, expires: "Aug 31, 2026" },
  { id: "PR003", code: "FREESHIP", discount: 5, type: "fixed", uses: 156, maxUses: 500, active: false, expires: "Mar 31, 2026" },
];

const initBlog: BlogPost[] = [
  { id: "B001", title: "The benefits of organic shea butter for the skin", category: "Benefits", status: "Published", date: "Jan 12, 2026", views: 1240 },
  { id: "B002", title: "Raw shea vs refined shea: what are the differences?", category: "Guide", status: "Published", date: "Jan 05, 2026", views: 890 },
  { id: "B003", title: "How to use shea butter on hair: our tips", category: "Hair care", status: "Draft", date: "Dec 28, 2025", views: 0 },
];

// Reviews now come from ReviewContext (shared with customer dashboard)

type Tab = "dashboard" | "products" | "orders" | "customers" | "promos" | "blog" | "reviews" | "settings";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  paid: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

function mapOrderStatus(s: string): Order["status"] {
  const m: Record<string, Order["status"]> = {
    pending: "Pending", paid: "Processing", processing: "Processing",
    shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
  };
  return m[s.toLowerCase()] ?? "Pending";
}

function toDbStatus(s: Order["status"]): string {
  const m: Record<Order["status"], string> = {
    Pending: "pending", Processing: "paid", Shipped: "shipped",
    Delivered: "delivered", Cancelled: "cancelled",
  };
  return m[s];
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ── Component ──
export default function Admin() {
  const { isAdmin, login, logout, refreshUser } = useAuth();
  const { products: storeProducts, refreshProducts } = useProducts();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");

  // Data states
  const [products, setProducts] = useState(initProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(initCustomers);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [blog, setBlog] = useState<BlogPost[]>([]);
  const { reviews, approveReview: ctxApproveReview, deleteReview: ctxDeleteReview, pendingReviews } = useReviews();

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) refreshUser();
  }, [isAdmin, refreshUser]);

  const loadAdminData = async () => {
    const [ordersData, blogData, promosData] = await Promise.all([
      fetchOrders(),
      fetchAllPosts(),
      fetchPromoCodes(),
    ]);

    setOrders(ordersData.map(o => ({
      dbId: o.id,
      id: o.orderNumber,
      customer: o.customerName,
      email: o.customerEmail,
      date: o.createdAt,
      total: o.total,
      status: mapOrderStatus(o.status),
      items: o.items.length,
    })));

    setBlog(blogData.map(b => ({
      id: b.id, title: b.title, category: b.category, status: b.status, date: b.date, views: b.views,
    })));

    setPromos(promosData.map(p => ({
      id: p.id, code: p.code, discount: p.discount, type: p.type, uses: p.uses, maxUses: p.maxUses, active: p.active, expires: p.expires,
    })));

    if (isSupabaseConfigured) {
      const { data: profiles } = await supabase.from("profiles").select("id, name, email, role, created_at");
      const orderStats = ordersData.reduce<Record<string, { orders: number; spent: number; email: string }>>((acc, o) => {
        const key = o.customerEmail || o.customerName;
        if (!acc[key]) acc[key] = { orders: 0, spent: 0, email: o.customerEmail };
        acc[key].orders += 1;
        if (o.status !== "cancelled") acc[key].spent += o.total;
        return acc;
      }, {});

      if (profiles) {
        setCustomers(profiles.filter(p => p.role === "customer").map((p) => {
          const stats = orderStats[p.email ?? ""] ?? { orders: 0, spent: 0, email: p.email ?? "" };
          return {
            id: p.id,
            name: p.name,
            email: p.email ?? stats.email,
            orders: stats.orders,
            spent: stats.spent,
            joined: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          };
        }));
      }
    }
  };

  useEffect(() => {
    if (isAdmin) loadAdminData();
  }, [isAdmin]);

  // Sync products from store
  useEffect(() => {
    if (storeProducts.length) {
      setProducts(storeProducts.map(p => ({
        id: p.id, name: p.name, tagline: p.tagline, description: p.description,
        size: p.size, type: p.type, price: p.price, oldPrice: p.oldPrice ?? 0,
        stock: p.stock, status: "Active" as const, image: p.image, badge: p.badge ?? "",
        ingredients: p.ingredients, storage: p.storage, usage: p.usage,
      })));
    }
  }, [storeProducts]);

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, pwd);
    if (result.success && result.isAdmin) {
      setLoginErr("");
    } else {
      setLoginErr(result.error || "Invalid admin credentials. Please try again.");
    }
  };

  // ── Stats ──
  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const avgOrder = totalRevenue / (totalOrders || 1);

  // ── Product CRUD ──
  const adminToStoreProduct = (p: Product): StoreProduct => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    longDescription: p.description,
    price: p.price,
    oldPrice: p.oldPrice > 0 ? p.oldPrice : undefined,
    size: p.size,
    type: p.type as StoreProduct["type"],
    usage: p.usage,
    image: p.image,
    gallery: [p.image],
    rating: 4.9,
    reviews: 0,
    stock: p.stock,
    badge: p.badge || undefined,
    ingredients: p.ingredients,
    storage: p.storage,
    benefits: [],
    howToUse: [],
  });

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const result = await dbDeleteProduct(id);
    if (result.error) { alert(result.error); return; }
    setProducts(prev => prev.filter(x => x.id !== id));
    await refreshProducts();
  };

  const saveProduct = async (p: Product) => {
    const product = { ...p, id: p.id || generateProductId(p.name, p.size) };
    const result = await upsertProduct(adminToStoreProduct(product));
    if (result.error) { alert(result.error); return; }
    if (products.find(x => x.id === product.id)) {
      setProducts(prev => prev.map(x => x.id === product.id ? product : x));
    } else {
      setProducts(prev => [...prev, product]);
    }
    await refreshProducts();
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // ── Order status ──
  const updateOrderStatus = async (dbId: string, status: Order["status"]) => {
    await dbUpdateOrderStatus(dbId, toDbStatus(status));
    setOrders(prev => prev.map(o => o.dbId === dbId ? { ...o, status } : o));
  };

  // ── Promo CRUD ──
  const savePromo = async (p: Promo) => {
    const result = await upsertPromoCode({
      id: /^[0-9a-f-]{36}$/i.test(p.id) ? p.id : undefined,
      code: p.code,
      discount: p.discount,
      type: p.type,
      uses: p.uses,
      maxUses: p.maxUses,
      active: p.active,
      expires: p.expires,
    });
    if (result.error) { alert(result.error); return; }
    await loadAdminData();
    setShowPromoModal(false);
  };
  const togglePromo = async (id: string) => {
    const promo = promos.find(p => p.id === id);
    if (!promo) return;
    await dbTogglePromo(id, !promo.active);
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  // ── Blog ──
  const toggleBlogStatus = async (id: string, current: "Published" | "Draft") => {
    await toggleBlogPostStatus(id, current);
    loadAdminData();
  };
  const deleteBlog = async (id: string) => {
    if (confirm("Delete this article?")) {
      await deleteBlogPost(id);
      loadAdminData();
    }
  };
  const saveBlogPost = async (post: BlogPostType) => {
    const result = await createBlogPost(post);
    if (!result.success) alert(result.error ?? "Failed to create article");
    else loadAdminData();
    setShowBlogModal(false);
  };

  // ── Reviews ──
  const approveReview = (id: string) => ctxApproveReview(id);
  const deleteReview = (id: string) => { if (confirm("Delete this review?")) ctxDeleteReview(id); };

  // ── Export CSV ──
  const exportCSV = () => {
    const headers = "Name,Email,Orders,Total Spent,Joined\n";
    const rows = customers.map(c => `${c.name},${c.email},${c.orders},${fmt(c.spent)},${c.joined}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ykonline-customers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Login Screen ──
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#052d13] to-green p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-orange text-white shadow-2xl mb-4">
              <Leaf size={40} />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-white/70 mt-1">YKonline Shop Back-Office</p>
          </div>
          <form onSubmit={handleLogin} className="rounded-3xl bg-white p-8 shadow-2xl space-y-5">
            {loginErr && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                <AlertCircle size={18} /> {loginErr}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Admin Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder={SITE_EMAIL} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input value={pwd} onChange={e => setPwd(e.target.value)} type="password" required placeholder="Enter password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green" />
            </div>
            <button type="submit" className="btn-primary w-full">Sign in to Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  // ── Sidebar nav items ──
  const navItems: { id: Tab; icon: typeof BarChart3; label: string; badge?: number }[] = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "products", icon: Package, label: "Products", badge: products.length },
    { id: "orders", icon: ShoppingCart, label: "Orders", badge: orders.filter(o => o.status === "Pending").length },
    { id: "customers", icon: Users, label: "Customers", badge: customers.length },
    { id: "promos", icon: Tag, label: "Promo Codes" },
    { id: "blog", icon: FileText, label: "Blog" },
    { id: "reviews", icon: Star, label: "Reviews", badge: pendingReviews.length },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-116px)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#052d13] text-white shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange flex items-center justify-center font-extrabold text-sm">YK</div>
            <div>
              <p className="font-display font-bold text-sm">YKonline Shop</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${tab === n.id ? "bg-white/15 text-orange" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
              <n.icon size={20} />
              <span className="flex-1 text-left">{n.label}</span>
              {n.badge !== undefined && n.badge > 0 && <span className="bg-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={async () => { if (confirmLogout()) { await logout(); navigate("/"); } }} className="w-full flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white/70 hover:text-red-400 hover:bg-white/5 transition-all">
            <LogOut size={20} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around py-2 px-1">
        {navItems.slice(0, 5).map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${tab === n.id ? "text-green" : "text-gray-400"}`}>
            <n.icon size={20} />
            {n.label.slice(0, 6)}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 bg-gray-50 overflow-y-auto pb-20 lg:pb-8">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-gray-950 capitalize">{tab}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-green w-64" />
            </div>
            <div className="h-9 w-9 rounded-full bg-green text-white flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </div>

        <div className="p-6">
          {/* ═══════ DASHBOARD ═══════ */}
          {tab === "dashboard" && (
            <div className="fade-in space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Total Revenue", value: fmt(totalRevenue), icon: DollarSign, change: "+12.5%", up: true, color: "bg-green" },
                  { label: "Orders", value: totalOrders.toString(), icon: ShoppingBag, change: "+8.2%", up: true, color: "bg-orange" },
                  { label: "Customers", value: totalCustomers.toString(), icon: UserCheck, change: "+15.3%", up: true, color: "bg-blue-600" },
                  { label: "Avg. Order", value: fmt(avgOrder), icon: TrendingUp, change: "-2.1%", up: false, color: "bg-purple-600" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-500">{s.label}</span>
                      <div className={`h-10 w-10 rounded-xl ${s.color} text-white flex items-center justify-center`}><s.icon size={20} /></div>
                    </div>
                    <p className="font-display text-3xl font-extrabold text-gray-950">{s.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${s.up ? "text-green" : "text-red-500"}`}>
                      {s.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {s.change} vs last month
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent orders */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">Recent Orders</h3>
                    <button onClick={() => setTab("orders")} className="text-sm font-bold text-green hover:text-orange">View all</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-semibold text-sm">{o.customer}</p>
                          <p className="text-xs text-gray-400">#{o.id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-green">{fmt(o.total)}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top products */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">Top Products</h3>
                    <button onClick={() => setTab("products")} className="text-sm font-bold text-green hover:text-orange">View all</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {products.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-4 py-3">
                        <span className="font-bold text-gray-300 w-6 text-center">{i + 1}</span>
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{p.name} - {p.size}</p>
                          <p className="text-xs text-gray-400">{p.stock} in stock</p>
                        </div>
                        <span className="font-bold text-sm text-green">{fmt(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ PRODUCTS ═══════ */}
          {tab === "products" && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{products.length} products</p>
                <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="btn-primary !py-2.5 !text-sm"><Plus size={18} /> Add Product</button>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Product</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Type</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Price / Old</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Stock</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Status</th>
                      <th className="text-right py-4 px-5 font-bold text-gray-500 uppercase text-xs">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                              <div><p className="font-bold text-gray-950">{p.name}</p><p className="text-xs text-gray-400">{p.size}</p></div>
                            </div>
                          </td>
                          <td className="py-4 px-5"><span className="rounded-full bg-orange/10 text-orange px-3 py-1 text-xs font-bold">{p.type}</span></td>
                          <td className="py-4 px-5"><span className="font-bold text-green">{fmt(p.price)}</span>{p.oldPrice > 0 && <span className="block text-xs text-gray-400 line-through">{fmt(p.oldPrice)}</span>}</td>
                          <td className="py-4 px-5"><span className={`font-bold ${p.stock < 30 ? "text-red-500" : "text-gray-700"}`}>{p.stock}</span></td>
                          <td className="py-4 px-5"><span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${p.status === "Active" ? "bg-green/10 text-green" : "bg-gray-100 text-gray-500"}`}>{p.status}</span></td>
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="p-2 rounded-lg hover:bg-green/10 text-gray-400 hover:text-green"><Edit size={16} /></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ ORDERS ═══════ */}
          {tab === "orders" && (
            <div className="fade-in space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{orders.length} orders</p>
                <div className="flex gap-2">
                  {(["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map(s => (
                    <button key={s} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 hover:border-green hover:text-green transition-colors">{s}</button>
                  ))}
                </div>
              </div>
              {orders.map(o => (
                <div key={o.id} className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                  <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-green/5 text-green flex items-center justify-center"><ShoppingCart size={20} /></div>
                      <div>
                        <p className="font-bold text-gray-950">#{o.id}</p>
                        <p className="text-xs text-gray-500">{o.customer} - {o.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                      <span className="font-display font-bold text-green">{fmt(o.total)}</span>
                      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
                      <ChevronDown size={18} className={`text-gray-300 transition-transform ${expandedOrder === o.id ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {expandedOrder === o.id && (
                    <div className="border-t border-gray-50 p-5 bg-gray-50/30 fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
                        <div><p className="text-gray-400 text-xs mb-1">Customer</p><p className="font-semibold">{o.customer}</p><p className="text-xs text-gray-500">{o.email}</p></div>
                        <div><p className="text-gray-400 text-xs mb-1">Items</p><p className="font-semibold">{o.items} product(s)</p></div>
                        <div><p className="text-gray-400 text-xs mb-1">Update Status</p>
                          <select value={o.status} onChange={e => updateOrderStatus(o.dbId, e.target.value as Order["status"])} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:border-green">
                            {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ═══════ CUSTOMERS ═══════ */}
          {tab === "customers" && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{customers.length} customers</p>
                <button onClick={exportCSV} className="btn-outline !py-2.5 !text-sm"><Download size={16} /> Export CSV</button>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Customer</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Email</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Orders</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Total Spent</th>
                      <th className="text-left py-4 px-5 font-bold text-gray-500 uppercase text-xs">Joined</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {customers.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-orange/10 text-orange flex items-center justify-center font-bold text-sm">{c.name[0]}</div>
                              <span className="font-bold text-gray-950">{c.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-gray-600">{c.email}</td>
                          <td className="py-4 px-5 font-semibold">{c.orders}</td>
                          <td className="py-4 px-5 font-bold text-green">{fmt(c.spent)}</td>
                          <td className="py-4 px-5 text-gray-500">{c.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ PROMO CODES ═══════ */}
          {tab === "promos" && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{promos.length} promo codes</p>
                <button onClick={() => setShowPromoModal(true)} className="btn-primary !py-2.5 !text-sm"><Plus size={18} /> Create Promo Code</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {promos.map(p => (
                  <div key={p.id} className={`rounded-2xl border p-6 transition-all ${p.active ? "bg-white border-green/20 shadow-sm" : "bg-gray-50 border-gray-200 opacity-70"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-2xl font-extrabold text-gray-950">{p.code}</span>
                      <button onClick={() => togglePromo(p.id)} className={`relative h-7 w-12 rounded-full transition-colors ${p.active ? "bg-green" : "bg-gray-300"}`}>
                        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${p.active ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>
                    <p className="font-bold text-orange text-lg mb-1">{p.type === "percent" ? `${p.discount}% off` : `$${p.discount} off`}</p>
                    <div className="text-xs text-gray-500 space-y-1 mt-3">
                      <p>Used: {p.uses}{p.maxUses > 0 ? ` / ${p.maxUses}` : " (unlimited)"}</p>
                      <p>Expires: {p.expires}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ BLOG ═══════ */}
          {tab === "blog" && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{blog.length} articles</p>
                <button onClick={() => setShowBlogModal(true)} className="btn-primary !py-2.5 !text-sm"><Plus size={18} /> New Article</button>
              </div>
              <div className="space-y-4">
                {blog.map(b => (
                  <div key={b.id} className="rounded-2xl bg-white border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-green/5 text-green flex items-center justify-center shrink-0"><FileText size={22} /></div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-950 truncate">{b.title}</p>
                        <p className="text-xs text-gray-500">{b.category} - {b.date} - {b.views} views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${b.status === "Published" ? "bg-green/10 text-green" : "bg-gray-100 text-gray-500"}`}>{b.status}</span>
                      <button onClick={() => toggleBlogStatus(b.id, b.status)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500" title="Toggle status"><Eye size={16} /></button>
                      <button onClick={() => deleteBlog(b.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ REVIEWS ═══════ */}
          {tab === "reviews" && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{reviews.length} reviews - {reviews.filter(r => !r.approved).length} pending approval</p>
              </div>
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className={`rounded-2xl border p-5 transition-all ${r.approved ? "bg-white border-gray-100" : "bg-yellow-50/50 border-yellow-200"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-9 w-9 rounded-full bg-orange text-white flex items-center justify-center font-bold text-sm">{r.customer[0]}</div>
                          <div>
                            <p className="font-bold text-gray-950">{r.customer}</p>
                            <p className="text-xs text-gray-500">{r.product} - {r.date}</p>
                          </div>
                        </div>
                        <div className="flex mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < r.rating ? "text-orange fill-orange" : "text-gray-200"} />)}</div>
                        <p className="text-sm text-gray-700 italic">"{r.text}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!r.approved && <button onClick={() => approveReview(r.id)} className="flex items-center gap-1 rounded-lg bg-green/10 px-3 py-2 text-sm font-bold text-green hover:bg-green hover:text-white transition-colors"><Check size={16} /> Approve</button>}
                        {r.approved && <span className="text-xs font-bold text-green bg-green/10 px-3 py-1 rounded-full">Approved</span>}
                        <button onClick={() => deleteReview(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ SETTINGS ═══════ */}
          {tab === "settings" && (
            <div className="fade-in max-w-2xl">
              <div className="rounded-2xl bg-white border border-gray-100 p-7 space-y-5">
                <h3 className="font-display font-bold text-lg">Store Settings</h3>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                  <input defaultValue="YKonline Shop" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Store Email</label>
                  <input defaultValue={SITE_EMAIL} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number</label>
                  <input defaultValue="+1 (301) 266-9830" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Shipping Rate</label>
                  <input type="text" defaultValue="$0.69 per km from store" disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Currency</label>
                  <select defaultValue="USD" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white">
                    <option value="USD">USD ($)</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                  </select>
                </div>
                <button className="btn-primary">Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═══════ MODALS ═══════ */}
      {showProductModal && <ProductModal product={editingProduct} onSave={saveProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null); }} />}
      {showPromoModal && <PromoModal onSave={savePromo} onClose={() => setShowPromoModal(false)} nextId={`PR${String(promos.length + 1).padStart(3, "0")}`} />}
      {showBlogModal && <BlogModal onSave={saveBlogPost} onClose={() => setShowBlogModal(false)} />}
    </div>
  );
}

// ── Modals ──

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">{children}</div>
    </div>
  );
}

function ProductModal({ product, onSave, onClose }: { product: Product | null; onSave: (p: Product) => void; onClose: () => void }) {
  const allUsages = ["Skin", "Hair", "Baby/Family", "Massage"];
  const defaultProduct: Product = { id: `P${String(Date.now()).slice(-4)}`, name: "", tagline: "", description: "", size: "", type: "Raw", price: 0, oldPrice: 0, stock: 0, status: "Active", image: "/images/raw-shea-jar.jpg", badge: "", ingredients: "", storage: "Store in a dry place, away from heat and direct light.", usage: [] };
  const [form, setForm] = useState<Product>(product || defaultProduct);
  const upd = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleUsage = (u: string) => {
    const current = form.usage;
    upd("usage", current.includes(u) ? current.filter(x => x !== u) : [...current, u]);
  };
  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white text-sm";
  return (
    <Overlay onClose={onClose}>
      <h2 className="font-display text-2xl font-bold mb-1">{product ? "Edit Product" : "Add New Product"}</h2>
      <p className="text-sm text-gray-500 mb-6">{product ? "Update the product details below." : "Fill in all the details to add a new product."}</p>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
          <input required value={form.name} onChange={e => upd("name", e.target.value)} placeholder="e.g. Unrefined Organic Raw Shea Butter" className={inputCls} />
        </div>
        {/* Tagline */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Tagline</label>
          <input value={form.tagline} onChange={e => upd("tagline", e.target.value)} placeholder="Short marketing tagline" className={inputCls} />
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={3} placeholder="Full product description" className={inputCls + " resize-none"} />
        </div>
        {/* Size, Type, Badge */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Size *</label>
            <input required value={form.size} onChange={e => upd("size", e.target.value)} placeholder="100g" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Type *</label>
            <select value={form.type} onChange={e => upd("type", e.target.value)} className={inputCls}>
              <option>Raw</option><option>Whipped</option><option>Set</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Badge</label>
            <input value={form.badge} onChange={e => upd("badge", e.target.value)} placeholder="Best Seller" className={inputCls} />
          </div>
        </div>
        {/* Price, Old Price, Stock */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Price ($) *</label>
            <input required type="number" step="0.01" min="0" value={form.price || ""} onChange={e => upd("price", parseFloat(e.target.value) || 0)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Old Price ($)</label>
            <input type="number" step="0.01" min="0" value={form.oldPrice || ""} onChange={e => upd("oldPrice", parseFloat(e.target.value) || 0)} placeholder="0 = none" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Stock *</label>
            <input required type="number" min="0" value={form.stock || ""} onChange={e => upd("stock", parseInt(e.target.value) || 0)} className={inputCls} />
          </div>
        </div>
        {/* Image URL */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Product Image URL *</label>
          <input required value={form.image} onChange={e => upd("image", e.target.value)} placeholder="https://... or /images/product.jpg" className={inputCls} />
          {form.image && <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 rounded-xl object-cover border border-gray-200" />}
        </div>
        {/* Usage */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Usage</label>
          <div className="flex flex-wrap gap-2">
            {allUsages.map(u => (
              <button key={u} type="button" onClick={() => toggleUsage(u)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${form.usage.includes(u) ? "bg-green text-white border-green" : "border-gray-200 text-gray-600 hover:border-green"}`}>{u}</button>
            ))}
          </div>
        </div>
        {/* Ingredients */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Ingredients (INCI)</label>
          <textarea value={form.ingredients} onChange={e => upd("ingredients", e.target.value)} rows={2} placeholder="Butyrospermum Parkii Butter..." className={inputCls + " resize-none"} />
        </div>
        {/* Storage */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Storage Advice</label>
          <input value={form.storage} onChange={e => upd("storage", e.target.value)} className={inputCls} />
        </div>
        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={e => upd("status", e.target.value as any)} className={inputCls}>
            <option value="Active">Active</option><option value="Draft">Draft</option>
          </select>
        </div>
        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <button type="submit" className="btn-primary flex-1">{product ? "Save Changes" : "Add Product"}</button>
          <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
        </div>
      </form>
    </Overlay>
  );
}

function PromoModal({ onSave, onClose, nextId }: { onSave: (p: Promo) => void; onClose: () => void; nextId: string }) {
  const [form, setForm] = useState<Promo>({ id: nextId, code: "", discount: 10, type: "percent", uses: 0, maxUses: 0, active: true, expires: "Dec 31, 2026" });
  const upd = (k: keyof Promo, v: any) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Overlay onClose={onClose}>
      <h2 className="font-display text-2xl font-bold mb-5">Create Promo Code</h2>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div><label className="block text-sm font-bold mb-1">Code</label><input required value={form.code} onChange={e => upd("code", e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green uppercase" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-bold mb-1">Discount</label><input required type="number" value={form.discount} onChange={e => upd("discount", parseFloat(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green" /></div>
          <div><label className="block text-sm font-bold mb-1">Type</label><select value={form.type} onChange={e => upd("type", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green"><option value="percent">Percentage (%)</option><option value="fixed">Fixed ($)</option></select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-bold mb-1">Max Uses (0 = unlimited)</label><input type="number" value={form.maxUses} onChange={e => upd("maxUses", parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green" /></div>
          <div><label className="block text-sm font-bold mb-1">Expires</label><input required value={form.expires} onChange={e => upd("expires", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">Create Code</button>
          <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
        </div>
      </form>
    </Overlay>
  );
}

function BlogModal({ onSave, onClose }: { onSave: (b: BlogPostType) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Guide");
  return (
    <Overlay onClose={onClose}>
      <h2 className="font-display text-2xl font-bold mb-5">New Blog Article</h2>
      <form onSubmit={e => {
        e.preventDefault();
        onSave({
          slug: slugify(title),
          title,
          excerpt,
          content: content || excerpt,
          category,
          readTime: "5 min",
          color: "from-green to-green-dark",
          status: "Draft",
        });
      }} className="space-y-4">
        <div><label className="block text-sm font-bold mb-1">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green" /></div>
        <div><label className="block text-sm font-bold mb-1">Excerpt</label><textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="Short summary" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green resize-none" /></div>
        <div><label className="block text-sm font-bold mb-1">Content</label><textarea required value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Full article (use ## for headings)" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green resize-none" /></div>
        <div><label className="block text-sm font-bold mb-1">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green"><option>Guide</option><option>Benefits</option><option>Hair care</option><option>Skin care</option><option>Routine</option></select></div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">Create Article</button>
          <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
        </div>
      </form>
    </Overlay>
  );
}
