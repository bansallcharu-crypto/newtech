import React, { useMemo, useState } from 'react';
import { Search, PackageX } from 'lucide-react';
import { useData } from '../../context/DataContext';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { products, offers, discounts, publicLoading } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'Laptop' | 'Software'>('all');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.status === 'active');
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, search, category, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Products</h1>
        <p className="text-slate-500 mt-1">Laptops and educational software, in stock and ready to ship.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value as any)}>
          <option value="all">All Categories</option>
          <option value="Laptop">Laptops</option>
          <option value="Software">Software</option>
        </select>
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {publicLoading ? (
        <p className="text-slate-400 text-sm">Loading products…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <PackageX className="mx-auto mb-3" size={32} />
          No products match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} offers={offers} discounts={discounts} />)}
        </div>
      )}
    </div>
  );
}
