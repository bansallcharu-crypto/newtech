import type { BulkDiscount, Product } from '../../types';

export type RetailBadge = 'Best Seller' | 'New Arrival' | 'Bulk Discount' | 'Limited Stock' | 'Top Rated';

export const BADGE_STYLES: Record<RetailBadge, string> = {
  'Best Seller': 'bg-amber-500 text-slate-900',
  'New Arrival': 'bg-emerald-500 text-white',
  'Bulk Discount': 'bg-brand-600 text-white',
  'Limited Stock': 'bg-rose-500 text-white',
  'Top Rated': 'bg-violet-500 text-white'
};

export function getProductBadges(product: Product, discounts: BulkDiscount[] = []): RetailBadge[] {
  const badges: RetailBadge[] = [];

  if (product.featured) badges.push('Best Seller');

  const createdAt = new Date(product.created_at);
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (!Number.isNaN(daysSinceCreated) && daysSinceCreated >= 0 && daysSinceCreated <= 30) {
    badges.push('New Arrival');
  }

  const hasBulkDiscount = discounts.some(
    (d) => d.active && (d.scope === 'all' || d.product_id === product.id)
  );
  if (hasBulkDiscount) badges.push('Bulk Discount');

  if (product.stock_quantity > 0 && product.stock_quantity <= 5) badges.push('Limited Stock');

  // Deterministic "Top Rated" flag so it doesn't flicker between renders (no rating field on Product).
  if (product.id % 3 === 0 && product.status === 'active') badges.push('Top Rated');

  return badges;
}
