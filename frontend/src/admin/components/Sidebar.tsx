import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Percent, Users, Wallet, Handshake, MessageSquareText, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/offers', label: 'Offers', icon: Tag },
  { to: '/discounts', label: 'Bulk Discounts', icon: Percent },
  { to: '/deals', label: 'Deals', icon: Handshake },
  { to: '/enquiries', label: 'Enquiries', icon: MessageSquareText },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/expenses', label: 'Expenses', icon: Wallet }
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-16 md:w-56 shrink-0 bg-ink text-slate-200 flex flex-col min-h-full">
      <div className="p-3 md:p-4 border-b border-white/10">
        <p className="hidden md:block text-xs text-slate-400">Signed in as</p>
        <p className="hidden md:block text-sm font-semibold text-white truncate">{user?.username}</p>
        <p className="md:hidden text-center text-sm font-bold text-white">
          {user?.username?.[0]?.toUpperCase()}
        </p>
      </div>
      <nav className="flex-1 py-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 md:px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 md:px-4 py-3 m-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-rose-600 hover:text-white transition-colors"
      >
        <LogOut size={18} />
        <span className="hidden md:inline">Log out</span>
      </button>
    </aside>
  );
}
