import { useState, useRef, useEffect } from "react";
import { Mail, Lock, User, Package, MapPin, Heart, LogOut, Eye, EyeOff, ShoppingCart, ChevronRight, Settings, Bell, AlertCircle, CheckCircle, Star, MessageSquare, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, confirmLogout } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import {
  fetchUserOrders, fetchAddresses, fetchWishlist, saveAddress, deleteAddress,
  updateProfile, changePassword, type Address, type WishlistItem,
} from "../lib/account";

export default function Account() {
  const { user, login, register, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses" | "wishlist" | "reviews" | "settings">("overview");
  const { products: allProducts } = useProducts();
  const { reviews: allReviews, addReview } = useReviews();
  const myReviews = allReviews.filter(r => r.customer === user?.name);
  const [reviewProduct, setReviewProduct] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchUserOrders>>>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const { addItem } = useCart();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const pwdRef = useRef<HTMLInputElement>(null);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setSettingsName(user.name);
    fetchUserOrders(user.id, user.email).then(setOrders);
    fetchAddresses(user.id).then(setAddresses);
    fetchWishlist(user.id).then(setWishlist);
  }, [user?.id, user?.email, user?.name]);

  const handleAddAddress = async () => {
    if (!user?.id) return;
    const type = prompt("Address label (Home, Office...)", "Home");
    if (!type) return;
    const address = prompt("Street address");
    if (!address) return;
    const city = prompt("City") ?? "";
    const country = prompt("Country", "United States") ?? "United States";
    const phone = prompt("Phone") ?? "";
    const result = await saveAddress(user.id, { type, address, city, country, phone, isDefault: addresses.length === 0 });
    if (result.success) setAddresses(await fetchAddresses(user.id));
    else alert(result.error);
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;
    setSettingsMsg("");
    const profileResult = await updateProfile(user.id, settingsName, settingsPhone);
    if (!profileResult.success) { setSettingsMsg(profileResult.error ?? "Update failed"); return; }
    if (newPassword.length >= 8) {
      const pwdResult = await changePassword(newPassword);
      if (!pwdResult.success) { setSettingsMsg(pwdResult.error ?? "Password update failed"); return; }
      setNewPassword("");
    }
    setSettingsMsg("Settings saved successfully.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const email = emailRef.current?.value || "";
    const password = pwdRef.current?.value || "";

    if (mode === "register") {
      const name = nameRef.current?.value || "";
      const result = await register(name, email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(result.error || "Account created successfully! Welcome to YKonline Shop.");
    } else {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.isAdmin) {
        navigate("/admin");
        return;
      }
    }
  };

  const handleLogout = async () => {
    if (!confirmLogout()) return;
    await logout();
    setActiveTab("overview");
  };

  if (loading) {
    return (
      <div className="container-page py-24 text-center text-gray-500">
        Loading your account...
      </div>
    );
  }

  // If user is logged in as admin, redirect to admin
  if (user?.role === "admin") {
    navigate("/admin");
    return null;
  }

  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email ? user.email[0].toUpperCase() : "U";

  // ── Logged-in Dashboard ──
  if (user) {
    return (
      <div className="fade-in">
        <section className="bg-gradient-to-br from-green to-[#052d13] text-white">
          <div className="container-page py-10 md:py-14">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5 min-w-0">
                <div className="flex h-20 w-20 shrink-0 aspect-square min-h-[5rem] min-w-[5rem] items-center justify-center rounded-full bg-orange text-2xl font-extrabold shadow-lg leading-none">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold break-words">Welcome back, {firstName}!</h1>
                  <p className="mt-1 text-white/70 text-sm sm:text-base truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20">
                  <Bell size={18} /> Notifications
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-red-500/80"
                >
                  <LogOut size={18} /> Log out
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-100 bg-white sticky top-[116px] z-30">
          <div className="container-page">
            <nav className="flex gap-1 overflow-x-auto py-1 -mb-px">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "orders", label: "Orders", icon: Package },
                { id: "addresses", label: "Addresses", icon: MapPin },
                { id: "wishlist", label: "Wishlist", icon: Heart },
                { id: "reviews", label: "My Reviews", icon: MessageSquare },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition-all ${
                    activeTab === t.id
                      ? "bg-green text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-50 hover:text-green"
                  }`}
                >
                  <t.icon size={18} />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </section>

        <div className="container-page py-10 max-w-6xl">
          {activeTab === "overview" && (
            <div className="fade-in space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { id: "orders", icon: Package, title: "My orders", desc: "Track and manage your orders", count: `${orders.length} orders`, color: "green" },
                  { id: "addresses", icon: MapPin, title: "My addresses", desc: "Manage your delivery addresses", count: `${addresses.length} saved`, color: "orange" },
                  { id: "wishlist", icon: Heart, title: "My wishlist", desc: "Your favorite products", count: `${wishlist.length} items`, color: "green" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveTab(c.id as any)}
                    className="group flex flex-col items-start rounded-[1.5rem] border border-gray-100 bg-white p-7 text-left transition-all duration-300 hover:border-green/30 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10 text-green transition-colors group-hover:bg-green group-hover:text-white">
                      <c.icon size={28} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-gray-950">{c.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{c.desc}</p>
                    <div className="mt-4 flex w-full items-center justify-between">
                      <span className="text-sm font-bold text-orange">{c.count}</span>
                      <ChevronRight size={18} className="text-gray-300 transition-colors group-hover:text-green" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-gray-100 bg-white p-7">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold text-gray-950">Recent orders</h2>
                  <button onClick={() => setActiveTab("orders")} className="text-sm font-bold text-green hover:text-orange flex items-center gap-1">
                    View all <ChevronRight size={16} />
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {orders.slice(0, 2).map((o) => (
                    <div key={o.ref} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green/5 text-green"><Package size={20} /></div>
                        <div>
                          <p className="font-bold text-gray-950">{o.ref}</p>
                          <p className="text-xs text-gray-500">{o.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-display font-bold text-green">{o.total}</span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${o.statusColor}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="fade-in">
              <h2 className="font-display text-2xl font-bold text-gray-950 mb-6">My orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet. <Link to="/shop" className="text-green font-semibold">Start shopping</Link></p>
              ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.ref} className="rounded-[1.5rem] border border-gray-100 bg-white overflow-hidden transition-shadow hover:shadow-md">
                    <button onClick={() => setExpandedOrder(expandedOrder === o.ref ? null : o.ref)} className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 p-6 text-left">
                      <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green/5 text-green"><Package size={24} /></div>
                        <div>
                          <p className="font-display text-lg font-bold text-gray-950">{o.ref}</p>
                          <p className="text-sm text-gray-500">{o.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-display text-xl font-bold text-green">{o.total}</p>
                          <span className={`inline-block mt-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${o.statusColor}`}>{o.status}</span>
                        </div>
                        <ChevronRight size={20} className={`text-gray-300 transition-transform ${expandedOrder === o.ref ? "rotate-90" : ""}`} />
                      </div>
                    </button>
                    {expandedOrder === o.ref && (
                      <div className="border-t border-gray-50 bg-gray-50/50 p-6 fade-in">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Items in this order</p>
                        <div className="space-y-3">
                          {o.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-3 border border-gray-100">
                              <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                              <div className="flex-1">
                                <p className="font-bold text-sm text-gray-950">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                              </div>
                              <p className="font-display font-bold text-green">{item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-gray-950">My addresses</h2>
                <button onClick={handleAddAddress} className="btn-primary !py-2.5 !text-sm">+ Add New Address</button>
              </div>
              {addresses.length === 0 ? (
                <p className="text-gray-500">No saved addresses yet.</p>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((a) => (
                  <div key={a.id} className="rounded-[1.5rem] border border-gray-100 bg-white p-7 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green"><MapPin size={20} /></div>
                        <span className="font-display text-lg font-bold text-gray-950">{a.type}</span>
                      </div>
                      {a.isDefault && <span className="text-[10px] font-bold uppercase text-orange bg-orange/10 px-3 py-1 rounded-full">Default</span>}
                    </div>
                    <div className="space-y-2 mb-6 text-sm text-gray-600">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p>{a.address}</p>
                      <p>{a.phone}</p>
                    </div>
                    <div className="flex gap-4 border-t border-gray-50 pt-4">
                      <button className="text-sm font-bold text-green hover:text-orange transition-colors">Edit</button>
                      {!a.isDefault && <button className="text-sm font-bold text-gray-400 hover:text-green transition-colors">Set as default</button>}
                      <button onClick={async () => { if (user?.id && confirm("Delete this address?")) { await deleteAddress(a.id); setAddresses(await fetchAddresses(user.id)); } }} className="text-sm font-bold text-red-400 hover:text-red-500 transition-colors ml-auto">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="fade-in">
              <h2 className="font-display text-2xl font-bold text-gray-950 mb-6">My wishlist</h2>
              {wishlist.length === 0 ? (
                <p className="text-gray-500">Your wishlist is empty.</p>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((w) => (
                  <div key={w.productId} className="group rounded-[1.5rem] border border-gray-100 bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
                      <img src={w.image} alt={w.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <button className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition-transform hover:scale-110">
                        <Heart size={18} className="fill-current" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h4 className="font-display font-bold text-gray-950 leading-tight">{w.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">{w.size}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="font-display text-xl font-bold text-green">${w.price.toFixed(2)}</span>
                          {w.oldPrice && <span className="ml-2 text-sm text-gray-400 line-through">${w.oldPrice.toFixed(2)}</span>}
                        </div>
                        <button
                          onClick={() => addItem({ id: w.productId, name: w.name, size: w.size, price: w.price, image: w.image })}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#052d13] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="fade-in">
              <h2 className="font-display text-2xl font-bold text-gray-950 mb-6">My Reviews</h2>

              {/* Write a review form */}
              <div className="rounded-[1.5rem] border border-gray-100 bg-white p-7 mb-8">
                <h3 className="font-display text-lg font-bold text-gray-950 mb-1 flex items-center gap-2"><Send size={20} className="text-orange" /> Write a Review</h3>
                <p className="text-sm text-gray-500 mb-5">Share your experience with our products. Your review will be published after approval.</p>

                {reviewSuccess && (
                  <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green mb-5">
                    <CheckCircle size={18} className="shrink-0 mt-0.5" /> {reviewSuccess}
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reviewProduct || !reviewText.trim() || !user) return;
                  const prod = allProducts.find(p => p.id === reviewProduct);
                  await addReview({
                    customer: user.name || "Customer",
                    product: prod ? `${prod.name} - ${prod.size}` : reviewProduct,
                    productId: reviewProduct,
                    rating: reviewRating,
                    text: reviewText.trim(),
                  });
                  setReviewText("");
                  setReviewRating(5);
                  setReviewProduct("");
                  setReviewSuccess("Thank you! Your review has been submitted and is awaiting approval.");
                  setTimeout(() => setReviewSuccess(""), 5000);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product *</label>
                    <select required value={reviewProduct} onChange={e => setReviewProduct(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white text-sm">
                      <option value="">Select a product...</option>
                      {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} - {p.size}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating *</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewRating(s)} className="transition-transform hover:scale-125">
                          <Star size={28} className={s <= reviewRating ? "text-orange fill-orange" : "text-gray-200"} />
                        </button>
                      ))}
                      <span className="ml-3 text-sm font-bold text-gray-700 self-center">{reviewRating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Your review *</label>
                    <textarea required value={reviewText} onChange={e => setReviewText(e.target.value)} rows={4} placeholder="Tell us about your experience with this product..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white text-sm resize-none" />
                  </div>
                  <button type="submit" className="btn-primary"><Send size={18} /> Submit Review</button>
                </form>
              </div>

              {/* My past reviews */}
              {myReviews.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-950 mb-4">Your Past Reviews</h3>
                  <div className="space-y-4">
                    {myReviews.map(r => (
                      <div key={r.id} className="rounded-[1.5rem] border border-gray-100 bg-white p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-bold text-gray-950 text-sm">{r.product}</p>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                              <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < r.rating ? "text-orange fill-orange" : "text-gray-200"} />)}</div>
                              <span className="text-xs text-gray-500">{r.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 italic">"{r.text}"</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${r.approved ? "bg-green/10 text-green" : "bg-yellow-100 text-yellow-700"}`}>
                            {r.approved ? "Published" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {myReviews.length === 0 && !reviewSuccess && (
                <div className="rounded-[1.5rem] border border-gray-100 bg-gray-50/50 p-10 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500">You haven't written any reviews yet. Share your experience above!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="fade-in max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-gray-950 mb-6">Account settings</h2>
              <div className="rounded-[1.5rem] border border-gray-100 bg-white p-7 space-y-5">
                {settingsMsg && <p className="text-sm text-green font-semibold">{settingsMsg}</p>}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full name</label>
                  <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" value={user.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} placeholder="+1 (000) 000-0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" />
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <h3 className="font-bold text-gray-950 mb-3">Change password</h3>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min. 8 characters)" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" />
                </div>
                <button type="button" onClick={handleSaveSettings} className="btn-primary">Save changes</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Login / Register Form ──
  return (
    <div className="fade-in container-page py-16 max-w-xl">
      <div className="text-center mb-8">
        <Link to="/">
          <img src="https://sori-mobile-tire.com/wp-content/uploads/2026/06/YKONLINE-SHOP-LOGO.jpeg" alt="YKonline Shop" className="h-20 w-20 mx-auto mb-4 rounded-2xl object-cover shadow-md" />
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-gray-600">{mode === "login" ? "Log in to access your account" : "Join the YKonline Shop community"}</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="flex mb-6 bg-gray-100 rounded-full p-1">
          <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition-colors ${mode === "login" ? "bg-white text-green shadow" : "text-gray-500"}`}>Log in</button>
          <button onClick={() => { setMode("register"); setError(""); setSuccess(""); }} className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition-colors ${mode === "register" ? "bg-white text-green shadow" : "text-gray-500"}`}>Register</button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green mb-4">
            <CheckCircle size={18} className="shrink-0 mt-0.5" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Full name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input ref={nameRef} required type="text" className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" placeholder="Your full name" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={emailRef} required type="email" className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" placeholder="you@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={pwdRef} required type={showPwd ? "text" : "password"} minLength={mode === "register" ? 8 : undefined} className="w-full pl-11 pr-11 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green focus:bg-white" placeholder={mode === "register" ? "Min. 8 characters" : "Enter your password"} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green" aria-label="Toggle password">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === "register" && (
              <p className="mt-2 text-xs text-gray-500">At least 8 characters, with uppercase, lowercase and a number.</p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full">{mode === "login" ? "Log in" : "Create my account"}</button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          {mode === "login" ? (
            <>No account yet? <button onClick={() => { setMode("register"); setError(""); }} className="text-green font-semibold hover:text-orange">Create one</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode("login"); setError(""); }} className="text-green font-semibold hover:text-orange">Log in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
