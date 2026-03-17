import { useEffect, useState, useCallback } from 'react';
import Papa from 'papaparse';
import { transactionsApi } from '../api/transactions';
import { accountsApi } from '../api/accounts';
import { categoriesApi } from '../api/categories';
import { Transaction, Category, TxType } from '../types/transaction';
import { Account } from '../types/account';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import ErrorBanner from '../components/ui/ErrorBanner';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [filters, setFilters] = useState({ q: '', type: '', categoryId: '', accountId: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(n);

  const load = useCallback(() => {
    setLoading(true);
    transactionsApi.list({ ...filters as any, page }).then(({ data }) => {
      setTransactions(data.transactions);
      setTotal(data.total);
    }).finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => {
    Promise.all([accountsApi.list(), categoriesApi.list()]).then(([a, c]) => {
      setAccounts(a.data); setCategories(c.data);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowCsv(true)}>Import CSV</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>+ Add</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <Input placeholder="Search…" value={filters.q} onChange={e => { setFilters(f => ({...f, q: e.target.value})); setPage(1); }} className="w-40" />
        <select value={filters.type} onChange={e => { setFilters(f => ({...f, type: e.target.value})); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All types</option>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
          <option value="TRANSFER">Transfer</option>
        </select>
        <select value={filters.categoryId} onChange={e => { setFilters(f => ({...f, categoryId: e.target.value})); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No transactions found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Description</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Account</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{tx.description}</td>
                      <td className="px-4 py-3">
                        {tx.category ? <span className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-0.5">{tx.category.icon} {tx.category.name}</span> : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{tx.account?.name}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 text-sm text-gray-500">
              <span>{total} total</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                <span className="px-2 py-1">Page {page}</span>
                <Button variant="ghost" size="sm" disabled={transactions.length < 50} onClick={() => setPage(p => p + 1)}>Next →</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {showAdd && <AddTransactionModal accounts={accounts} categories={categories} currency={user?.currency || 'USD'} onClose={() => setShowAdd(false)} onSaved={load} />}
      {showCsv && <CsvImportModal accounts={accounts} categories={categories} onClose={() => setShowCsv(false)} onImported={load} />}
    </div>
  );
}

function AddTransactionModal({ accounts, categories, currency, onClose, onSaved }: {
  accounts: Account[]; categories: Category[]; currency: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({ accountId: accounts[0]?.id || '', categoryId: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10), type: 'EXPENSE' as TxType });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({...f, [k]: e.target.value}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await transactionsApi.create({ ...form, amount: parseFloat(form.amount), categoryId: form.categoryId || undefined });
      onSaved(); onClose();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Add Transaction" onClose={onClose}>
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Account" value={form.accountId} onChange={set('accountId')} required>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>
        <Select label="Type" value={form.type} onChange={set('type')}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
          <option value="TRANSFER">Transfer</option>
        </Select>
        <Input label="Description" value={form.description} onChange={set('description')} required />
        <Input label="Amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={set('amount')} required />
        <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
        <Select label="Category" value={form.categoryId} onChange={set('categoryId')}>
          <option value="">Uncategorized</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </Select>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} className="flex-1">Save</Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function CsvImportModal({ accounts, categories, onClose, onImported }: {
  accounts: Account[]; categories: Category[];
  onClose: () => void; onImported: () => void;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [rows, setRows] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data as any[];
        // Attempt to auto-map common column names
        const mapped = parsed.map(row => ({
          date: row.date || row.Date || row.DATE || '',
          description: row.description || row.Description || row.DESCRIPTION || row.memo || row.Memo || '',
          amount: Math.abs(parseFloat(row.amount || row.Amount || row.AMOUNT || '0')),
          type: (parseFloat(row.amount || row.Amount || '0') < 0 ? 'EXPENSE' : 'INCOME') as TxType,
        }));
        setRows(mapped);
        setPreview(mapped.slice(0, 5));
      },
    });
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setLoading(true); setError('');
    try {
      const { data } = await transactionsApi.importCsv(accountId, rows);
      onImported(); onClose();
    } catch (err: any) { setError(err.response?.data?.error || 'Import failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Import CSV" onClose={onClose}>
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <Select label="Import to account" value={accountId} onChange={e => setAccountId(e.target.value)}>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CSV file</label>
          <input type="file" accept=".csv" onChange={handleFile} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
          <p className="text-xs text-gray-400 mt-1">Expected columns: date, description, amount</p>
        </div>
        {preview.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Preview ({rows.length} rows)</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="text-xs w-full">
                <thead className="bg-gray-50"><tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-3 py-2 text-left text-gray-500">{k}</th>)}</tr></thead>
                <tbody>{preview.map((r, i) => <tr key={i} className="border-t border-gray-100">{Object.values(r).map((v, j) => <td key={j} className="px-3 py-2">{String(v)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={handleImport} loading={loading} disabled={!rows.length} className="flex-1">Import {rows.length > 0 ? `${rows.length} rows` : ''}</Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
