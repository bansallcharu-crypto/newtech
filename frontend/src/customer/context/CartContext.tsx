import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Product } from '../../types';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  setBuyNow: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  // Buy Now replaces the cart with just this product, then the caller navigates to /checkout
  const setBuyNow = useCallback((product: Product, quantity = 1) => {
    setLines([{ product, quantity }]);
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setLines((prev) => prev.map((l) => (l.product.id === productId ? { ...l, quantity: Math.max(1, quantity) } : l)));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const cartCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, cartCount, addToCart, setBuyNow, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
