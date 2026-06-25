import { ShoppingCart, Search, User, Menu, X, MessageCircle, Truck, ShieldCheck, Leaf, BadgePercent } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/routines", label: "Beauty Routines" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Tips & Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-green/10 shadow-[0_10px_40px_rgba(11,102,35,0.08)]">
      {/* Top bar */}
      <div className="bg-green text-white text-xs md:text-sm overflow-hidden">
        <div className="container-page py-2 flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-6 font-semibold text-white/90">
            <span className="flex items-center gap-2"><Truck size={15} /> Fast Shipping</span>
            <span className="flex items-center gap-2"><ShieldCheck size={15} /> Secure Payment</span>
            <span className="flex items-center gap-2"><Leaf size={15} /> Premium Organic Shea Butter</span>
          </div>
          <div className="md:hidden whitespace-nowrap marquee-track flex gap-8 text-white/90 font-semibold">
            <span>Fast Shipping</span><span>Secure Payment</span><span>Premium Organic Shea Butter</span><span>WELCOME10</span>
            <span>Fast Shipping</span><span>Secure Payment</span><span>Premium Organic Shea Butter</span><span>WELCOME10</span>
          </div>
          <div className="hidden md:flex items-center gap-2 font-bold text-green bg-white rounded-full px-4 py-1 shadow-sm">
            <BadgePercent size={15} className="text-orange" /> -10% with code <span className="text-orange">WELCOME10</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-page py-3 flex items-center justify-between gap-4">
        <button className="lg:hidden text-green" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="YKonline Shop home">
          <img src="https://sori-mobile-tire.com/wp-content/uploads/2026/06/YKONLINE-SHOP-LOGO.jpeg" alt="YKonline Shop" className="h-14 w-14 md:h-16 md:w-16 rounded-2xl object-cover shadow-sm" />
          <span className="hidden sm:block leading-none">
            <span className="block font-display text-xl font-extrabold tracking-[-0.04em]"><span className="text-green">YKonline</span> <span className="text-orange">Shop</span></span>
            <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.22em] text-green/70">Shop smart, live better</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-[13px] font-bold text-gray-700 uppercase tracking-[0.08em]">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `relative hover:text-green transition-colors after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:bg-orange after:transition-all ${isActive ? "text-green after:w-full" : "after:w-0 hover:after:w-full"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="text-green hover:text-orange transition-colors hidden sm:block"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search size={22} />
          </button>
          <Link to="/account" className="text-green hover:text-orange transition-colors" aria-label="Account">
            <User size={22} />
          </Link>
          <a
            href="https://wa.me/13012669830"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-2 bg-green-light text-green hover:bg-green hover:text-white transition-colors rounded-full px-4 py-2 text-sm font-bold"
            aria-label="WhatsApp"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
          <button
            onClick={() => setIsOpen(true)}
            className="relative text-green hover:text-orange transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-cream bg-cream/40">
          <div className="container-page py-3">
            <form className="flex gap-2" onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              setSearchOpen(false);
              navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
            }}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shea butter, routines, tips..."
                className="flex-1 px-4 py-3 rounded-full border border-green/20 bg-white focus:outline-none focus:border-green"
              />
              <button type="submit" className="btn-primary !py-3">
                <Search size={18} /> Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-cream bg-white">
          <nav className="container-page py-4 flex flex-col gap-3 text-gray-700 font-semibold">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2 ${isActive ? "text-green" : ""}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink to="/track-order" onClick={() => setOpen(false)} className={({ isActive }) => `py-2 flex items-center gap-2 ${isActive ? "text-green" : ""}`}>
              Track my order
            </NavLink>
            <NavLink to="/account" onClick={() => setOpen(false)} className={({ isActive }) => `py-2 flex items-center gap-2 ${isActive ? "text-green" : ""}`}>
              <User size={18} /> My account
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
