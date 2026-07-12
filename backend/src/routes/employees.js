const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY join_date ASC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const b = req.body || {};
  const required = ['name', 'role', 'email', 'phone', 'salary', 'join_date'];
  for (const field of required) {
    if (!b[field]) return res.status(400).json({ error: `Field "${field}" is required.` });
  }
  const info = db.prepare(`INSERT INTO employees (name, role, email, phone, salary, join_date, status)
    VALUES (@name, @role, @email, @phone, @salary, @join_date, @status)`).run({
    name: b.name, role: b.role, email: b.email, phone: b.phone,
    salary: Number(b.salary), join_date: b.join_date, status: b.status || 'active'
  });
  const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Employee not found.' });
  const b = req.body || {};
  const merged = {
    name: b.name ?? existing.name,
    role: b.role ?? existing.role,
    email: b.email ?? existing.email,
    phone: b.phone ?? existing.phone,
    salary: b.salary !== undefined ? Number(b.salary) : existing.salary,
    join_date: b.join_date ?? existing.join_date,
    status: b.status ?? existing.status,
    id: existing.id
  };
  db.prepare(`UPDATE employees SET name=@name, role=@role, email=@email, phone=@phone,
    salary=@salary, join_date=@join_date, status=@status WHERE id=@id`).run(merged);
  const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Employee not found.' });
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
