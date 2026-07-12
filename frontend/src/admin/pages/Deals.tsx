import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Handshake } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getErrorMessage } from '../../api/client';
import { formatINR, getBulkDiscountForQuantity } from '../../utils/pricing';
import type { Deal, DealStatus } from '../../types';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  customer_name: '', customer_email: '', customer_phone: '', product_id: '',
  quantity: '1', unit_price: '', discount_percent: '0', status: 'Pending' as DealStatus, notes: ''
};

export default function Deals() {
  const { deals, products, discounts, createDeal, updateDeal, deleteDeal } = useData();
  const [statusFilter, setStatusFilter] = useState<'all' | DealStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);

  const filtered = useMemo(() => deals.filter((d) => statusFilter === 'all' || d.status === statusFilter), [deals, statusFilter]);

  const selectedProduct = products.find((p) => p.id === Number(form.product_id));
  const quantityNum = Number(form.quantity || 0);
  const unitPriceNum = Number(form.unit_price || 0);
  const discountNum = Number(form.discount_percent || 0);
  const previewTotal = Math.round(quantityNum * unitPriceNum * (1 - discountNum / 100));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(d: Deal) {
    setEditing(d);
    setForm({
      customer_name: d.customer_name, customer_email: d.customer_email, customer_phone: d.customer_phone,
      product_id: String(d.product_id), quantity: String(d.quantity), unit_price: String(d.unit_price),
      discount_percent: String(d.discount_percent), status: d.status, notes: d.notes
    });
    setError(null);
    setModalOpen(true);
  }

  function handleProductChange(productId: string) {
    const p = products.find((prod) => prod.id === Number(productId));
    const suggestedDiscount = p ? getBulkDiscountForQuantity(discounts, p.id, quantityNum)?.discount_percent ?? 0 : 0;
    setForm({ ...form, product_id: productId, unit_price: p ? String(p.price) : '', discount_percent: String(suggestedDiscount) });
  }

  function handleQuantityChange(qty: string) {
    const p = selectedProduct;
    const suggestedDiscount = p ? getBulkDiscountForQuantity(discounts, p.id, Number(qty || 0))?.discount_percent ?? 0 : Number(form.discount_percent);
    setForm({ ...form, quantity: qty, discount_percent: String(suggestedDiscount) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        product_id: Number(form.product_id),
        quantity: quantityNum,
        unit_price: unitPriceNum,
        discount_percent: discountNum,
        status: form.status,
        notes: form.notes
      };
      if (editing) {
        await updateDeal(editing.id, payload);
      } else {
        await createDeal(payload);
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
    try {
      await deleteDeal(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Deals</h1>
          <p className="text-sm text-slate-500 mt-1">Record customer deals and track their impact on inventory.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Deal</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              statusFilter === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{d.customer_name}</p>
                  <p className="text-xs text-slate-400">{d.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.product_name || '—'}</td>
                <td className="px-4 py-3">{d.quantity}</td>
                <td className="px-4 py-3">{d.discount_percent}%</td>
                <td className="px-4 py-3 font-medium text-slate-800">{formatINR(d.total_amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400"><Handshake className="mx-auto mb-2" size={28} />No deals match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Deal' : 'New Deal'} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Customer Name</label>
                <input className="input" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
            </div>
            <div>
              <label className="label">Product</label>
              <select className="input" required value={form.product_id} onChange={(e) => handleProductChange(e.target.value)}>
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} in stock)</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Quantity</label>
                <input className="input" type="number" min="1" required value={form.quantity} onChange={(e) => handleQuantityChange(e.target.value)} />
              </div>
              <div>
                <label className="label">Unit Price (₹)</label>
                <input className="input" type="number" min="0" required value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
              </div>
              <div>
                <label className="label">Discount %</label>
                <input className="input" type="number" min="0" max="90" required value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </div>
            </div>
            {quantityNum >= 10 && (
              <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2">
                Bulk order of {quantityNum} units — discount auto-suggested from active bulk discount rules. Adjust if needed.
              </p>
            )}
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DealStatus })}>
                <option value="Pending">Pending (no inventory impact)</option>
                <option value="Confirmed">Confirmed (deducts inventory)</option>
                <option value="Delivered">Delivered (deducts inventory)</option>
                <option value="Cancelled">Cancelled (returns inventory)</option>
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Estimated Total</span>
              <span className="text-lg font-display font-bold text-slate-900">{formatINR(previewTotal || 0)}</span>
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Deal'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Deal" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">
            Delete the deal with <strong>{deleteTarget.customer_name}</strong>? Any inventory already deducted will be restored.
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
