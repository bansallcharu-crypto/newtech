import React from 'react';
import { Target, Users, Building2, Sparkle } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section className="bg-slate-50 py-14">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">About NexTech Computers</h1>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            NexTech Computers is a retail technology business focused on one mission: making dependable laptops and
            purpose-built educational software accessible to students, schools, and growing teams across India.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900"
          alt="NexTech showroom"
          className="rounded-2xl aspect-[4/3] object-cover"
        />
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Our Story</h2>
          <p className="text-slate-600 mt-3">
            We started NexTech to solve a simple problem: schools and small businesses were stuck choosing between
            overpriced premium brands and unreliable budget imports. NexTech curates a focused range of 15–20 laptops
            and software titles, each selected for durability, serviceability and long-term value — not just spec-sheet
            marketing.
          </p>
          <p className="text-slate-600 mt-3">
            Today, we work directly with schools, coaching institutes, design studios and corporate teams to supply
            everything from single replacement laptops to fleet-wide rollouts of 50 or more units.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Target, label: 'Our Mission', desc: 'Reliable technology, honestly priced, for every classroom and team.' },
            { icon: Users, label: 'Our Team', desc: 'A lean, dedicated team across sales, support, and logistics.' },
            { icon: Building2, label: 'Institutional Focus', desc: 'Purpose-built processes for bulk and B2B procurement.' },
            { icon: Sparkle, label: 'Our Promise', desc: 'Transparent pricing with no hidden fees, ever.' }
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card p-5">
              <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-display font-semibold text-slate-800">{label}</h3>
              <p className="text-sm text-slate-500 mt-1.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
