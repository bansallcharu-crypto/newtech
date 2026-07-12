const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT o.*, p.name AS product_name FROM offers o
    LEFT JOIN products p ON p.id = o.product_id
    ORDER BY o.created_at DESC
  `).all();
  res.json(rows.map((r) => ({ ...r, active: !!r.active })));
});

router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.discount_percent || !b.start_date || !b.end_date) {
    return res.status(400).json({ error: 'Title, discount_percent, start_date and end_date are required.' });
  }
  const info = db.prepare(`INSERT INTO offers (title, description, discount_percent, product_id, scope, start_date, end_date, active)
    VALUES (@title, @description, @discount_percent, @product_id, @scope, @start_date, @end_date, @active)`).run({
    title: b.title,
    description: b.description || '',
    discount_percent: Number(b.discount_percent),
    product_id: b.scope === 'all' ? null : (b.product_id || null),
    scope: b.scope || 'product',
    start_date: b.start_date,
    end_date: b.end_date,
    active: b.active === false ? 0 : 1
  });
  const row = db.prepare('SELECT * FROM offers WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...row, active: !!row.active });
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Offer not found.' });
  const b = req.body || {};
  const merged = {
    title: b.title ?? existing.title,
    description: b.description ?? existing.description,
    discount_percent: b.discount_percent !== undefined ? Number(b.discount_percent) : existing.discount_percent,
    scope: b.scope ?? existing.scope,
    product_id: (b.scope ?? existing.scope) === 'all' ? null : (b.product_id ?? existing.product_id),
    start_date: b.start_date ?? existing.start_date,
    end_date: b.end_date ?? existing.end_date,
    active: b.active !== undefined ? (b.active ? 1 : 0) : existing.active,
    id: existing.id
  };
  db.prepare(`UPDATE offers SET title=@title, description=@description, discount_percent=@discount_percent,
    product_id=@product_id, scope=@scope, start_date=@start_date, end_date=@end_date, active=@active WHERE id=@id`).run(merged);
  const row = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  res.json({ ...row, active: !!row.active });
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Offer not found.' });
  db.prepare('DELETE FROM offers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
