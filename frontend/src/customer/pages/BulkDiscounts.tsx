import React from 'react';
import { Link } from 'react-router-dom';
import { Percent, Layers } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function BulkDiscounts() {
  const { discounts, products } = useData();
  const generalTiers = discounts.filter((d) => d.scope === 'all' && d.active).sort((a, b) => a.min_quantity - b.min_quantity);
  const productTiers = discounts.filter((d) => d.scope === 'product' && d.active);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900">Bulk Discounts</h1>
        <p className="text-slate-600 mt-2">
          Ordering 10 or more units of any product? You automatically qualify for tiered pricing — no coupon codes needed.
          Discounts are calculated live at checkout based on quantity.
        </p>
      </div>

      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Percent size={18} className="text-brand-600" />
          <h2 className="font-display font-semibold text-slate-800">Standard Tiers (All Products)</h2>
        </div>
        {generalTiers.length === 0 ? (
          <p className="text-sm text-slate-400">No standard bulk tiers configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {generalTiers.map((t) => (
              <div key={t.id} className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-display font-bold text-brand-700">{t.discount_percent}%</p>
                <p className="text-xs text-slate-500 mt-1">off for {t.min_quantity}+ units</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {productTiers.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-brand-600" />
            <h2 className="font-display font-semibold text-slate-800">Product-Specific Bulk Pricing</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
                <th className="py-2">Product</th>
                <th className="py-2">Minimum Quantity</th>
                <th className="py-2">Discount</th>
              </tr>
            </thead>
            <tbody>
              {productTiers.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5">
                    <Link to={`/products/${t.product_id}`} className="text-brand-700 hover:underline">{t.product_name}</Link>
                  </td>
                  <td className="py-2.5">{t.min_quantity}+ units</td>
                  <td className="py-2.5 font-semibold text-slate-800">{t.discount_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 text-center">
        <p className="text-slate-600 mb-3">Need a custom quote for a large order?</p>
        <Link to="/contact" className="btn-primary inline-flex">Talk to Our Sales Team</Link>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">{products.length} products currently eligible for bulk ordering.</p>
    </div>
  );
}
