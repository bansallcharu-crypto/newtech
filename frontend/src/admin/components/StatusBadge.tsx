import React from 'react';

const colorMap: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-200 text-slate-600',
  Pending: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-brand-100 text-brand-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  New: 'bg-brand-100 text-brand-700',
  Contacted: 'bg-amber-100 text-amber-700',
  Closed: 'bg-slate-200 text-slate-600'
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${colorMap[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}
