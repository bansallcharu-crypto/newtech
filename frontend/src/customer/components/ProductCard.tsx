import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, PackageX, ShoppingCart, Tag } from 'lucide-react';
import type { BulkDiscount, Offer, Product } from '../../types';
import { formatINR, getActiveOfferForProduct } from '../../utils/pricing';
import { BADGE_STYLES, getProductBadges } from '../utils/badges';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({
  product,
  offers,
  discounts = []
}: {
  product: Product;
  offers: Offer[];
  discounts?: BulkDiscount[];
}) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const offer = getActiveOfferForProduct(offers, product.id);
  const discountedPrice = offer ? Math.round(product.price * (1 - offer.discount_percent / 100)) : null;
  const inStock = product.stock_quantity > 0;
  const badges = getProductBadges(product, discounts);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`${product.name} added to cart`, 'cart');
  }

  function handleNotifyMe(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    showToast(`We'll notify you when ${product.name} is back in stock`, 'stock');
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className={`card overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col ${
        !inStock ? 'grayscale-[45%] opacity-80' : ''
      }`}
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-white font-display font-semibold text-sm leading-snug line-clamp-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
            <span className="text-amber-400 font-bold text-sm">{formatINR(discountedPrice ?? product.price)}</span>
            {offer && <span className="text-white/60 text-xs line-through">{formatINR(product.price)}</span>}
            {offer && <span className="text-[10px] font-bold text-emerald-400">{offer.discount_percent}% OFF</span>}
          </div>
          <div className="flex items-center gap-2 mt-2.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
            <span className="flex items-center gap-1 text-[11px] font-semibold bg-white text-slate-900 rounded-md px-2 py-1">
              <Eye size={12} /> View Details
            </span>
            {inStock && (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500 text-slate-900 rounded-md px-2 py-1 hover:bg-amber-400"
              >
                <ShoppingCart size={12} /> Add to Cart
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {offer && (
            <span className="badge bg-amber-500 text-slate-900 flex items-center gap-1">
              <Tag size={12} /> {offer.discount_percent}% OFF
            </span>
          )}
          {badges.map((b) => (
            <span key={b} className={`badge ${BADGE_STYLES[b]}`}>{b}</span>
          ))}
        </div>
        <span className="absolute top-2 right-2 badge bg-white/90 text-slate-700">{product.category}</span>

        {!inStock && (
          <span className="absolute bottom-2 left-2 badge bg-slate-900/90 text-white flex items-center gap-1">
            <PackageX size={12} /> Out of Stock
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-slate-400">{product.brand}</p>
        <h3 className="font-display font-semibold text-slate-900 mt-0.5">{product.name}</h3>
        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{product.description}</p>
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            {discountedPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-brand-700">{formatINR(discountedPrice)}</span>
                <span className="text-xs text-slate-400 line-through">{formatINR(product.price)}</span>
              </div>
            ) : (
              <span className="font-display font-bold text-brand-700">{formatINR(product.price)}</span>
            )}
          </div>
          {!inStock && (
            <button
              onClick={handleNotifyMe}
              className="text-xs font-semibold text-brand-700 border border-brand-200 rounded-lg px-2.5 py-1.5 hover:bg-brand-50 shrink-0"
            >
              Notify Me
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
