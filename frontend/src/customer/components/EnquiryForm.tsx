import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getErrorMessage } from '../../api/client';
import type { Product } from '../../types';

interface EnquiryFormProps {
  product?: Product;
  products?: Product[];
  title?: string;
}

export default function EnquiryForm({ product, products, title }: EnquiryFormProps) {
  const { submitEnquiry } = useData();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', quantity: '1', message: '',
    product_id: product ? String(product.id) : ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitEnquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        quantity: Number(form.quantity) || 1,
        message: form.message,
        product_id: form.product_id ? Number(form.product_id) : null
      });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={36} />
        <h3 className="font-display font-semibold text-slate-800">Thanks — we've got your request!</h3>
        <p className="text-sm text-slate-500 mt-1">Our sales team will reach out within 1 business day with a tailored quote.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {title && <h3 className="font-display font-semibold text-slate-800">{title}</h3>}
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
      {products && (
        <div>
          <label className="label">Product of Interest</label>
          <select className="input" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
            <option value="">General enquiry</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label">Quantity Required</label>
        <input className="input" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <p className="text-xs text-slate-400 mt-1">Ordering 10 or more? You may qualify for bulk pricing.</p>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input" rows={3} placeholder="Tell us about your requirement…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        <Send size={16} /> {loading ? 'Sending…' : 'Request a Quote'}
      </button>
    </form>
  );
}
