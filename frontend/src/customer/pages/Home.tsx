import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Laptop, GraduationCap, ShieldCheck, Truck, Percent, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isOfferLive } from '../../utils/pricing';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products, offers, discounts, publicLoading } = useData();
  const featured = products.filter((p) => p.featured && p.status === 'active').slice(0, 4);
  const liveOffers = offers.filter((o) => isOfferLive(o));

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-ink via-brand-900 to-ink text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #4f83ff 0, transparent 40%), radial-gradient(circle at 80% 60%, #f2a022 0, transparent 35%)' }} />
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 badge bg-white/10 text-amber-400 mb-4">
              <Sparkles size={12} /> Trusted by 200+ schools & businesses
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              Laptops & learning software, <span className="text-amber-400">built for how you actually work.</span>
            </h1>
            <p className="mt-4 text-slate-300 text-base md:text-lg max-w-xl">
              From classroom-ready laptops to studio workstations and campus software licenses — NexTech equips students, teams and institutions with reliable technology at fair prices.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="btn-amber">Browse Products <ArrowRight size={16} /></Link>
              <Link to="/bulk-discounts" className="btn-secondary !bg-white/5 !text-white !border-white/20 hover:!bg-white/10">Bulk Pricing</Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900"
                alt="NexBook laptop"
                className="rounded-xl w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white text-ink rounded-xl shadow-xl px-4 py-3 hidden sm:block">
              <p className="text-xs text-slate-500">Starting from</p>
              <p className="font-display font-bold text-lg">₹21,999</p>
            </div>
          </div>
        </div>
      </section>

      {liveOffers.length > 0 && (
        <section className="bg-amber-500 text-slate-900">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-2 text-sm font-medium overflow-x-auto">
            <Percent size={16} className="shrink-0" />
            {liveOffers.map((o, i) => (
              <span key={o.id} className="shrink-0">
                {o.title} — {o.discount_percent}% off{i < liveOffers.length - 1 ? '  •  ' : ''}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Laptop, label: '15–20 curated products' },
            { icon: GraduationCap, label: 'Built for education' },
            { icon: ShieldCheck, label: 'Warranty on all devices' },
            { icon: Truck, label: 'Pan-India delivery' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2 p-4">
              <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Icon size={20} />
              </div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-brand-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {publicLoading ? (
          <p className="text-slate-400 text-sm">Loading products…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} offers={offers} discounts={discounts} />)}
          </div>
        )}
      </section>

      <section className="bg-slate-50 py-14">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Ordering for a school or team?</h2>
            <p className="text-slate-600 mt-2">
              Orders of 10 units or more automatically qualify for tiered bulk discounts — the more you order, the more you save.
            </p>
            <Link to="/bulk-discounts" className="btn-primary mt-4 inline-flex">See Bulk Discount Tiers</Link>
          </div>
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase text-slate-500">Example</p>
            <p className="text-sm text-slate-600 mt-2">30 × NexBook Edu 11 for a school computer lab, with an active 10% bulk discount, could save</p>
            <p className="text-2xl font-display font-bold text-brand-700 mt-1">₹74,997</p>
            <p className="text-xs text-slate-400 mt-1">versus buying at list price, one at a time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
