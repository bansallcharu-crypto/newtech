import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getErrorMessage } from '../../api/client';
import { formatINR } from '../../utils/pricing';
import type { Expense, ExpenseCategory } from '../../types';
import Modal from '../components/Modal';

const emptyForm = { category: 'Operational' as ExpenseCategory, description: '', amount: '', expense_date: '' };

export default function Expenses() {
  const { expenses, createExpense, updateExpense, deleteExpense } = useData();
  const [filter, setFilter] = useState<'all' | ExpenseCategory>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const filtered = useMemo(() => expenses.filter((e) => filter === 'all' || e.category === filter), [expenses, filter]);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(exp: Expense) {
    setEditing(exp);
    setForm({ category: exp.category, description: exp.description, amount: String(exp.amount), expense_date: exp.expense_date });
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await updateExpense(editing.id, payload);
      } else {
        await createExpense(payload);
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
    await deleteExpense(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">{formatINR(total)} total for current filter</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Expense</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'Salary', 'Advertisement', 'Operational', 'Other'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              filter === c ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp) => (
              <tr key={exp.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <span className="badge bg-slate-100 text-slate-700">{exp.category}</span>
                </td>
                <td className="px-4 py-3 text-slate-700">{exp.description}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{formatINR(exp.amount)}</td>
                <td className="px-4 py-3 text-slate-500">{exp.expense_date}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteTarget(exp)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400"><Wallet className="mx-auto mb-2" size={28} />No expenses in this category.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Expense' : 'Add Expense'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                <option value="Salary">Salary</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Operational">Operational</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (₹)</label>
                <input className="input" type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" required value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
              </div>
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Expense'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Expense" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">Delete expense <strong>{deleteTarget.description}</strong>?</p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
