const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const b = req.body || {};
  if (!b.category || !b.description || b.amount === undefined || !b.expense_date) {
    return res.status(400).json({ error: 'category, description, amount and expense_date are required.' });
  }
  const info = db.prepare(`INSERT INTO expenses (category, description, amount, expense_date)
    VALUES (@category, @description, @amount, @expense_date)`).run({
    category: b.category, description: b.description, amount: Number(b.amount), expense_date: b.expense_date
  });
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Expense not found.' });
  const b = req.body || {};
  const merged = {
    category: b.category ?? existing.category,
    description: b.description ?? existing.description,
    amount: b.amount !== undefined ? Number(b.amount) : existing.amount,
    expense_date: b.expense_date ?? existing.expense_date,
    id: existing.id
  };
  db.prepare('UPDATE expenses SET category=@category, description=@description, amount=@amount, expense_date=@expense_date WHERE id=@id').run(merged);
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Expense not found.' });
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
