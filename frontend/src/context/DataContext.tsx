import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';
import type {
  Product, Offer, BulkDiscount, Employee, Expense, Deal, Enquiry,
  AnalyticsSummary, MonthlyRevenue, CategoryBreakdown, TopProduct, ExpenseBreakdown
} from '../types';

interface DataContextValue {
  products: Product[];
  offers: Offer[];
  discounts: BulkDiscount[];
  employees: Employee[];
  expenses: Expense[];
  deals: Deal[];
  enquiries: Enquiry[];
  summary: AnalyticsSummary | null;
  monthlyRevenue: MonthlyRevenue[];
  categoryBreakdown: CategoryBreakdown[];
  topProducts: TopProduct[];
  expenseBreakdown: ExpenseBreakdown[];
  publicLoading: boolean;
  refreshPublic: () => Promise<void>;
  refreshAdmin: () => Promise<void>;

  createProduct: (data: Partial<Product>) => Promise<Product>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;

  createOffer: (data: Partial<Offer>) => Promise<Offer>;
  updateOffer: (id: number, data: Partial<Offer>) => Promise<Offer>;
  deleteOffer: (id: number) => Promise<void>;

  createDiscount: (data: Partial<BulkDiscount>) => Promise<BulkDiscount>;
  updateDiscount: (id: number, data: Partial<BulkDiscount>) => Promise<BulkDiscount>;
  deleteDiscount: (id: number) => Promise<void>;

