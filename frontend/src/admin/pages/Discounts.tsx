import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Percent } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getErrorMessage } from '../../api/client';
import type { BulkDiscount } from '../../types';
import Modal from '../components/Modal';

const emptyForm = { scope: 'all' as 'all' | 'product', product_id: '', min_quantity: '10', discount_percent: '', active: true };

export default function Discounts() {
  const { discounts, products, createDiscount, updateDiscount, deleteDiscount } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BulkDiscount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BulkDiscount | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(d: BulkDiscount) {
    setEditing(d);
    setForm({
      scope: d.scope, product_id: d.product_id ? String(d.product_id) : '',
      min_quantity: String(d.min_quantity), discount_percent: String(d.discount_percent), active: d.active
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (Number(form.min_quantity) < 10) {
        throw new Error('Minimum quantity for bulk discounts must be at least 10.');
      }
      if (form.scope === 'product' && !form.product_id) {
        throw new Error('Please select a product for this discount rule.');
      }
      const payload = {
        scope: form.scope,
        product_id: form.scope === 'product' ? Number(form.product_id) : null,
        min_quantity: Number(form.min_quantity),
        discount_percent: Number(form.discount_percent),
        active: form.active
      };
      if (editing) {
        await updateDiscount(editing.id, payload);
      } else {
        await createDiscount(payload);
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
    await deleteDiscount(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Bulk Discounts</h1>
          <p className="text-sm text-slate-500 mt-1">Configure tiered discounts for orders of 10 or more units.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Rule</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
              <th className="px-4 py-3">Applies To</th>
              <th className="px-4 py-3">Min. Quantity</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-4 py-3 flex items-center gap-2">
                  <Percent size={16} className="text-brand-600" />
                  {d.scope === 'all' ? 'All Products' : d.product_name}
                </td>
                <td className="px-4 py-3">{d.min_quantity}+ units</td>
                <td className="px-4 py-3 font-semibold text-brand-700">{d.discount_percent}%</td>
                <td className="px-4 py-3">
                  <span className={`badge ${d.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {d.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {discounts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No bulk discount rules yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Bulk Discount Rule' : 'Add Bulk Discount Rule'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Scope</label>
              <select className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as any })}>
                <option value="all">All Products</option>
                <option value="product">Specific Product</option>
              </select>
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
                <label className="label">Minimum Quantity</label>
                <input className="input" type="number" min="10" required value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} />
              </div>
              <div>
                <label className="label">Discount %</label>
                <input className="input" type="number" min="1" max="60" required value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Rule'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Bulk Discount Rule" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">
            Delete the rule for <strong>{deleteTarget.scope === 'all' ? 'All Products' : deleteTarget.product_name}</strong> ({deleteTarget.min_quantity}+ units)?
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
