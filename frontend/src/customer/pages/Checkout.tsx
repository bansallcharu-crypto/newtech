import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PartyPopper, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../../context/DataContext';
import { computePrice, formatINR } from '../../utils/pricing';
import { getErrorMessage } from '../../api/client';
import Confetti from '../components/Confetti';

function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch {
    // Audio not supported — fail silently, popup still shows.
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { lines, updateQuantity, removeFromCart, clearCart } = useCart();
  const { offers, discounts, submitEnquiry } = useData();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const breakdowns = useMemo(
    () => lines.map((l) => ({ line: l, breakdown: computePrice(l.product, l.quantity, offers, discounts) })),
    [lines, offers, discounts]
  );

  const subtotal = breakdowns.reduce((sum, b) => sum + b.breakdown.total, 0);
  const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(subtotal - couponDiscount, 0);

  const bulkDiscountLines = breakdowns.filter((b) => b.breakdown.appliedBulkDiscount);

  function applyCoupon() {
    if (!couponCode.trim()) return;
    if (couponCode.trim().toUpperCase() === 'NEXTECH10') {
      setCouponApplied(true);
      showToast('Coupon applied! Extra 10% off your order.', 'coupon');
    } else {
      showToast('That coupon code is not valid.', 'stock');
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;

    const outOfStockLine = lines.find((l) => l.product.stock_quantity <= 0);
    if (outOfStockLine) {
      showToast(`${outOfStockLine.product.name} is out of stock and can't be ordered.`, 'stock');
      return;
    }

    setPlacing(true);
    setError(null);
    try {
      const summary = lines.map((l) => `${l.product.name} x${l.quantity}`).join(', ');
      await submitEnquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        quantity: lines.reduce((sum, l) => sum + l.quantity, 0),
        product_id: lines[0]?.product.id ?? null,
        message: `Direct purchase order — ${summary}. Delivery address: ${form.address}. Order total: ${formatINR(grandTotal)}${couponApplied ? ' (coupon NEXTECH10 applied)' : ''}.`
      });
      setSuccess(true);
      playSuccessChime();
      showToast('Order placed successfully!', 'success');
      clearCart();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center relative">
        <Confetti />
        <div className="card p-8">
          <PartyPopper className="mx-auto text-amber-500 mb-3" size={44} />
          <h1 className="text-2xl font-display font-bold text-slate-900">Congratulations!</h1>
          <p className="text-slate-600 mt-2">
            Your order has been placed successfully. Our team will reach out shortly to confirm delivery details.
          </p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
        <h1 className="text-xl font-display font-semibold text-slate-800">Your cart is empty</h1>
        <p className="text-slate-500 mt-1">Add a product to get started with checkout.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {breakdowns.map(({ line, breakdown }) => (
            <div key={line.product.id} className="card p-4 flex gap-4 items-center">
              <img src={line.product.image_url} alt={line.product.name} className="h-20 w-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{line.product.name}</p>
                <p className="text-sm text-slate-500">{formatINR(breakdown.unitPrice)} / unit</p>
                {breakdown.appliedBulkDiscount && (
                  <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                    <Tag size={11} /> Bulk discount {breakdown.bulkDiscountPercent}% applied
                  </p>
                )}
              </div>
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => updateQuantity(line.product.id, Number(e.target.value) || 1)}
                className="input w-20 text-center"
              />
              <p className="font-display font-bold text-slate-900 w-24 text-right">{formatINR(breakdown.total)}</p>
              <button onClick={() => removeFromCart(line.product.id)} className="text-slate-400 hover:text-rose-600" aria-label="Remove">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <form onSubmit={handlePlaceOrder} className="card p-5 space-y-4 mt-6">
            <h3 className="font-display font-semibold text-slate-800">Delivery Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Delivery Address</label>
              <textarea className="input" rows={2} required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button type="submit" disabled={placing} className="btn-primary w-full">
              {placing ? 'Placing Order…' : `Place Order — ${formatINR(grandTotal)}`}
            </button>
          </form>
        </div>

        <div className="card p-5 h-fit sticky top-20">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Order Summary</h3>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Coupon code (try NEXTECH10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponApplied}
            />
            <button type="button" onClick={applyCoupon} disabled={couponApplied} className="btn-secondary !px-3 shrink-0">
              {couponApplied ? 'Applied' : 'Apply'}
            </button>
          </div>
          {couponApplied && (
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <Tag size={11} /> NEXTECH10 applied — 10% off
            </p>
          )}
          {bulkDiscountLines.length > 0 && (
            <p className="text-xs text-brand-600 font-medium mt-2 flex items-center gap-1">
              <Tag size={11} /> Bulk discount active on {bulkDiscountLines.length} item(s)
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>{formatINR(subtotal)}</span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-amber-600">
                <span>Coupon discount</span><span>-{formatINR(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display font-bold text-lg text-slate-900 pt-1.5 border-t border-slate-100">
              <span>Total</span><span>{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
