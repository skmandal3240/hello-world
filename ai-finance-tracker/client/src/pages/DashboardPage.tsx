import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountsApi } from '../api/accounts';
import { transactionsApi } from '../api/transactions';
import { budgetsApi } from '../api/budgets';
import { insightsApi } from '../api/insights';
import { Account } from '../types/account';
import { Transaction } from '../types/transaction';
import { Budget } from '../types/budget';
import { AiInsight } from '../types/insight';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [latestInsight, setLatestInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountsApi.list(),
      transactionsApi.list({ limit: 5 }),
      budgetsApi.list(),
      insightsApi.list(),
    ]).then(([a, t, b, i]) => {
      setAccounts(a.data);
      setRecentTxs(t.data.transactions);
      setBudgets(b.data);
      setLatestInsight(i.data[0] || null);
    }).finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const now = new Date();
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(n);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/transactions"><Button size="sm">+ Add transaction</Button></Link>
      </div>

      {/* Net worth */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
        <p className="text-brand-100 text-sm mb-1">Net Worth</p>
        <p className="text-4xl font-bold">{fmt(totalBalance)}</p>
        <p className="text-brand-200 text-sm mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Budget rings + AI insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgets */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Budgets — {now.toLocaleString('default', { month: 'long' })}</h2>
            <Link to="/budgets" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm mb-3">No budgets set yet.</p>
              <Link to="/budgets"><Button size="sm" variant="secondary">Set budgets</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.slice(0, 4).map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{b.category.icon} {b.category.name}</span>
                    <span className={b.percentUsed > 100 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                      {fmt(b.spent)} / {fmt(b.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${b.percentUsed > 100 ? 'bg-red-500' : b.percentUsed > 80 ? 'bg-yellow-400' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(100, b.percentUsed)}%`, backgroundColor: b.percentUsed <= 80 ? b.category.color : undefined }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">AI Insight</h2>
            <Link to="/insights" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {latestInsight ? (
            <div>
              <p className="font-medium text-gray-800 mb-2">{latestInsight.title}</p>
              <p className="text-sm text-gray-500">{latestInsight.body}</p>
              {Array.isArray((latestInsight.data as any)?.tips) && (
                <ul className="mt-3 space-y-1">
                  {((latestInsight.data as any).tips as string[]).slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-brand-500">✓</span>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm mb-3">No insights yet.</p>
              <Link to="/insights"><Button size="sm" variant="secondary">Generate insights</Button></Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-brand-600 hover:underline">View all</Link>
        </div>
        {recentTxs.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {recentTxs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tx.category?.icon || '📦'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
