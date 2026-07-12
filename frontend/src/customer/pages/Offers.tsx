import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, CalendarClock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isOfferLive } from '../../utils/pricing';

export default function Offers() {
  const { offers } = useData();
  const live = offers.filter((o) => isOfferLive(o));
  const upcoming = offers.filter((o) => !isOfferLive(o) && o.active && new Date(o.start_date) > new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900">Current Offers</h1>
        <p className="text-slate-600 mt-2">Limited-time discounts on laptops and software. Prices update automatically on the product page.</p>
      </div>

      {live.length === 0 ? (
        <div className="card p-10 text-center text-slate-400 mb-10">No active offers right now — check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {live.map((o) => (
            <div key={o.id} className="card p-5 border-2 border-amber-400/40">
              <div className="flex items-center justify-between">
                <span className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Tag size={18} /></span>
                <span className="badge bg-emerald-100 text-emerald-700">Live</span>
              </div>
              <h3 className="font-display font-semibold text-slate-800 mt-3">{o.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{o.description}</p>
              <p className="text-xs text-slate-400 mt-2">{o.scope === 'all' ? 'Applies to all products' : `Applies to: ${o.product_name}`}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-display font-bold text-brand-700">{o.discount_percent}% OFF</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><CalendarClock size={12} /> until {o.end_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-slate-800 mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map((o) => (
              <div key={o.id} className="card p-5 opacity-70">
                <h3 className="font-display font-semibold text-slate-700">{o.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{o.description}</p>
                <p className="text-xs text-slate-400 mt-2">Starts {o.start_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 card p-6 flex items-center justify-between flex-wrap gap-4 bg-slate-50">
        <div>
          <p className="font-display font-semibold text-slate-800">Buying 10 or more units?</p>
          <p className="text-sm text-slate-500">Bulk discounts stack with active offers for institutional buyers.</p>
        </div>
        <Link to="/bulk-discounts" className="btn-primary">See Bulk Discount Tiers</Link>
      </div>
    </div>
  );
}
