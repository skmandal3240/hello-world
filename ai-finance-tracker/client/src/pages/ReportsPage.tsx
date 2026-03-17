import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import { Category } from '../types/transaction';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

export default function ReportsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD', maximumFractionDigits: 0 }).format(n);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, txRes] = await Promise.all([
        categoriesApi.list(),
        transactionsApi.list({ type: 'EXPENSE', page: 1, from: `${year}-01-01`, to: `${year}-12-31` } as any),
      ]);
      setCategories(cats.data);

      const transactions = txRes.data.transactions;

      // Category breakdown for selected month
      const monthTxs = transactions.filter((tx: any) => {
        const d = new Date(tx.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      const catMap = new Map<string, { name: string; icon: string; amount: number }>();
      monthTxs.forEach((tx: any) => {
        if (!tx.category) return;
        const key = tx.category.id;
        const existing = catMap.get(key) || { name: tx.category.name, icon: tx.category.icon, amount: 0 };
        existing.amount += Number(tx.amount);
        catMap.set(key, existing);
      });
      setCategoryData(Array.from(catMap.values()).sort((a, b) => b.amount - a.amount));

      // Monthly trend (last 6 months)
      const trend: Record<string, { month: string; income: number; expenses: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trend[key] = { month: d.toLocaleString('default', { month: 'short' }), income: 0, expenses: 0 };
      }
      transactions.forEach((tx: any) => {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!trend[key]) return;
        if (tx.type === 'INCOME') trend[key].income += Number(tx.amount);
        else if (tx.type === 'EXPENSE') trend[key].expenses += Number(tx.amount);
      });
      setTrendData(Object.values(trend));
    } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        {/* Month selector */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
          }}>←</Button>
          <span className="text-sm font-medium text-gray-700 w-32 text-center">{monthName}</span>
          <Button variant="ghost" size="sm" onClick={() => {
            if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
          }}>→</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* Spending by category */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Spending by Category — {monthName}</h2>
            {categoryData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No expense data for this month.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {categoryData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2 text-sm">
                      <span className="text-base">{c.icon}</span>
                      <span className="flex-1 text-gray-700 truncate">{c.name}</span>
                      <span className="font-semibold text-gray-900">{fmt(c.amount)}</span>
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${(c.amount / categoryData[0].amount) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Income vs Expenses trend */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Income vs Expenses — Last 6 Months</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net savings trend */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Net Savings Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData.map(d => ({ ...d, net: d.income - d.expenses }))} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="net" name="Net Savings" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
