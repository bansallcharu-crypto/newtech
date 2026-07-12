# NexTech Computers — Business Website + Admin Dashboard

A production-ready full-stack application for a retail business selling laptops and educational software.
It includes a public storefront and a secure Owner Admin Dashboard, side-by-side in a 50:50 split-screen
layout so that every admin change is reflected instantly on the live customer site preview.

---

## 1. Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite + TypeScript + Tailwind CSS |
| Charts     | Chart.js via react-chartjs-2 |
| Backend    | Node.js + Express |
| Database   | SQLite (via `better-sqlite3`) |
| Auth       | JWT (JSON Web Tokens) + bcrypt password hashing |

---

## 2. Project Structure

```
nextech/
├── backend/
│   ├── package.json
│   ├── .env                       # environment variables (JWT secret, admin credentials, port)
│   ├── nextech.sqlite             # auto-created on first run
│   └── src/
│       ├── server.js              # Express app entry point
│       ├── db.js                  # SQLite schema + seed data (idempotent)
│       ├── middleware/
│       │   └── auth.js            # JWT auth middleware
│       └── routes/
│           ├── auth.js            # login, session check
│           ├── products.js        # product CRUD (public GET, admin write)
│           ├── offers.js          # promotional offers CRUD
│           ├── discounts.js       # bulk discount rules CRUD
│           ├── employees.js       # employee management (admin only)
│           ├── expenses.js        # expense tracking (admin only)
│           ├── deals.js           # deal management + inventory impact (admin only)
│           ├── enquiries.js       # public quote submission + admin management
│           └── analytics.js       # KPI & chart data aggregation (admin only)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts             # dev server + /api proxy to backend
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── main.tsx / App.tsx
        ├── layout/SplitScreen.tsx # 50:50 admin / live-site layout
        ├── context/
        │   ├── AuthContext.tsx    # admin session (JWT)
        │   └── DataContext.tsx    # single source of truth shared by both panels
        ├── api/client.ts          # axios instance with auth header + error helper
        ├── types/index.ts         # shared TypeScript types
        ├── utils/pricing.ts       # offer + bulk-discount price calculation (shared logic)
        ├── admin/                 # Owner Admin Dashboard (left panel)
        │   ├── AdminApp.tsx
        │   ├── components/ (Sidebar, KpiCard, Modal, StatusBadge)
        │   └── pages/ (Login, Dashboard, Products, Offers, Discounts, Employees, Expenses, Deals, Enquiries)
        └── customer/               # Public storefront (right panel / live preview)
            ├── CustomerApp.tsx
            ├── components/ (Navbar, Footer, ProductCard, EnquiryForm)
            └── pages/ (Home, Products, ProductDetails, Features, Offers, BulkDiscounts, About, Contact)
```

---

## 3. Prerequisites (macOS + VS Code)

- **Node.js 18+** and **npm 9+** — install from https://nodejs.org or via `brew install node`
- **VS Code** with the "ES7+ React/Redux/React-Native snippets" and "Tailwind CSS IntelliSense" extensions (optional but recommended)

Verify your setup:
```bash
node -v
npm -v
```

---

## 4. Setup Instructions

### Step 1 — Clone / unzip the project
Unzip the project and open the `nextech/` folder in VS Code.

### Step 2 — Install backend dependencies
```bash
cd nextech/backend
npm install
```

### Step 3 — Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Step 4 — Start the backend (Terminal 1)
```bash
cd nextech/backend
npm run dev
```
You should see:
```
Seeded admin user "owner"
Seeded 18 products
...
NexTech backend running on http://localhost:5000
```
The SQLite database file `nextech.sqlite` is created automatically in `backend/`, fully pre-populated
with sample products, employees, expenses, offers, bulk discounts, deals and enquiries. Re-running the
server will NOT duplicate data — seeding only happens on an empty database.

