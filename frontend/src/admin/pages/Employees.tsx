import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getErrorMessage } from '../../api/client';
import { formatINR } from '../../utils/pricing';
import type { Employee } from '../../types';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const emptyForm = { name: '', role: '', email: '', phone: '', salary: '', join_date: '', status: 'active' as 'active' | 'inactive' };

export default function Employees() {
  const { employees, createEmployee, updateEmployee, deleteEmployee } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const totalMonthlySalary = employees.filter((e) => e.status === 'active').reduce((sum, e) => sum + e.salary, 0);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setForm({ name: emp.name, role: emp.role, email: emp.email, phone: emp.phone, salary: String(emp.salary), join_date: emp.join_date, status: emp.status });
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, salary: Number(form.salary) };
      if (editing) {
        await updateEmployee(editing.id, payload);
      } else {
        await createEmployee(payload);
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
    await deleteEmployee(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">
            {employees.length} team members · {formatINR(totalMonthlySalary)} total monthly payroll (active)
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Employee</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Salary / Month</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-4 py-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs">
                    {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  {emp.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{emp.role}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{emp.email}<br />{emp.phone}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{formatINR(emp.salary)}</td>
                <td className="px-4 py-3 text-slate-500">{emp.join_date}</td>
                <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteTarget(emp)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400"><Users className="mx-auto mb-2" size={28} />No employees added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Employee' : 'Add Employee'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Role</label>
                <input className="input" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div>
                <label className="label">Monthly Salary (₹)</label>
                <input className="input" type="number" min="0" required value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Join Date</label>
                <input className="input" type="date" required value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Employee'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Remove Employee" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">Remove <strong>{deleteTarget.name}</strong> from the employee roster?</p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Remove</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
