const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const STOCK_AFFECTING_STATUSES = ['Confirmed', 'Delivered'];

function computeTotal(quantity, unitPrice, discountPercent) {
  const total = quantity * unitPrice * (1 - discountPercent / 100);
  return Math.round(total * 100) / 100;
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT d.*, p.name AS product_name, p.sku AS product_sku FROM deals d
    LEFT JOIN products p ON p.id = d.product_id
    ORDER BY d.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const b = req.body || {};
  const required = ['customer_name', 'customer_email', 'customer_phone', 'product_id', 'quantity', 'unit_price'];
  for (const field of required) {
    if (b[field] === undefined || b[field] === '') {
      return res.status(400).json({ error: `Field "${field}" is required.` });
    }
  }
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(b.product_id);
  if (!product) return res.status(404).json({ error: 'Selected product does not exist.' });

  const quantity = Number(b.quantity);
  const unitPrice = Number(b.unit_price);
  const discountPercent = Number(b.discount_percent || 0);
  const status = b.status || 'Pending';
  const willImpactInventory = STOCK_AFFECTING_STATUSES.includes(status);

  if (willImpactInventory && product.stock_quantity < quantity) {
    return res.status(400).json({ error: `Insufficient stock. Only ${product.stock_quantity} units available.` });
  }

  const totalAmount = computeTotal(quantity, unitPrice, discountPercent);
  const inventoryImpact = willImpactInventory ? quantity : 0;

  const run = db.transaction(() => {
    const info = db.prepare(`INSERT INTO deals
      (customer_name, customer_email, customer_phone, product_id, quantity, unit_price, discount_percent, total_amount, status, inventory_impact, notes)
      VALUES (@customer_name, @customer_email, @customer_phone, @product_id, @quantity, @unit_price, @discount_percent, @total_amount, @status, @inventory_impact, @notes)`)
      .run({
        customer_name: b.customer_name,
        customer_email: b.customer_email,
        customer_phone: b.customer_phone,
        product_id: b.product_id,
        quantity, unit_price: unitPrice, discount_percent: discountPercent,
        total_amount: totalAmount, status, inventory_impact: inventoryImpact,
        notes: b.notes || ''
      });
    if (inventoryImpact > 0) {
      db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(inventoryImpact, b.product_id);
    }
    return info.lastInsertRowid;
  });

  const id = run();
  const row = db.prepare(`SELECT d.*, p.name AS product_name FROM deals d LEFT JOIN products p ON p.id = d.product_id WHERE d.id = ?`).get(id);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Deal not found.' });
  const b = req.body || {};

  const productId = b.product_id ?? existing.product_id;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Selected product does not exist.' });

  const quantity = b.quantity !== undefined ? Number(b.quantity) : existing.quantity;
  const unitPrice = b.unit_price !== undefined ? Number(b.unit_price) : existing.unit_price;
  const discountPercent = b.discount_percent !== undefined ? Number(b.discount_percent) : existing.discount_percent;
  const newStatus = b.status ?? existing.status;
  const newWillImpact = STOCK_AFFECTING_STATUSES.includes(newStatus);
  const oldImpact = existing.inventory_impact;
  const newImpact = newWillImpact ? quantity : 0;
  const stockDelta = oldImpact - newImpact; // positive = return stock, negative = consume more stock

  if (stockDelta < 0 && product.stock_quantity < Math.abs(stockDelta)) {
    return res.status(400).json({ error: `Insufficient stock. Only ${product.stock_quantity} units available.` });
  }

  const totalAmount = computeTotal(quantity, unitPrice, discountPercent);

  const run = db.transaction(() => {
    db.prepare(`UPDATE deals SET customer_name=@customer_name, customer_email=@customer_email, customer_phone=@customer_phone,
      product_id=@product_id, quantity=@quantity, unit_price=@unit_price, discount_percent=@discount_percent,
      total_amount=@total_amount, status=@status, inventory_impact=@inventory_impact, notes=@notes WHERE id=@id`).run({
      customer_name: b.customer_name ?? existing.customer_name,
      customer_email: b.customer_email ?? existing.customer_email,
      customer_phone: b.customer_phone ?? existing.customer_phone,
      product_id: productId, quantity, unit_price: unitPrice, discount_percent: discountPercent,
      total_amount: totalAmount, status: newStatus, inventory_impact: newImpact,
      notes: b.notes ?? existing.notes, id: existing.id
    });
    if (stockDelta !== 0) {
      db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?').run(stockDelta, productId);
    }
  });
  run();

  const row = db.prepare(`SELECT d.*, p.name AS product_name FROM deals d LEFT JOIN products p ON p.id = d.product_id WHERE d.id = ?`).get(req.params.id);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Deal not found.' });
  const run = db.transaction(() => {
    if (existing.inventory_impact > 0) {
      db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?').run(existing.inventory_impact, existing.product_id);
    }
    db.prepare('DELETE FROM deals WHERE id = ?').run(existing.id);
  });
  run();
  res.json({ success: true });
});

module.exports = router;
