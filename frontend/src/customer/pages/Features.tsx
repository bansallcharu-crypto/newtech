import React from 'react';
import { Cpu, ShieldCheck, Headphones, Truck, GraduationCap, Wrench, RefreshCcw, Award } from 'lucide-react';

const features = [
  { icon: Cpu, title: 'Latest-Gen Hardware', desc: 'Every NexBook ships with current-generation Intel or AMD processors and fast NVMe storage.' },
  { icon: GraduationCap, title: 'Education-First Software', desc: 'NexSoft licenses are built specifically for classrooms, labs and campus IT teams.' },
  { icon: ShieldCheck, title: 'Standard Warranty', desc: 'Every laptop includes a manufacturer warranty with an easy on-site claim process.' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'We deliver to metro and non-metro locations alike, with tracked logistics.' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'A named account manager for institutional and bulk buyers.' },
  { icon: Wrench, title: 'Setup Assistance', desc: 'Optional on-site setup and imaging for large deployments.' },
  { icon: RefreshCcw, title: 'Flexible Returns', desc: '7-day replacement window on manufacturing defects.' },
  { icon: Award, title: 'Certified Refurbish Option', desc: 'Selected models available in certified refurbished condition at lower prices.' }
];

export default function Features() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900">Why NexTech</h1>
        <p className="text-slate-600 mt-2">
          We built NexTech around one idea: technology purchases for schools and teams shouldn't be complicated. Here's what comes standard with every order.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5">
            <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
              <Icon size={20} />
            </div>
            <h3 className="font-display font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
