import { useEffect, useState, useCallback } from 'react';
import { budgetsApi } from '../api/budgets';
import { categoriesApi } from '../api/categories';
import { Budget as BudgetWithSpend } from '../types/budget';
import { Category } from '../types/transaction';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import ErrorBanner from '../components/ui/ErrorBanner';

export default function BudgetsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<BudgetWithSpend[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(n);

  const load = useCallback(() => {
    setLoading(true);
    budgetsApi.list(month, year).then(({ data }) => setBudgets(data)).finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => { categoriesApi.list().then(({ data }) => setCategories(data)); }, []);
  useEffect(() => { load(); }, [load]);

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  const handleDelete = async (id: string) => {
    await budgetsApi.delete(id);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}>+ Add Budget</Button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
        <Button variant="ghost" size="sm" onClick={() => {
          if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
        }}>←</Button>
        <span className="flex-1 text-center font-medium text-gray-700">{monthName}</span>
        <Button variant="ghost" size="sm" onClick={() => {
          if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
        }}>→</Button>
      </div>

      {/* Summary */}
      {!loading && budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Budgeted', value: fmt(totalBudget), color: 'text-gray-900' },
            { label: 'Total Spent', value: fmt(totalSpent), color: totalSpent > totalBudget ? 'text-red-600' : 'text-gray-900' },
            { label: 'Remaining', value: fmt(Math.max(0, totalBudget - totalSpent)), color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budget list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : budgets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-4">No budgets set for {monthName}.</p>
            <Button onClick={() => setShowAdd(true)}>Create your first budget</Button>
          </div>
        ) : (
          budgets.map(b => {
            const pct = b.amount > 0 ? Math.min(100, (b.spent / b.amount) * 100) : 0;
            const over = b.spent > b.amount;
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.category?.icon}</span>
                    <span className="font-medium text-gray-900">{b.category?.name}</span>
                    {over && <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-medium">Over budget</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      <span className={over ? 'text-red-600 font-semibold' : 'text-gray-900'}>{fmt(b.spent)}</span>
                      {' / '}{fmt(b.amount)}
                    </span>
                    <button onClick={() => handleDelete(b.id)} className="text-gray-300 hover:text-red-500 text-xs transition-colors">✕</button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% used · {fmt(Math.max(0, b.amount - b.spent))} remaining</p>
              </div>
            );
          })
        )}
      </div>

      {showAdd && (
        <AddBudgetModal
          categories={categories}
          existingCategoryIds={budgets.map(b => b.categoryId)}
          month={month}
          year={year}
          currency={user?.currency || 'USD'}
          onClose={() => setShowAdd(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function AddBudgetModal({ categories, existingCategoryIds, month, year, currency, onClose, onSaved }: {
  categories: Category[];
  existingCategoryIds: string[];
  month: number; year: number; currency: string;
  onClose: () => void; onSaved: () => void;
}) {
  const available = categories.filter(c => !existingCategoryIds.includes(c.id));
  const [form, setForm] = useState({ categoryId: available[0]?.id || '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await budgetsApi.upsert({ categoryId: form.categoryId, amount: parseFloat(form.amount), month, year });
      onSaved(); onClose();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={`Add Budget — ${monthName}`} onClose={onClose}>
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {available.length === 0 ? (
        <p className="text-gray-500 text-center py-4">All categories already have budgets for this month.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Category" value={form.categoryId} onChange={e => setForm(f => ({...f, categoryId: e.target.value}))} required>
            {available.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
          <Input label={`Monthly limit (${currency})`} type="number" step="0.01" min="1" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} required />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Save</Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
