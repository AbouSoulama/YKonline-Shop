import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck, RotateCcw, Star, Check, ChevronRight, Heart, Share2 } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { useReviews } from "../context/ReviewContext";
import { useCart, formatPrice, FREE_SHIPPING_AMOUNT } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function Product() {
  const { id } = useParams();
  const { getProductById, getRelatedProducts } = useProducts();
  const product = getProductById(id || "");
  const { getProductReviews } = useReviews();
  const productReviews = getProductReviews(id || "");
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"desc" | "use" | "ingredients" | "reviews">("desc");

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Product not found</h1>
        <Link to="/shop" className="btn-primary">Back to shop</Link>
      </div>
    );
  }

  const related = getRelatedProducts(product.id);

  const addToCart = () => {
    addItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: product.image }, qty);
  };

  const buyNow = () => {
    addItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: product.image }, qty);
    window.location.href = "/checkout";
  };

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div className="bg-cream/40 border-b border-cream">
        <div className="container-page py-3 text-sm text-gray-500 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-green">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-green">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">{product.name} {product.size}</span>
        </div>
      </div>

      <section className="container-page py-10 md:py-14 grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-[2rem] bg-cream overflow-hidden card-shadow mb-4">
            <img src={product.gallery[activeImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {product.gallery.map((g, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-colors ${activeImg === i ? "border-green" : "border-transparent"}`}>
                <img src={g} alt="" className="w-full h-full object-cover bg-cream" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="bg-orange text-white text-xs font-bold px-3 py-1 rounded-full">{product.type}</span>
            <span className="bg-green-light text-green text-xs font-bold px-3 py-1 rounded-full">{product.size}</span>
            {product.badge && <span className="bg-cream text-brown text-xs font-bold px-3 py-1 rounded-full">{product.badge}</span>}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(product.rating) ? "text-orange fill-orange" : "text-gray-300"} />)}
            </div>
            <span className="text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
          </div>
          <p className="text-lg text-gray-600 italic mb-5">"{product.tagline}"</p>

          <div className="flex items-end gap-3 mb-6">
            <span className="font-display text-4xl font-bold text-green">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-xl text-gray-400 line-through mb-1">{formatPrice(product.oldPrice)}</span>}
            {product.oldPrice && <span className="bg-orange text-white text-xs font-bold px-2 py-1 rounded-full mb-1">Save {formatPrice(product.oldPrice - product.price)}</span>}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Quantity + buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center border border-cream rounded-full bg-cream/30">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-green" aria-label="Decrease"><Minus size={18} /></button>
              <span className="px-4 font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-green" aria-label="Increase"><Plus size={18} /></button>
            </div>
            <button onClick={addToCart} className="btn-outline flex-1"><ShoppingCart size={18} /> Add to Cart</button>
            <button onClick={buyNow} className="btn-accent flex-1">Buy Now</button>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm">
            <button className="flex items-center gap-1 text-gray-600 hover:text-red-500"><Heart size={16} /> Wishlist</button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-green"><Share2 size={16} /> Share</button>
          </div>

          {/* Info badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-cream pt-6">
            <div className="flex items-start gap-2"><Truck size={18} className="text-green shrink-0 mt-0.5" /><div><p className="text-sm font-semibold">Fast shipping</p><p className="text-xs text-gray-500">Free above ${FREE_SHIPPING_AMOUNT}</p></div></div>
            <div className="flex items-start gap-2"><ShieldCheck size={18} className="text-green shrink-0 mt-0.5" /><div><p className="text-sm font-semibold">Secure payment</p><p className="text-xs text-gray-500">Card, PayPal, Mobile money</p></div></div>
            <div className="flex items-start gap-2"><RotateCcw size={18} className="text-green shrink-0 mt-0.5" /><div><p className="text-sm font-semibold">Satisfaction</p><p className="text-xs text-gray-500">Easy returns</p></div></div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container-page pb-10">
        <div className="border-b border-cream flex flex-wrap gap-2">
          {[
            { k: "desc", l: "Description" },
            { k: "use", l: "How to use" },
            { k: "ingredients", l: "Ingredients & Storage" },
            { k: "reviews", l: `Reviews (${productReviews.length})` },
          ].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k as any)} className={`px-5 py-3 font-display font-semibold text-sm border-b-2 transition-colors ${tab === t.k ? "border-green text-green" : "border-transparent text-gray-500 hover:text-green"}`}>{t.l}</button>
          ))}
        </div>
        <div className="py-8">
          {tab === "desc" && (
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="text-lg mb-4">{product.longDescription}</p>
              <h3 className="font-display font-semibold text-xl text-gray-900 mt-6 mb-3">Benefits</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.benefits.map((b) => <li key={b} className="flex items-start gap-2"><Check size={18} className="text-green shrink-0 mt-0.5" />{b}</li>)}
              </ul>
            </div>
          )}
          {tab === "use" && (
            <div className="grid md:grid-cols-2 gap-4">
              {product.howToUse.map((h, i) => (
                <div key={h.area} className="bg-cream/40 rounded-3xl p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green text-white font-display font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <div><h4 className="font-display font-semibold text-lg mb-1">{h.area}</h4><p className="text-gray-600 text-sm">{h.method}</p></div>
                </div>
              ))}
            </div>
          )}
          {tab === "ingredients" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-cream/40 rounded-3xl p-6">
                <h3 className="font-display font-semibold text-lg mb-2">Ingredients</h3>
                <p className="text-gray-700">{product.ingredients}</p>
              </div>
              <div className="bg-cream/40 rounded-3xl p-6">
                <h3 className="font-display font-semibold text-lg mb-2">Storage advice</h3>
                <p className="text-gray-700">{product.storage}</p>
              </div>
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-4 max-w-3xl">
              {productReviews.length > 0 ? productReviews.map((r) => (
                <div key={r.id} className="bg-cream/40 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center font-bold">{r.customer[0]}</div>
                      <div><p className="font-semibold">{r.customer}</p><p className="text-xs text-gray-500">{r.date}, Verified purchase</p></div>
                    </div>
                    <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} className="text-orange fill-orange" />)}</div>
                  </div>
                  <p className="text-gray-700">"{r.text}"</p>
                </div>
              )) : (
                <div className="bg-cream/40 rounded-3xl p-10 text-center">
                  <Star size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500">No reviews yet for this product.</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      <section className="container-page py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-8">You may also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
