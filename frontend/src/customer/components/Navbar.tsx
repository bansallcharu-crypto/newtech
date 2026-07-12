import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Cpu, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/features', label: 'Features' },
  { to: '/offers', label: 'Offers' },
  { to: '/bulk-discounts', label: 'Bulk Discounts' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-20 bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2 font-display font-bold text-lg" onClick={() => setOpen(false)}>
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <Cpu size={18} />
          </span>
          NexTech Computers
        </NavLink>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <NavLink to="/checkout" className="relative text-white p-2" aria-label="Checkout">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-slate-900 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/contact" className="hidden lg:inline-flex btn-amber !py-2">Get a Quote</NavLink>
          <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/10 px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-white/10 text-amber-400' : 'text-slate-300'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
