import React, { useMemo, useState } from 'react';
import { Trash2, MessageSquareText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import type { EnquiryStatus } from '../../types';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function Enquiries() {
  const { enquiries, updateEnquiry, deleteEnquiry } = useData();
  const [statusFilter, setStatusFilter] = useState<'all' | EnquiryStatus>('all');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const filtered = useMemo(() => enquiries.filter((e) => statusFilter === 'all' || e.status === statusFilter), [enquiries, statusFilter]);

  async function confirmDelete() {
    if (deleteTarget === null) return;
    await deleteEnquiry(deleteTarget);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Enquiries</h1>
        <p className="text-sm text-slate-500 mt-1">Quote requests submitted from the customer website.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'New', 'Contacted', 'Closed'] as const).map((s) => (
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

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((enq) => (
          <div key={enq.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-slate-800">{enq.name}</p>
                <p className="text-xs text-slate-500">{enq.email} · {enq.phone}</p>
                {enq.product_name && <p className="text-xs text-brand-700 mt-1">Interested in: {enq.product_name} (Qty: {enq.quantity})</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="input w-auto text-xs py-1.5"
                  value={enq.status}
                  onChange={(e) => updateEnquiry(enq.id, { status: e.target.value as EnquiryStatus })}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Closed">Closed</option>
                </select>
                <StatusBadge status={enq.status} />
                <button onClick={() => setDeleteTarget(enq.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 size={16} /></button>
              </div>
            </div>
            {enq.message && <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-lg p-3">{enq.message}</p>}
            <p className="text-xs text-slate-400 mt-2">{new Date(enq.created_at).toLocaleString('en-IN')}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-slate-400">
            <MessageSquareText className="mx-auto mb-2" size={28} />
            No enquiries in this category.
          </div>
        )}
      </div>

      {deleteTarget !== null && (
        <Modal title="Delete Enquiry" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">Delete this enquiry permanently?</p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
