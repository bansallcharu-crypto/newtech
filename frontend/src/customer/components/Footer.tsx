import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink text-slate-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg text-white">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Cpu size={18} />
            </span>
            NexTech Computers
          </div>
          <p className="text-sm text-slate-400 mt-3">
            Laptops and educational software for students, institutions and growing businesses.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-amber-400">Products</Link></li>
            <li><Link to="/features" className="hover:text-amber-400">Features</Link></li>
            <li><Link to="/offers" className="hover:text-amber-400">Offers</Link></li>
            <li><Link to="/bulk-discounts" className="hover:text-amber-400">Bulk Discounts</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-amber-400">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Get in Touch</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><MapPin size={14} /> Sector 18, Gurugram, Haryana</li>
            <li className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail size={14} /> sales@nextechcomputers.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} NexTech Computers. All rights reserved.
      </div>
    </footer>
  );
}