  createEmployee: (data: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<Employee>;
  deleteEmployee: (id: number) => Promise<void>;

  createExpense: (data: Partial<Expense>) => Promise<Expense>;
  updateExpense: (id: number, data: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: number) => Promise<void>;

  createDeal: (data: Partial<Deal>) => Promise<Deal>;
  updateDeal: (id: number, data: Partial<Deal>) => Promise<Deal>;
  deleteDeal: (id: number) => Promise<void>;

  submitEnquiry: (data: Partial<Enquiry>) => Promise<Enquiry>;
  updateEnquiry: (id: number, data: Partial<Enquiry>) => Promise<Enquiry>;
  deleteEnquiry: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [discounts, setDiscounts] = useState<BulkDiscount[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);

  const refreshPublic = useCallback(async () => {
    setPublicLoading(true);
    try {
      const [p, o, d] = await Promise.all([
        client.get<Product[]>('/products'),
        client.get<Offer[]>('/offers'),
        client.get<BulkDiscount[]>('/discounts')
      ]);
      setProducts(p.data);
      setOffers(o.data);
      setDiscounts(d.data);
    } finally {
      setPublicLoading(false);
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    const [s, mr, cb, tp, eb] = await Promise.all([
      client.get<AnalyticsSummary>('/analytics/summary'),
      client.get<MonthlyRevenue[]>('/analytics/monthly-revenue'),
      client.get<CategoryBreakdown[]>('/analytics/category-breakdown'),
      client.get<TopProduct[]>('/analytics/top-products'),
      client.get<ExpenseBreakdown[]>('/analytics/expense-breakdown')
    ]);
    setSummary(s.data);
    setMonthlyRevenue(mr.data);
    setCategoryBreakdown(cb.data);
    setTopProducts(tp.data);
    setExpenseBreakdown(eb.data);
  }, []);

  const refreshAdmin = useCallback(async () => {
    if (!token) return;
    const [emp, exp, dl, enq] = await Promise.all([
      client.get<Employee[]>('/employees'),
      client.get<Expense[]>('/expenses'),
      client.get<Deal[]>('/deals'),
      client.get<Enquiry[]>('/enquiries')
    ]);
    setEmployees(emp.data);
    setExpenses(exp.data);
    setDeals(dl.data);
    setEnquiries(enq.data);
    await refreshAnalytics();
  }, [token, refreshAnalytics]);

  useEffect(() => {
    refreshPublic();
  }, [refreshPublic]);

  useEffect(() => {
    if (token) refreshAdmin();
  }, [token, refreshAdmin]);

  // ---- Products ----
  const createProduct = useCallback(async (data: Partial<Product>) => {
    const res = await client.post<Product>('/products', data);
    setProducts((prev) => [res.data, ...prev]);
    return res.data;
  }, []);
  const updateProduct = useCallback(async (id: number, data: Partial<Product>) => {
    const res = await client.put<Product>(`/products/${id}`, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res.data;
  }, []);
  const deleteProduct = useCallback(async (id: number) => {
    await client.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---- Offers ----
  const createOffer = useCallback(async (data: Partial<Offer>) => {
    const res = await client.post<Offer>('/offers', data);
    setOffers((prev) => [res.data, ...prev]);
    return res.data;
  }, []);
  const updateOffer = useCallback(async (id: number, data: Partial<Offer>) => {
    const res = await client.put<Offer>(`/offers/${id}`, data);
    setOffers((prev) => prev.map((o) => (o.id === id ? res.data : o)));
    return res.data;
  }, []);
  const deleteOffer = useCallback(async (id: number) => {
    await client.delete(`/offers/${id}`);
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }, []);

  // ---- Discounts ----
  const createDiscount = useCallback(async (data: Partial<BulkDiscount>) => {
    const res = await client.post<BulkDiscount>('/discounts', data);
    setDiscounts((prev) => [...prev, res.data].sort((a, b) => a.min_quantity - b.min_quantity));
    return res.data;
  }, []);
  const updateDiscount = useCallback(async (id: number, data: Partial<BulkDiscount>) => {
    const res = await client.put<BulkDiscount>(`/discounts/${id}`, data);
    setDiscounts((prev) => prev.map((d) => (d.id === id ? res.data : d)));
    return res.data;
  }, []);
  const deleteDiscount = useCallback(async (id: number) => {
    await client.delete(`/discounts/${id}`);
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ---- Employees ----
  const createEmployee = useCallback(async (data: Partial<Employee>) => {
    const res = await client.post<Employee>('/employees', data);
    setEmployees((prev) => [...prev, res.data]);
    return res.data;
  }, []);
  const updateEmployee = useCallback(async (id: number, data: Partial<Employee>) => {
    const res = await client.put<Employee>(`/employees/${id}`, data);
    setEmployees((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    return res.data;
  }, []);
  const deleteEmployee = useCallback(async (id: number) => {
    await client.delete(`/employees/${id}`);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ---- Expenses ----
  const createExpense = useCallback(async (data: Partial<Expense>) => {
    const res = await client.post<Expense>('/expenses', data);
    setExpenses((prev) => [res.data, ...prev]);
    await refreshAnalytics();
    return res.data;
  }, [refreshAnalytics]);
  const updateExpense = useCallback(async (id: number, data: Partial<Expense>) => {
    const res = await client.put<Expense>(`/expenses/${id}`, data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    await refreshAnalytics();
    return res.data;
  }, [refreshAnalytics]);
  const deleteExpense = useCallback(async (id: number) => {
    await client.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await refreshAnalytics();
  }, [refreshAnalytics]);

  // ---- Deals (also affects product inventory + analytics) ----
  const createDeal = useCallback(async (data: Partial<Deal>) => {
    const res = await client.post<Deal>('/deals', data);
    setDeals((prev) => [res.data, ...prev]);
    await Promise.all([refreshPublic(), refreshAnalytics()]);
    return res.data;
  }, [refreshPublic, refreshAnalytics]);
  const updateDeal = useCallback(async (id: number, data: Partial<Deal>) => {
    const res = await client.put<Deal>(`/deals/${id}`, data);
    setDeals((prev) => prev.map((d) => (d.id === id ? res.data : d)));
    await Promise.all([refreshPublic(), refreshAnalytics()]);
    return res.data;
  }, [refreshPublic, refreshAnalytics]);
  const deleteDeal = useCallback(async (id: number) => {
    await client.delete(`/deals/${id}`);
    setDeals((prev) => prev.filter((d) => d.id !== id));
    await Promise.all([refreshPublic(), refreshAnalytics()]);
  }, [refreshPublic, refreshAnalytics]);

  // ---- Enquiries ----
  const submitEnquiry = useCallback(async (data: Partial<Enquiry>) => {
    const res = await client.post<Enquiry>('/enquiries', data);
    setEnquiries((prev) => [res.data, ...prev]);
    return res.data;
  }, []);
  const updateEnquiry = useCallback(async (id: number, data: Partial<Enquiry>) => {
    const res = await client.put<Enquiry>(`/enquiries/${id}`, data);
    setEnquiries((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    return res.data;
  }, []);
  const deleteEnquiry = useCallback(async (id: number) => {
    await client.delete(`/enquiries/${id}`);
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <DataContext.Provider
      value={{
        products, offers, discounts, employees, expenses, deals, enquiries,
        summary, monthlyRevenue, categoryBreakdown, topProducts, expenseBreakdown,
        publicLoading, refreshPublic, refreshAdmin,
        createProduct, updateProduct, deleteProduct,
        createOffer, updateOffer, deleteOffer,
        createDiscount, updateDiscount, deleteDiscount,
        createEmployee, updateEmployee, deleteEmployee,
        createExpense, updateExpense, deleteExpense,
        createDeal, updateDeal, deleteDeal,
        submitEnquiry, updateEnquiry, deleteEnquiry
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