### Step 5 — Start the frontend (Terminal 2, new tab)
```bash
cd nextech/frontend
npm run dev
```
Open the URL Vite prints (typically **http://localhost:5173**) in your browser.

### Step 6 — Log in to the Admin Dashboard
On the left panel, sign in with the seeded owner credentials:
```
Username: owner
Password: NexTech@2026
```
(You can change these in `backend/.env` **before** the first run — the admin user is only seeded once.)

The right panel is the **live customer website preview**. Any product, price, inventory, offer, or
discount change you make on the left is saved to the database and instantly reflected on the right —
no page refresh needed — because both panels share one in-memory data store (`DataContext`) that is
kept in sync with the backend.

---

## 5. Default / Demo Credentials

| Field | Value |
|---|---|
| Admin username | `owner` |
| Admin password | `NexTech@2026` |

Change these any time in `backend/.env`:
```
ADMIN_USERNAME=owner
ADMIN_PASSWORD=NexTech@2026
JWT_SECRET=change_this_to_a_long_random_string_in_production
```
> If you change `ADMIN_USERNAME` / `ADMIN_PASSWORD` **after** the database already exists, delete
> `backend/nextech.sqlite` (and the `-wal`/`-shm` files) so the seeder can recreate the admin user with
> your new credentials.

---

## 6. Database Schema

| Table | Purpose |
|---|---|
| `users` | Single owner/admin account, bcrypt-hashed password |
| `products` | 18 seeded products (Laptops + Software), price, cost, stock, specs (JSON), status, featured flag |
| `offers` | Time-bound promotional discounts, site-wide or per-product |
| `bulk_discounts` | Tiered discount rules, minimum quantity ≥ 10, site-wide or per-product |
| `employees` | 5 seeded employees with role, salary, join date, status |
| `expenses` | Salary / Advertisement / Operational / Other expense records |
| `deals` | Customer deals: product, quantity, discount, computed total, status, inventory impact |
| `enquiries` | Public quote/enquiry submissions from the storefront |

All tables are created and seeded automatically by `backend/src/db.js` on first run — no manual SQL
required. Business logic highlights:

- **Bulk discount rule**: minimum order quantity of 10 units is enforced both client-side and
  server-side (`backend/src/routes/discounts.js`).
- **Inventory impact**: creating/updating a deal with status `Confirmed` or `Delivered` deducts stock;
  moving a deal to `Cancelled` (or deleting it) restores stock automatically
  (`backend/src/routes/deals.js`).
- **Dynamic pricing**: the storefront computes the live price for any product/quantity combination by
  applying the best active offer plus the best applicable bulk-discount tier
  (`frontend/src/utils/pricing.ts`), so admin changes to offers/discounts are reflected in real time.

---

## 7. API Reference (base URL `/api`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Owner login, returns JWT |
| GET | `/auth/me` | Admin | Verify current session |
| GET | `/products` | Public | List all products |
| GET | `/products/:id` | Public | Single product |
| POST/PUT/DELETE | `/products(/:id)` | Admin | Manage products |
| GET | `/offers` | Public | List offers |
| POST/PUT/DELETE | `/offers(/:id)` | Admin | Manage offers |
| GET | `/discounts` | Public | List bulk discount rules |
| POST/PUT/DELETE | `/discounts(/:id)` | Admin | Manage bulk discount rules |
| GET/POST/PUT/DELETE | `/employees(/:id)` | Admin | Manage employees |
| GET/POST/PUT/DELETE | `/expenses(/:id)` | Admin | Manage expenses |
| GET/POST/PUT/DELETE | `/deals(/:id)` | Admin | Manage deals (affects inventory) |
| POST | `/enquiries` | Public | Submit a quote/enquiry |
| GET/PUT/DELETE | `/enquiries(/:id)` | Admin | Manage enquiries |
| GET | `/analytics/summary` | Admin | Revenue, profit, expenses, inventory, low-stock KPIs |
| GET | `/analytics/monthly-revenue` | Admin | Monthly revenue trend |
| GET | `/analytics/category-breakdown` | Admin | Revenue by product category |
| GET | `/analytics/top-products` | Admin | Top 5 products by revenue |
| GET | `/analytics/expense-breakdown` | Admin | Expenses grouped by category |

All admin endpoints require an `Authorization: Bearer <token>` header, handled automatically by the
frontend's axios client.

---

## 8. Production Build

```bash
# Frontend production build
cd frontend
npm run build       # outputs static assets to frontend/dist
npm run preview     # preview the production build locally

# Backend — run as-is with a process manager (pm2, systemd, etc.) in production
cd backend
npm start
```
In production, serve `frontend/dist` from a static host or CDN, and point its API calls at your deployed
backend URL (update the `server.proxy` target in `vite.config.ts` for local development, or configure a
reverse proxy such as Nginx in production).

---

## 9. Notes on Budget & Business Requirements

- The seeded catalog contains **18 products** (10 laptops + 8 software titles), within the requested
  15–20 product range.
- **5 employees** are seeded with realistic monthly salaries, feeding directly into the Expenses and
  Analytics modules.
- **Bulk discount** rules enforce a minimum order quantity of **10 units**, configurable per-product or
  store-wide, satisfying the dynamic/bulk pricing requirement.
- The Admin Dashboard's **Deals** module lets the owner record the ₹1,00,000 client payment (or any
  deal value) against a specific product/quantity, automatically adjusting inventory and feeding the
  Revenue/Profit KPIs — supporting budget and payment tracking for the ₹20,00,000 business budget.

---

## 10. Troubleshooting

- **"Cannot find module" errors on `npm install`**: ensure you're using Node 18+ (`node -v`).
- **Port already in use**: change `PORT` in `backend/.env`, and update the proxy target in
  `frontend/vite.config.ts` to match.
- **Login fails with correct credentials**: delete `backend/nextech.sqlite*` files and restart the
  backend to reseed the admin user from `.env`.
- **Blank product images**: seeded products use public Unsplash URLs; replace `image_url` values via the
  Admin → Products screen if you need offline/local images.

---

Built as a complete, modular reference implementation — every file is real, runnable code with no
placeholders or TODOs.
