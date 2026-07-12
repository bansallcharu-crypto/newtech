import type { Product, Offer, BulkDiscount } from '../types';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function isOfferLive(offer: Offer, now: Date = new Date()): boolean {
  if (!offer.active) return false;
  const start = new Date(offer.start_date);
  const end = new Date(offer.end_date);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
}

export function getActiveOfferForProduct(offers: Offer[], productId: number): Offer | null {
  const live = offers.filter(
    (o) => isOfferLive(o) && (o.scope === 'all' || o.product_id === productId)
  );
  if (live.length === 0) return null;
  return live.reduce((best, current) => (current.discount_percent > best.discount_percent ? current : best));
}

export function getBulkDiscountsForProduct(discounts: BulkDiscount[], productId: number): BulkDiscount[] {
  return discounts
    .filter((d) => d.active && (d.scope === 'all' || d.product_id === productId))
    .sort((a, b) => a.min_quantity - b.min_quantity);
}

export function getBulkDiscountForQuantity(
  discounts: BulkDiscount[],
  productId: number,
  quantity: number
): BulkDiscount | null {
  const applicable = getBulkDiscountsForProduct(discounts, productId).filter((d) => quantity >= d.min_quantity);
  if (applicable.length === 0) return null;
  return applicable.reduce((best, current) => (current.discount_percent > best.discount_percent ? current : best));
}

export interface PriceBreakdown {
  basePrice: number;
  offerDiscountPercent: number;
  bulkDiscountPercent: number;
  effectiveDiscountPercent: number;
  unitPrice: number;
  quantity: number;
  total: number;
  appliedOffer: Offer | null;
  appliedBulkDiscount: BulkDiscount | null;
}

export function computePrice(
  product: Product,
  quantity: number,
  offers: Offer[],
  discounts: BulkDiscount[]
): PriceBreakdown {
  const appliedOffer = getActiveOfferForProduct(offers, product.id);
  const appliedBulkDiscount = getBulkDiscountForQuantity(discounts, product.id, quantity);
  const offerDiscountPercent = appliedOffer?.discount_percent ?? 0;
  const bulkDiscountPercent = appliedBulkDiscount?.discount_percent ?? 0;
  // Discounts stack additively but are capped at 60% to protect margin.
  const effectiveDiscountPercent = Math.min(offerDiscountPercent + bulkDiscountPercent, 60);
  const unitPrice = Math.round(product.price * (1 - effectiveDiscountPercent / 100));
  const total = unitPrice * quantity;
  return {
    basePrice: product.price,
    offerDiscountPercent,
    bulkDiscountPercent,
    effectiveDiscountPercent,
    unitPrice,
    quantity,
    total,
    appliedOffer,
    appliedBulkDiscount
  };
}
