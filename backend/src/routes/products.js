const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function parseProduct(p) {
  return { ...p, specs: JSON.parse(p.specs || '[]'), featured: !!p.featured };
}

// Public: list products
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(rows.map(parseProduct));
});

// Public: single product
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found.' });
  res.json(parseProduct(row));
});

// Admin: create product
router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  const required = ['name', 'category', 'brand', 'sku', 'description', 'price', 'cost_price'];
  for (const field of required) {
    if (b[field] === undefined || b[field] === '') {
      return res.status(400).json({ error: `Field "${field}" is required.` });
    }
  }
  try {
    const stmt = db.prepare(`INSERT INTO products
      (name, category, brand, sku, description, specs, price, cost_price, stock_quantity, image_url, status, featured, updated_at)
      VALUES (@name, @category, @brand, @sku, @description, @specs, @price, @cost_price, @stock_quantity, @image_url, @status, @featured, datetime('now'))`);
    const info = stmt.run({
      name: b.name,
      category: b.category,
      brand: b.brand,
      sku: b.sku,
      description: b.description,
      specs: JSON.stringify(b.specs || []),
      price: Number(b.price),
      cost_price: Number(b.cost_price),
      stock_quantity: Number(b.stock_quantity || 0),
      image_url: b.image_url || '',
      status: b.status || 'active',
      featured: b.featured ? 1 : 0
    });
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(parseProduct(row));
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'A product with this SKU already exists.' });
    }
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// Admin: update product
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });
  const b = req.body || {};
  const merged = {
    name: b.name ?? existing.name,
    category: b.category ?? existing.category,
    brand: b.brand ?? existing.brand,
    sku: b.sku ?? existing.sku,
    description: b.description ?? existing.description,
    specs: JSON.stringify(b.specs ?? JSON.parse(existing.specs || '[]')),
    price: b.price !== undefined ? Number(b.price) : existing.price,
    cost_price: b.cost_price !== undefined ? Number(b.cost_price) : existing.cost_price,
    stock_quantity: b.stock_quantity !== undefined ? Number(b.stock_quantity) : existing.stock_quantity,
    image_url: b.image_url ?? existing.image_url,
    status: b.status ?? existing.status,
    featured: b.featured !== undefined ? (b.featured ? 1 : 0) : existing.featured,
    id: existing.id
  };
  try {
    db.prepare(`UPDATE products SET
      name=@name, category=@category, brand=@brand, sku=@sku, description=@description,
      specs=@specs, price=@price, cost_price=@cost_price, stock_quantity=@stock_quantity,
      image_url=@image_url, status=@status, featured=@featured, updated_at=datetime('now')
      WHERE id=@id`).run(merged);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(parseProduct(row));
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'A product with this SKU already exists.' });
    }
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// Admin: delete product
router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
