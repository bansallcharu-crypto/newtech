const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT d.*, p.name AS product_name FROM bulk_discounts d
    LEFT JOIN products p ON p.id = d.product_id
    ORDER BY d.min_quantity ASC
  `).all();
  res.json(rows.map((r) => ({ ...r, active: !!r.active })));
});

router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  if (!b.min_quantity || !b.discount_percent) {
    return res.status(400).json({ error: 'min_quantity and discount_percent are required.' });
  }
  if (Number(b.min_quantity) < 10) {
    return res.status(400).json({ error: 'Bulk discount minimum quantity must be at least 10.' });
  }
  const info = db.prepare(`INSERT INTO bulk_discounts (product_id, scope, min_quantity, discount_percent, active)
    VALUES (@product_id, @scope, @min_quantity, @discount_percent, @active)`).run({
    product_id: b.scope === 'all' ? null : (b.product_id || null),
    scope: b.scope || 'product',
    min_quantity: Number(b.min_quantity),
    discount_percent: Number(b.discount_percent),
    active: b.active === false ? 0 : 1
  });
  const row = db.prepare('SELECT * FROM bulk_discounts WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...row, active: !!row.active });
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM bulk_discounts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Bulk discount rule not found.' });
  const b = req.body || {};
  if (b.min_quantity !== undefined && Number(b.min_quantity) < 10) {
    return res.status(400).json({ error: 'Bulk discount minimum quantity must be at least 10.' });
  }
  const merged = {
    scope: b.scope ?? existing.scope,
    product_id: (b.scope ?? existing.scope) === 'all' ? null : (b.product_id ?? existing.product_id),
    min_quantity: b.min_quantity !== undefined ? Number(b.min_quantity) : existing.min_quantity,
    discount_percent: b.discount_percent !== undefined ? Number(b.discount_percent) : existing.discount_percent,
    active: b.active !== undefined ? (b.active ? 1 : 0) : existing.active,
    id: existing.id
  };
  db.prepare(`UPDATE bulk_discounts SET product_id=@product_id, scope=@scope, min_quantity=@min_quantity,
    discount_percent=@discount_percent, active=@active WHERE id=@id`).run(merged);
  const row = db.prepare('SELECT * FROM bulk_discounts WHERE id = ?').get(req.params.id);
  res.json({ ...row, active: !!row.active });
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM bulk_discounts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Bulk discount rule not found.' });
  db.prepare('DELETE FROM bulk_discounts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
