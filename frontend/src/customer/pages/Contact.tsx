import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import EnquiryForm from '../components/EnquiryForm';

export default function Contact() {
  const { products } = useData();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900">Contact Us</h1>
        <p className="text-slate-600 mt-2">
          Have a question about a product, an order, or a bulk quote? Send us a message and our team will respond
          within one business day.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="card p-5 flex items-start gap-3">
            <MapPin size={20} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Showroom Address</p>
              <p className="text-sm text-slate-500">NexTech Computers, Plot 42, Sector 18, Gurugram, Haryana 122015</p>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3">
            <Phone size={20} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Phone</p>
              <p className="text-sm text-slate-500">+91 98765 43210</p>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3">
            <Mail size={20} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Email</p>
              <p className="text-sm text-slate-500">sales@nextechcomputers.in</p>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3">
            <Clock size={20} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Business Hours</p>
              <p className="text-sm text-slate-500">Mon–Sat, 10:00 AM – 7:00 PM</p>
            </div>
          </div>
        </div>

        <EnquiryForm products={products} title="Send Us a Message" />
      </div>
    </div>
  );
}
