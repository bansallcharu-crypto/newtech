import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PackageCheck, PackageX, ChevronLeft, BadgeCheck, ShoppingCart, Zap, BellRing } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { computePrice, formatINR, getBulkDiscountsForProduct } from '../../utils/pricing';
import EnquiryForm from '../components/EnquiryForm';
import { BADGE_STYLES, getProductBadges } from '../utils/badges';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, offers, discounts } = useData();
  const { addToCart, setBuyNow } = useCart();
  const { showToast } = useToast();
  const product = products.find((p) => p.id === Number(id));
  const [quantity, setQuantity] = useState(1);
  const lastBulkTierId = useRef<number | null>(null);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Product not found.</p>
        <Link to="/products" className="text-brand-700 font-semibold text-sm mt-2 inline-block">Back to Products</Link>
      </div>
    );
  }

  const breakdown = computePrice(product, quantity, offers, discounts);
  const tiers = getBulkDiscountsForProduct(discounts, product.id);
  const inStock = product.stock_quantity > 0;
  const badges = getProductBadges(product, discounts);

  useEffect(() => {
    if (breakdown.appliedBulkDiscount && breakdown.appliedBulkDiscount.id !== lastBulkTierId.current) {
      lastBulkTierId.current = breakdown.appliedBulkDiscount.id;
      showToast(`Bulk discount applied: ${breakdown.bulkDiscountPercent}% off for ${quantity} units`, 'bulk');
    }
    if (!breakdown.appliedBulkDiscount) {
      lastBulkTierId.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdown.appliedBulkDiscount?.id, quantity]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`${product.name} added to cart`, 'cart');
  };

  const handleBuyNow = () => {
    if (!inStock) {
      showToast(`${product.name} is out of stock`, 'stock');
      return;
    }
    setBuyNow(product, quantity);
    navigate('/checkout');
  };

  const handleNotifyMe = () => {
    showToast(`We'll notify you when ${product.name} is back in stock`, 'stock');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <Link to="/products" className="text-sm text-slate-500 flex items-center gap-1 mb-6 hover:text-brand-700">
        <ChevronLeft size={16} /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3]">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="badge bg-brand-50 text-brand-700">{product.category}</span>
            {badges.map((b) => (
              <span key={b} className={`badge ${BADGE_STYLES[b]}`}>{b}</span>
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mt-3">{product.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{product.brand} · SKU: {product.sku}</p>
          <p className="text-slate-600 mt-4">{product.description}</p>

          <ul className="mt-4 space-y-1.5">
            {product.specs.map((spec, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <BadgeCheck size={15} className="text-brand-600 shrink-0" /> {spec}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-2">
            {inStock ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <PackageCheck size={16} /> {product.stock_quantity} units in stock
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-rose-600">
                <PackageX size={16} /> Currently out of stock
              </span>
            )}
          </div>

          <div className="card p-5 mt-6">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="input w-24 text-center"
              />
            </div>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Base price</span><span>{formatINR(breakdown.basePrice)}</span>
              </div>
              {breakdown.appliedOffer && (
                <div className="flex justify-between text-amber-600">
                  <span>Offer: {breakdown.appliedOffer.title}</span><span>-{breakdown.offerDiscountPercent}%</span>
                </div>
              )}
              {breakdown.appliedBulkDiscount && (
                <div className="flex justify-between text-brand-600">
                  <span>Bulk discount ({breakdown.appliedBulkDiscount.min_quantity}+ units)</span><span>-{breakdown.bulkDiscountPercent}%</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-slate-800 pt-1.5 border-t border-slate-100">
                <span>Unit price</span><span>{formatINR(breakdown.unitPrice)}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-lg text-slate-900">
                <span>Total ({quantity} unit{quantity > 1 ? 's' : ''})</span><span>{formatINR(breakdown.total)}</span>
              </div>
            </div>

            {tiers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Bulk Pricing Tiers</p>
                <div className="space-y-1">
                  {tiers.map((t) => (
                    <div key={t.id} className="flex justify-between text-xs text-slate-600">
                      <span>{t.min_quantity}+ units</span><span className="font-medium">{t.discount_percent}% off</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              {inStock ? (
                <>
                  <button onClick={handleAddToCart} className="btn-secondary flex-1">
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button onClick={handleBuyNow} className="btn-amber flex-1">
                    <Zap size={16} /> Buy Now
                  </button>
                </>
              ) : (
                <>
                  <button disabled className="btn-secondary flex-1 !opacity-50 !cursor-not-allowed">
                    <Zap size={16} /> Buy Now
                  </button>
                  <button onClick={handleNotifyMe} className="btn-primary flex-1">
                    <BellRing size={16} /> Notify Me
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mt-12">
        <EnquiryForm product={product} title={`Request a quote for ${product.name}`} />
      </div>
    </div>
  );
}
