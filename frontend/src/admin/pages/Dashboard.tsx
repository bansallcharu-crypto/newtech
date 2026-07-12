import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { IndianRupee, TrendingUp, Wallet, Boxes, AlertTriangle, Users, MessageSquareText, Handshake } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../utils/pricing';
import KpiCard from '../components/KpiCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { summary, monthlyRevenue, categoryBreakdown, topProducts, expenseBreakdown } = useData();

  const monthLabels = useMemo(
    () => monthlyRevenue.map((m) => new Date(`${m.month}-01`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })),
    [monthlyRevenue]
  );

  if (!summary) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Business Overview</h1>
        <p className="text-sm text-slate-500 mt-1">A live snapshot of sales, inventory and profitability.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenue" value={formatINR(summary.revenue)} icon={IndianRupee} tone="brand" sublabel="Confirmed + delivered deals" />
        <KpiCard label="Net Profit" value={formatINR(summary.netProfit)} icon={TrendingUp} tone="emerald" sublabel="After COGS & expenses" />
        <KpiCard label="Total Expenses" value={formatINR(summary.totalExpenses)} icon={Wallet} tone="amber" sublabel="Salaries, ads, operations" />
        <KpiCard label="Inventory Value" value={formatINR(summary.inventory.retailValue)} icon={Boxes} tone="slate" sublabel={`${summary.inventory.totalUnits} units in stock`} />
        <KpiCard label="Low Stock Alerts" value={String(summary.lowStockCount)} icon={AlertTriangle} tone="rose" sublabel="Products at ≤10 units" />
        <KpiCard label="Active Employees" value={String(summary.activeEmployees)} icon={Users} tone="brand" sublabel="On payroll" />
        <KpiCard label="Open Enquiries" value={String(summary.openEnquiries)} icon={MessageSquareText} tone="amber" sublabel="Awaiting response" />
        <KpiCard label="Total Products" value={String(summary.totalProducts)} icon={Handshake} tone="slate" sublabel="Across catalog" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Monthly Revenue Trend</h3>
          {monthlyRevenue.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No confirmed deals yet.</p>
          ) : (
            <Line
              data={{
                labels: monthLabels,
                datasets: [
                  {
                    label: 'Revenue (₹)',
                    data: monthlyRevenue.map((m) => m.revenue),
                    borderColor: '#2660f2',
                    backgroundColor: 'rgba(38,96,242,0.12)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { ticks: { callback: (v) => `₹${Number(v) / 1000}k` } } }
              }}
            />
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Deals by Status</h3>
          {summary.dealsByStatus.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No deals recorded yet.</p>
          ) : (
            <Doughnut
              data={{
                labels: summary.dealsByStatus.map((d) => d.status),
                datasets: [
                  {
                    data: summary.dealsByStatus.map((d) => d.count),
                    backgroundColor: ['#f2a022', '#2660f2', '#10b981', '#e11d48']
                  }
                ]
              }}
              options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Top Products by Revenue</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No sales yet.</p>
          ) : (
            <Bar
              data={{
                labels: topProducts.map((p) => p.name),
                datasets: [
                  {
                    label: 'Revenue (₹)',
                    data: topProducts.map((p) => p.revenue),
                    backgroundColor: '#2660f2',
                    borderRadius: 6
                  }
                ]
              }}
              options={{
                indexAxis: 'y' as const,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { callback: (v) => `₹${Number(v) / 1000}k` } } }
              }}
            />
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Expense Breakdown</h3>
          {expenseBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No expenses recorded yet.</p>
          ) : (
            <Doughnut
              data={{
                labels: expenseBreakdown.map((e) => e.category),
                datasets: [
                  {
                    data: expenseBreakdown.map((e) => e.total),
                    backgroundColor: ['#e11d48', '#f2a022', '#2660f2', '#64748b']
                  }
                ]
              }}
              options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }}
            />
          )}
        </div>
      </div>

      {categoryBreakdown.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Revenue by Category</h3>
          <div className="grid grid-cols-2 gap-4">
            {categoryBreakdown.map((c) => (
              <div key={c.category} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{c.category}</p>
                <p className="text-xl font-display font-bold text-slate-900 mt-1">{formatINR(c.revenue)}</p>
                <p className="text-xs text-slate-500 mt-1">{c.deal_count} deals</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
