import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'brand' | 'emerald' | 'amber' | 'rose' | 'slate';
  sublabel?: string;
}

const toneStyles: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700'
};

export default function KpiCard({ label, value, icon: Icon, tone = 'brand', sublabel }: KpiCardProps) {
  return (
    <div className="card p-4 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-display font-bold text-slate-900">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toneStyles[tone]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}
