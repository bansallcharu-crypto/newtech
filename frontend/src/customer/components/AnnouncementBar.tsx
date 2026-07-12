import React from 'react';
import { Percent, Truck, Layers, Clock3 } from 'lucide-react';

const ANNOUNCEMENTS = [
  { icon: Percent, text: 'Flat 10% OFF on all laptops this week' },
  { icon: Layers, text: 'Order 10+ units and unlock automatic bulk discounts' },
  { icon: Truck, text: 'Free shipping on orders above ₹25,000' },
  { icon: Clock3, text: 'Limited-time sale — while stocks last!' }
];

export default function AnnouncementBar() {
  const loop = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <div className="bg-slate-900 text-amber-400 overflow-hidden whitespace-nowrap border-b border-white/10">
      <div className="marquee-track flex items-center gap-10 py-2 text-xs md:text-sm font-medium">
        {loop.map((item, i) => {
          const Icon = item.icon;
          return (
            <span key={i} className="inline-flex items-center gap-2 shrink-0">
              <Icon size={14} className="text-amber-400" />
              {item.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
