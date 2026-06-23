import { Star, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "../data/products";
import { useCart, formatPrice } from "../context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-[1/1] overflow-hidden bg-[#F5F5F5]">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={product.image}
            alt={`${product.name} ${product.size}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-orange px-3 py-1 text-[11px] font-bold text-white">
            {product.badge}
          </span>
        )}
        {product.oldPrice && (
          <span className="absolute right-4 top-4 rounded-full bg-green px-3 py-1 text-[11px] font-bold text-white">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </span>
        )}

        {/* Wishlist Button */}
        <button className="absolute bottom-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors hover:text-red-500">
          <Heart size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Rating */}
        <div className="mb-2 flex items-center gap-1 text-xs">
          <div className="flex text-orange">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-current" : "text-gray-200"} />
            ))}
          </div>
          <span className="text-gray-400">({product.reviews})</span>
        </div>

        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-base font-bold leading-tight text-gray-950 transition-colors hover:text-green">
            {product.name} - {product.size}
          </h3>
        </Link>

        {/* Tagline */}
        <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{product.tagline}</p>

        {/* Price and Cart */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-green">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <button
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                size: product.size,
                price: product.price,
                image: product.image,
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#052d13] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
