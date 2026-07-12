require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

require('./db'); // initializes and seeds the database on startup

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const offerRoutes = require('./routes/offers');
const discountRoutes = require('./routes/discounts');
const employeeRoutes = require('./routes/employees');
const expenseRoutes = require('./routes/expenses');
const dealRoutes = require('./routes/deals');
const enquiryRoutes = require('./routes/enquiries');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NexTech backend running on http://localhost:${PORT}`);
});
