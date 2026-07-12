const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', (req, res) => {
  const revenueRow = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) AS revenue
    FROM deals WHERE status IN ('Confirmed', 'Delivered')
  `).get();

  const cogsRow = db.prepare(`
    SELECT COALESCE(SUM(d.quantity * p.cost_price), 0) AS cogs
    FROM deals d JOIN products p ON p.id = d.product_id
    WHERE d.status IN ('Confirmed', 'Delivered')
  `).get();

  const expensesRow = db.prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses`).get();

  const inventoryValueRow = db.prepare(`
    SELECT COALESCE(SUM(stock_quantity * price), 0) AS retail_value,
           COALESCE(SUM(stock_quantity * cost_price), 0) AS cost_value,
           COALESCE(SUM(stock_quantity), 0) AS total_units
    FROM products
  `).get();

  const dealsByStatus = db.prepare(`SELECT status, COUNT(*) AS count FROM deals GROUP BY status`).all();
  const lowStock = db.prepare(`SELECT COUNT(*) AS count FROM products WHERE stock_quantity <= 10 AND status = 'active'`).get();
  const totalProducts = db.prepare(`SELECT COUNT(*) AS count FROM products`).get();
  const activeEmployees = db.prepare(`SELECT COUNT(*) AS count FROM employees WHERE status = 'active'`).get();
  const openEnquiries = db.prepare(`SELECT COUNT(*) AS count FROM enquiries WHERE status != 'Closed'`).get();

  const revenue = revenueRow.revenue;
  const cogs = cogsRow.cogs;
  const totalExpenses = expensesRow.total;
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - totalExpenses;

  res.json({
    revenue,
    cogs,
    grossProfit,
    totalExpenses,
    netProfit,
    inventory: {
      retailValue: inventoryValueRow.retail_value,
      costValue: inventoryValueRow.cost_value,
      totalUnits: inventoryValueRow.total_units
    },
    dealsByStatus,
    lowStockCount: lowStock.count,
    totalProducts: totalProducts.count,
    activeEmployees: activeEmployees.count,
    openEnquiries: openEnquiries.count
  });
});

router.get('/monthly-revenue', (req, res) => {
  const rows = db.prepare(`
    SELECT strftime('%Y-%m', created_at) AS month,
           COALESCE(SUM(total_amount), 0) AS revenue,
           COUNT(*) AS deal_count
    FROM deals
    WHERE status IN ('Confirmed', 'Delivered')
    GROUP BY month
    ORDER BY month ASC
  `).all();
  res.json(rows);
});

router.get('/category-breakdown', (req, res) => {
  const rows = db.prepare(`
    SELECT p.category AS category, COALESCE(SUM(d.total_amount), 0) AS revenue, COUNT(d.id) AS deal_count
    FROM deals d JOIN products p ON p.id = d.product_id
    WHERE d.status IN ('Confirmed', 'Delivered')
    GROUP BY p.category
  `).all();
  res.json(rows);
});

router.get('/top-products', (req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.category, COALESCE(SUM(d.quantity), 0) AS units_sold, COALESCE(SUM(d.total_amount), 0) AS revenue
    FROM deals d JOIN products p ON p.id = d.product_id
    WHERE d.status IN ('Confirmed', 'Delivered')
    GROUP BY p.id
    ORDER BY revenue DESC
    LIMIT 5
  `).all();
  res.json(rows);
});

router.get('/expense-breakdown', (req, res) => {
  const rows = db.prepare(`SELECT category, COALESCE(SUM(amount), 0) AS total FROM expenses GROUP BY category`).all();
  res.json(rows);
});

module.exports = router;
