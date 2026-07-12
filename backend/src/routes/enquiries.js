const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: customer submits an enquiry/quote request
router.post('/', (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.email || !b.phone) {
    return res.status(400).json({ error: 'Name, email and phone are required.' });
  }
  const info = db.prepare(`INSERT INTO enquiries (name, email, phone, product_id, quantity, message, status)
    VALUES (@name, @email, @phone, @product_id, @quantity, @message, 'New')`).run({
    name: b.name, email: b.email, phone: b.phone,
    product_id: b.product_id || null, quantity: b.quantity || 1, message: b.message || ''
  });
  const row = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

// Admin: list all enquiries
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, p.name AS product_name FROM enquiries e
    LEFT JOIN products p ON p.id = e.product_id
    ORDER BY e.created_at DESC
  `).all();
  res.json(rows);
});

// Admin: update enquiry status
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Enquiry not found.' });
  const b = req.body || {};
  db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(b.status ?? existing.status, existing.id);
  const row = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Enquiry not found.' });
  db.prepare('DELETE FROM enquiries WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
