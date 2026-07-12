import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getErrorMessage } from '../../api/client';
import { isOfferLive } from '../../utils/pricing';
import type { Offer } from '../../types';
import Modal from '../components/Modal';

const emptyForm = {
  title: '', description: '', discount_percent: '', scope: 'all' as 'all' | 'product',
  product_id: '', start_date: '', end_date: '', active: true
};

export default function Offers() {
  const { offers, products, createOffer, updateOffer, deleteOffer } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(o: Offer) {
    setEditing(o);
    setForm({
      title: o.title, description: o.description, discount_percent: String(o.discount_percent),
      scope: o.scope, product_id: o.product_id ? String(o.product_id) : '', start_date: o.start_date,
      end_date: o.end_date, active: o.active
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title,
      description: form.description,
      discount_percent: Number(form.discount_percent),
      scope: form.scope,
      product_id: form.scope === 'product' ? Number(form.product_id) : null,
      start_date: form.start_date,
      end_date: form.end_date,
      active: form.active
    };
    try {
      if (form.scope === 'product' && !form.product_id) {
        throw new Error('Please select a product for this offer.');
      }
      if (editing) {
        await updateOffer(editing.id, payload);
      } else {
        await createOffer(payload);
      }
      setModalOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteOffer(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Offers</h1>
          <p className="text-sm text-slate-500 mt-1">Run time-bound promotions site-wide or on specific products.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Offer</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((o) => {
          const live = isOfferLive(o);
          return (
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Tag size={18} /></div>
                  <div>
                    <p className="font-semibold text-slate-800">{o.title}</p>
                    <p className="text-xs text-slate-500">{o.scope === 'all' ? 'All products' : o.product_name}</p>
                  </div>
                </div>
                <span className={`badge ${live ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {live ? 'Live' : o.active ? 'Scheduled/Expired' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-3">{o.description}</p>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="font-bold text-brand-700">{o.discount_percent}% OFF</span>
                <span className="text-xs text-slate-500">{o.start_date} → {o.end_date}</span>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600"><Pencil size={16} /></button>
                <button onClick={() => setDeleteTarget(o)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
        {offers.length === 0 && (
          <div className="card p-10 text-center text-slate-400 md:col-span-2">No offers created yet.</div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Offer' : 'Add Offer'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Discount %</label>
                <input className="input" type="number" min="1" max="90" required value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </div>
              <div>
                <label className="label">Scope</label>
                <select className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as any })}>
                  <option value="all">All Products</option>
                  <option value="product">Specific Product</option>
                </select>
              </div>
            </div>
            {form.scope === 'product' && (
              <div>
                <label className="label">Product</label>
                <select className="input" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                  <option value="">Select a product…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input className="input" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="label">End Date</label>
                <input className="input" type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Offer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Offer" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">Delete offer <strong>{deleteTarget.title}</strong>?</p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
