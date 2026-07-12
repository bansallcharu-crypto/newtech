export type Category = 'Laptop' | 'Software';
export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: number;
  name: string;
  category: Category;
  brand: string;
  sku: string;
  description: string;
  specs: string[];
  price: number;
  cost_price: number;
  stock_quantity: number;
  image_url: string;
  status: ProductStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export type OfferScope = 'product' | 'all';

export interface Offer {
  id: number;
  title: string;
  description: string;
  discount_percent: number;
  product_id: number | null;
  product_name?: string | null;
  scope: OfferScope;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export interface BulkDiscount {
  id: number;
  product_id: number | null;
  product_name?: string | null;
  scope: OfferScope;
  min_quantity: number;
  discount_percent: number;
  active: boolean;
  created_at: string;
}

export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: number;
  join_date: string;
  status: EmployeeStatus;
  created_at: string;
}

export type ExpenseCategory = 'Salary' | 'Advertisement' | 'Operational' | 'Other';

export interface Expense {
  id: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

export type DealStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';

export interface Deal {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_amount: number;
  status: DealStatus;
  inventory_impact: number;
  notes: string;
  created_at: string;
}

export type EnquiryStatus = 'New' | 'Contacted' | 'Closed';

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  product_id: number | null;
  product_name?: string | null;
  quantity: number;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface AnalyticsSummary {
  revenue: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  inventory: {
    retailValue: number;
    costValue: number;
    totalUnits: number;
  };
  dealsByStatus: { status: DealStatus; count: number }[];
  lowStockCount: number;
  totalProducts: number;
  activeEmployees: number;
  openEnquiries: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  deal_count: number;
}

export interface CategoryBreakdown {
  category: Category;
  revenue: number;
  deal_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  category: Category;
  units_sold: number;
  revenue: number;
}

export interface ExpenseBreakdown {
  category: ExpenseCategory;
  total: number;
}

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}
