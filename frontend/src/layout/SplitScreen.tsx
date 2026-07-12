import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LayoutDashboard, Monitor, Radio } from 'lucide-react';
import AdminApp from '../admin/AdminApp';
import CustomerApp from '../customer/CustomerApp';

type MobileTab = 'admin' | 'site';

export default function SplitScreen() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('admin');

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100">
      <header className="flex items-center justify-between px-4 py-2.5 bg-ink text-white shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-sm">N</div>
          <span className="font-display font-semibold tracking-tight">NexTech Control Center</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
          <Radio size={14} className="text-emerald-400 animate-pulse" />
          Admin changes sync live to the storefront preview
        </div>
        <div className="flex md:hidden items-center gap-1 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setMobileTab('admin')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mobileTab === 'admin' ? 'bg-white text-ink' : 'text-slate-300'
            }`}
          >
            <LayoutDashboard size={14} /> Admin
          </button>
          <button
            onClick={() => setMobileTab('site')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mobileTab === 'site' ? 'bg-white text-ink' : 'text-slate-300'
            }`}
          >
            <Monitor size={14} /> Live Site
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`h-full w-full md:w-1/2 overflow-y-auto scrollbar-thin border-r border-slate-200 ${
            mobileTab === 'admin' ? 'block' : 'hidden'
          } md:block`}
        >
          <MemoryRouter initialEntries={['/login']}>
            <AdminApp />
          </MemoryRouter>
        </div>

        <div
          className={`h-full w-full md:w-1/2 overflow-y-auto scrollbar-thin bg-white ${
            mobileTab === 'site' ? 'block' : 'hidden'
          } md:block`}
        >
          <div className="sticky top-0 z-10 bg-slate-900 text-slate-200 text-[11px] px-4 py-1.5 flex items-center gap-2 font-medium">
            <Monitor size={12} />
            Live Customer Site Preview — nextech.example
          </div>
          <MemoryRouter initialEntries={['/']}>
            <CustomerApp />
          </MemoryRouter>
        </div>
      </div>
    </div>
  );
}
