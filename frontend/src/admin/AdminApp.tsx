import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Offers from './pages/Offers';
import Discounts from './pages/Discounts';
import Employees from './pages/Employees';
import Expenses from './pages/Expenses';
import Deals from './pages/Deals';
import Enquiries from './pages/Enquiries';

export default function AdminApp() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-full bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 md:p-6">
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/enquiries" element={<Enquiries />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
