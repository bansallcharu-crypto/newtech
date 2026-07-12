const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'nextech.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('Laptop','Software')),
      brand TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      specs TEXT NOT NULL DEFAULT '[]',
      price REAL NOT NULL,
      cost_price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      discount_percent REAL NOT NULL,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      scope TEXT NOT NULL DEFAULT 'product' CHECK (scope IN ('product','all')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bulk_discounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      scope TEXT NOT NULL DEFAULT 'product' CHECK (scope IN ('product','all')),
      min_quantity INTEGER NOT NULL DEFAULT 10,
      discount_percent REAL NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      salary REAL NOT NULL,
      join_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL CHECK (category IN ('Salary','Advertisement','Operational','Other')),
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      expense_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount_percent REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Confirmed','Delivered','Cancelled')),
      inventory_impact INTEGER NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      quantity INTEGER DEFAULT 1,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Closed')),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'owner';
    const password = process.env.ADMIN_PASSWORD || 'NexTech@2026';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, 'owner');
    console.log(`Seeded admin user "${username}"`);
  }

  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (productCount === 0) {
    const insert = db.prepare(`INSERT INTO products
      (name, category, brand, sku, description, specs, price, cost_price, stock_quantity, image_url, status, featured)
      VALUES (@name, @category, @brand, @sku, @description, @specs, @price, @cost_price, @stock_quantity, @image_url, @status, @featured)`);

    const products = [
      { name: 'NexBook Air 14', category: 'Laptop', brand: 'NexTech', sku: 'NB-AIR-14', description: 'Ultra-thin 14" laptop for everyday productivity and study, featuring an anti-glare display and all-day battery life.', specs: JSON.stringify(['14" FHD IPS Display','Intel Core i5-1335U','16GB LPDDR5 RAM','512GB NVMe SSD','1.2kg, 18hr battery']), price: 52999, cost_price: 41000, stock_quantity: 24, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', status: 'active', featured: 1 },
      { name: 'NexBook Pro 15', category: 'Laptop', brand: 'NexTech', sku: 'NB-PRO-15', description: 'High-performance 15.6" laptop built for creators and engineers, with discrete graphics and a fast display.', specs: JSON.stringify(['15.6" QHD 165Hz Display','Intel Core i7-13700H','32GB DDR5 RAM','1TB NVMe SSD','RTX 4060 6GB']), price: 98999, cost_price: 79000, stock_quantity: 15, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', status: 'active', featured: 1 },
      { name: 'NexBook Edu 11', category: 'Laptop', brand: 'NexTech', sku: 'NB-EDU-11', description: 'Compact, rugged 11.6" laptop designed for classrooms and student use with a reinforced hinge and spill-resistant keyboard.', specs: JSON.stringify(['11.6" HD Touch Display','Intel Celeron N4500','8GB RAM','256GB eMMC','Rugged chassis, 12hr battery']), price: 24999, cost_price: 19500, stock_quantity: 60, image_url: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800', status: 'active', featured: 1 },
      { name: 'NexBook Ultra X1', category: 'Laptop', brand: 'NexTech', sku: 'NB-ULT-X1', description: 'Flagship business ultrabook with a carbon-fiber chassis, MIL-STD durability, and a stunning OLED panel.', specs: JSON.stringify(['13.5" 3K OLED Display','Intel Core i7-1360P','32GB RAM','1TB SSD','Carbon fiber, 1.05kg']), price: 129999, cost_price: 104000, stock_quantity: 8, image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', status: 'active', featured: 0 },
      { name: 'NexBook Creator 16', category: 'Laptop', brand: 'NexTech', sku: 'NB-CRT-16', description: 'Studio-grade 16" laptop for video editing and 3D design with a color-accurate display and powerful GPU.', specs: JSON.stringify(['16" 4K Mini-LED Display','Intel Core i9-13900H','64GB RAM','2TB SSD','RTX 4080 12GB']), price: 214999, cost_price: 178000, stock_quantity: 5, image_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', status: 'active', featured: 0 },
      { name: 'NexBook Slim 13', category: 'Laptop', brand: 'NexTech', sku: 'NB-SLM-13', description: 'Everyday 13.3" laptop with a fanless design, silent operation, and lightweight magnesium body.', specs: JSON.stringify(['13.3" FHD Display','Intel Core i5-1240P','8GB RAM','512GB SSD','Fanless, 1.1kg']), price: 45999, cost_price: 36500, stock_quantity: 30, image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', status: 'active', featured: 0 },
      { name: 'NexBook Gamer G5', category: 'Laptop', brand: 'NexTech', sku: 'NB-GMR-G5', description: 'A 15.6" gaming and workstation hybrid with a high refresh rate display and advanced cooling.', specs: JSON.stringify(['15.6" FHD 240Hz Display','AMD Ryzen 9 7940HS','32GB RAM','1TB SSD','RTX 4070 8GB']), price: 134999, cost_price: 111000, stock_quantity: 10, image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', status: 'active', featured: 0 },
      { name: 'NexBook Value 14C', category: 'Laptop', brand: 'NexTech', sku: 'NB-VAL-14C', description: 'Budget-friendly 14" laptop ideal for basic office work, browsing, and online classes.', specs: JSON.stringify(['14" HD Display','Intel Celeron N5100','8GB RAM','256GB SSD','10hr battery']), price: 21999, cost_price: 17000, stock_quantity: 45, image_url: 'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800', status: 'active', featured: 0 },
      { name: 'NexBook 2-in-1 Flex', category: 'Laptop', brand: 'NexTech', sku: 'NB-FLX-2N1', description: 'Convertible touchscreen laptop that folds into a tablet, with stylus support for note-taking.', specs: JSON.stringify(['13.3" FHD Touch Display','Intel Core i5-1335U','16GB RAM','512GB SSD','360° hinge, stylus included']), price: 67999, cost_price: 54000, stock_quantity: 18, image_url: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800', status: 'active', featured: 0 },
      { name: 'NexBook Workstation W7', category: 'Laptop', brand: 'NexTech', sku: 'NB-WKS-W7', description: 'Certified mobile workstation for CAD, simulation and engineering workloads with ECC memory support.', specs: JSON.stringify(['17" 4K Display','Intel Core i9-13950HX','64GB ECC RAM','2TB SSD','NVIDIA RTX 4000 Ada']), price: 289999, cost_price: 241000, stock_quantity: 4, image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', status: 'active', featured: 0 },
      { name: 'CodeCraft IDE Suite', category: 'Software', brand: 'NexSoft', sku: 'SW-CODE-IDE', description: 'Professional multi-language IDE suite with debugging, refactoring tools and Git integration for schools and coding bootcamps.', specs: JSON.stringify(['1-year license','Supports Python, Java, C++, JS','Cloud sync','Classroom mode']), price: 4999, cost_price: 1800, stock_quantity: 500, image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', status: 'active', featured: 1 },
      { name: 'MathMentor Pro', category: 'Software', brand: 'NexSoft', sku: 'SW-MATH-PRO', description: 'Interactive mathematics learning software covering algebra through calculus with adaptive practice sets.', specs: JSON.stringify(['1-year license','Grades 6-12','Adaptive quizzes','Progress dashboard for teachers']), price: 2999, cost_price: 1000, stock_quantity: 500, image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800', status: 'active', featured: 1 },
      { name: 'SciLab Virtual Experiments', category: 'Software', brand: 'NexSoft', sku: 'SW-SCI-VLAB', description: 'Virtual science laboratory simulating physics, chemistry and biology experiments safely on any laptop.', specs: JSON.stringify(['1-year license','120+ simulated experiments','3D lab visualizations','Offline mode']), price: 5999, cost_price: 2200, stock_quantity: 300, image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', status: 'active', featured: 0 },
      { name: 'OfficeSuite Campus', category: 'Software', brand: 'NexSoft', sku: 'SW-OFC-CAMP', description: 'Full productivity suite with word processing, spreadsheets and presentations, licensed for institutions.', specs: JSON.stringify(['1-year campus license','Docs, Sheets, Slides','Cloud collaboration','Up to 500 seats']), price: 3499, cost_price: 1200, stock_quantity: 500, image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', status: 'active', featured: 0 },
      { name: 'LinguaLearn Language Pack', category: 'Software', brand: 'NexSoft', sku: 'SW-LNG-PACK', description: 'Language learning software with speech recognition, covering 12 languages for schools and self-learners.', specs: JSON.stringify(['1-year license','12 languages','Speech recognition','Gamified lessons']), price: 3999, cost_price: 1500, stock_quantity: 400, image_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800', status: 'active', featured: 0 },
      { name: 'CyberSafe Endpoint Shield', category: 'Software', brand: 'NexSoft', sku: 'SW-CYB-SHLD', description: 'Endpoint security and content-filtering software for school and office laptop fleets.', specs: JSON.stringify(['1-year license','Real-time threat protection','Web content filtering','Central admin console']), price: 2499, cost_price: 900, stock_quantity: 600, image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', status: 'active', featured: 0 },
      { name: 'DesignPro Creative Studio', category: 'Software', brand: 'NexSoft', sku: 'SW-DSG-STDO', description: 'Design and multimedia editing suite for graphic design, video editing and animation courses.', specs: JSON.stringify(['1-year license','Vector & raster editing','Video timeline editor','Asset library']), price: 6999, cost_price: 2800, stock_quantity: 250, image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800', status: 'active', featured: 0 },
      { name: 'DataSense Analytics Lab', category: 'Software', brand: 'NexSoft', sku: 'SW-DATA-LAB', description: 'Data science and analytics learning environment with notebooks, datasets and visualization tools for college labs.', specs: JSON.stringify(['1-year license','Jupyter-style notebooks','50+ sample datasets','Built-in charting']), price: 5499, cost_price: 2000, stock_quantity: 300, image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', status: 'active', featured: 0 }
    ];
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(products);
    console.log(`Seeded ${products.length} products`);
  }

  const employeeCount = db.prepare('SELECT COUNT(*) AS c FROM employees').get().c;
  if (employeeCount === 0) {
    const insert = db.prepare(`INSERT INTO employees (name, role, email, phone, salary, join_date, status)
      VALUES (@name, @role, @email, @phone, @salary, @join_date, @status)`);
    const employees = [
      { name: 'Ananya Sharma', role: 'Sales Manager', email: 'ananya.sharma@nextech.in', phone: '9876500001', salary: 55000, join_date: '2023-01-15', status: 'active' },
      { name: 'Rohan Mehta', role: 'Inventory Executive', email: 'rohan.mehta@nextech.in', phone: '9876500002', salary: 32000, join_date: '2023-03-10', status: 'active' },
      { name: 'Priya Nair', role: 'Customer Support Lead', email: 'priya.nair@nextech.in', phone: '9876500003', salary: 38000, join_date: '2022-11-05', status: 'active' },
      { name: 'Karan Verma', role: 'Marketing Executive', email: 'karan.verma@nextech.in', phone: '9876500004', salary: 34000, join_date: '2024-02-20', status: 'active' },
      { name: 'Sneha Iyer', role: 'Accounts Executive', email: 'sneha.iyer@nextech.in', phone: '9876500005', salary: 36000, join_date: '2023-07-01', status: 'active' }
    ];
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(employees);
    console.log(`Seeded ${employees.length} employees`);
  }

  const expenseCount = db.prepare('SELECT COUNT(*) AS c FROM expenses').get().c;
  if (expenseCount === 0) {
    const insert = db.prepare(`INSERT INTO expenses (category, description, amount, expense_date)
      VALUES (@category, @description, @amount, @expense_date)`);
    const expenses = [
      { category: 'Salary', description: 'Monthly salaries - June', amount: 195000, expense_date: '2026-06-30' },
      { category: 'Advertisement', description: 'Instagram & Google Ads campaign', amount: 45000, expense_date: '2026-06-15' },
      { category: 'Operational', description: 'Showroom rent - June', amount: 60000, expense_date: '2026-06-01' },
      { category: 'Operational', description: 'Electricity & internet bills', amount: 12000, expense_date: '2026-06-05' },
      { category: 'Advertisement', description: 'Local newspaper ad', amount: 15000, expense_date: '2026-06-20' },
      { category: 'Salary', description: 'Monthly salaries - May', amount: 195000, expense_date: '2026-05-31' },
      { category: 'Operational', description: 'Logistics & packaging', amount: 22000, expense_date: '2026-05-18' },
      { category: 'Other', description: 'Software subscription renewals', amount: 18000, expense_date: '2026-05-10' }
    ];
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(expenses);
    console.log(`Seeded ${expenses.length} expenses`);
  }

  const offerCount = db.prepare('SELECT COUNT(*) AS c FROM offers').get().c;
  if (offerCount === 0) {
    const insert = db.prepare(`INSERT INTO offers (title, description, discount_percent, product_id, scope, start_date, end_date, active)
      VALUES (@title, @description, @discount_percent, @product_id, @scope, @start_date, @end_date, @active)`);
    const offers = [
      { title: 'Monsoon Laptop Sale', description: 'Flat discount on all laptops for the monsoon season.', discount_percent: 8, product_id: null, scope: 'all', start_date: '2026-07-01', end_date: '2026-08-31', active: 1 },
      { title: 'Back to School - NexBook Edu 11', description: 'Special back-to-school pricing on the NexBook Edu 11.', discount_percent: 12, product_id: 3, scope: 'product', start_date: '2026-07-01', end_date: '2026-09-15', active: 1 },
      { title: 'Creator Bundle Offer', description: 'Discount on the NexBook Creator 16 for design studios.', discount_percent: 6, product_id: 5, scope: 'product', start_date: '2026-06-01', end_date: '2026-07-31', active: 1 },
      { title: 'Campus Software Bundle', description: 'Discount on OfficeSuite Campus for institutional buyers.', discount_percent: 15, product_id: 14, scope: 'product', start_date: '2026-06-15', end_date: '2026-12-31', active: 1 }
    ];
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(offers);
    console.log(`Seeded ${offers.length} offers`);
  }

  const discountCount = db.prepare('SELECT COUNT(*) AS c FROM bulk_discounts').get().c;
  if (discountCount === 0) {
    const insert = db.prepare(`INSERT INTO bulk_discounts (product_id, scope, min_quantity, discount_percent, active)
      VALUES (@product_id, @scope, @min_quantity, @discount_percent, @active)`);
    const discounts = [
      { product_id: null, scope: 'all', min_quantity: 10, discount_percent: 5, active: 1 },
      { product_id: null, scope: 'all', min_quantity: 25, discount_percent: 8, active: 1 },
      { product_id: null, scope: 'all', min_quantity: 50, discount_percent: 12, active: 1 },
      { product_id: 3, scope: 'product', min_quantity: 10, discount_percent: 10, active: 1 },
      { product_id: 11, scope: 'product', min_quantity: 10, discount_percent: 15, active: 1 },
      { product_id: 14, scope: 'product', min_quantity: 10, discount_percent: 18, active: 1 }
    ];
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(discounts);
    console.log(`Seeded ${discounts.length} bulk discount rules`);
  }

  const dealCount = db.prepare('SELECT COUNT(*) AS c FROM deals').get().c;
  if (dealCount === 0) {
    const insert = db.prepare(`INSERT INTO deals
      (customer_name, customer_email, customer_phone, product_id, quantity, unit_price, discount_percent, total_amount, status, inventory_impact, notes, created_at)
      VALUES (@customer_name, @customer_email, @customer_phone, @product_id, @quantity, @unit_price, @discount_percent, @total_amount, @status, @inventory_impact, @notes, @created_at)`);
    const deals = [
      { customer_name: 'Greenfield Public School', customer_email: 'admin@greenfieldschool.edu', customer_phone: '9812345670', product_id: 3, quantity: 30, unit_price: 24999, discount_percent: 10, total_amount: 674973, status: 'Delivered', inventory_impact: 30, notes: 'Bulk order for computer lab', created_at: '2026-05-12 10:30:00' },
      { customer_name: 'Rajesh Kumar', customer_email: 'rajesh.kumar@gmail.com', customer_phone: '9812345671', product_id: 1, quantity: 1, unit_price: 52999, discount_percent: 0, total_amount: 52999, status: 'Delivered', inventory_impact: 1, notes: '', created_at: '2026-05-20 14:00:00' },
      { customer_name: 'Bright Minds Coaching Institute', customer_email: 'contact@brightminds.in', customer_phone: '9812345672', product_id: 12, quantity: 100, unit_price: 2999, discount_percent: 5, total_amount: 284905, status: 'Delivered', inventory_impact: 100, notes: 'Annual license renewal', created_at: '2026-06-02 11:15:00' },
      { customer_name: 'Studio Pixel Works', customer_email: 'hello@studiopixel.com', customer_phone: '9812345673', product_id: 5, quantity: 2, unit_price: 214999, discount_percent: 6, total_amount: 404198, status: 'Confirmed', inventory_impact: 2, notes: 'Editing workstation upgrade', created_at: '2026-06-18 16:45:00' },
      { customer_name: 'Anita Desai', customer_email: 'anita.desai@gmail.com', customer_phone: '9812345674', product_id: 9, quantity: 1, unit_price: 67999, discount_percent: 0, total_amount: 67999, status: 'Pending', inventory_impact: 0, notes: 'Awaiting payment confirmation', created_at: '2026-07-01 09:20:00' },
      { customer_name: 'TechEd Coding Academy', customer_email: 'admin@techedacademy.in', customer_phone: '9812345675', product_id: 11, quantity: 40, unit_price: 4999, discount_percent: 15, total_amount: 169966, status: 'Confirmed', inventory_impact: 40, notes: 'Coding bootcamp licenses', created_at: '2026-07-03 13:10:00' }
    ];
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(deals);
    console.log(`Seeded ${deals.length} deals`);
  }

  const enquiryCount = db.prepare('SELECT COUNT(*) AS c FROM enquiries').get().c;
  if (enquiryCount === 0) {
    const insert = db.prepare(`INSERT INTO enquiries (name, email, phone, product_id, quantity, message, status, created_at)
      VALUES (@name, @email, @phone, @product_id, @quantity, @message, @status, @created_at)`);
    const enquiries = [
      { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '9900011122', product_id: 2, quantity: 2, message: 'Interested in NexBook Pro 15 for my design agency, please share EMI options.', status: 'New', created_at: '2026-07-05 10:00:00' },
      { name: 'St. Xavier College', email: 'procurement@stxaviercollege.edu', phone: '9900011123', product_id: 14, quantity: 200, message: 'Need a quote for campus-wide OfficeSuite licensing.', status: 'Contacted', created_at: '2026-07-04 15:30:00' },
      { name: 'Meera Pillai', email: 'meera.pillai@gmail.com', phone: '9900011124', product_id: 6, quantity: 1, message: 'Is the NexBook Slim 13 available in silver?', status: 'Closed', created_at: '2026-07-02 09:15:00' }
    ];
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(enquiries);
    console.log(`Seeded ${enquiries.length} enquiries`);
  }
}

migrate();
seed();

module.exports = db;
