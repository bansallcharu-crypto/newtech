import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, Tag, PackagePlus, PackageX, PartyPopper, X } from 'lucide-react';

export type ToastType = 'cart' | 'coupon' | 'bulk' | 'stock' | 'success' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, React.ElementType> = {
  cart: PackagePlus,
  coupon: Tag,
  bulk: Tag,
  stock: PackageX,
  success: PartyPopper,
  info: CheckCircle2
};

const STYLES: Record<ToastType, string> = {
  cart: 'bg-brand-600',
  coupon: 'bg-amber-500 !text-slate-900',
  bulk: 'bg-emerald-600',
  stock: 'bg-rose-600',
  success: 'bg-emerald-600',
  info: 'bg-slate-800'
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-xs">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl shadow-xl text-white text-sm font-medium px-4 py-3 ${STYLES[t.type]}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
