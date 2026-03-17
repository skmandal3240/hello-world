import { useEffect, useState, useCallback } from 'react';
import { accountsApi } from '../api/accounts';
import { Account, AccountType } from '../types/account';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import ErrorBanner from '../components/ui/ErrorBanner';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Checking', SAVINGS: 'Savings', CREDIT: 'Credit Card',
  INVESTMENT: 'Investment', LOAN: 'Loan', CASH: 'Cash',
};

const ACCOUNT_ICONS: Record<AccountType, string> = {
  CHECKING: '🏦', SAVINGS: '💰', CREDIT: '💳',
  INVESTMENT: '📈', LOAN: '🏠', CASH: '💵',
};

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(n);

  const load = useCallback(() => {
    setLoading(true);
    accountsApi.list().then(({ data }) => setAccounts(data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this account and all its transactions?')) return;
    await accountsApi.delete(id);
    load();
  };

  const netWorth = accounts.reduce((s, a) => {
    return a.type === 'CREDIT' || a.type === 'LOAN' ? s - Number(a.balance) : s + Number(a.balance);
  }, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}>+ Add Account</Button>
      </div>

      {/* Net worth banner */}
      {!loading && accounts.length > 0 && (
        <div className="bg-brand-600 text-white rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-brand-100 text-sm">Net Worth</p>
            <p className="text-2xl font-bold">{fmt(netWorth)}</p>
          </div>
          <span className="text-4xl opacity-60">💼</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4">No accounts yet. Add a manual account to get started.</p>
          <Button onClick={() => setShowAdd(true)}>Add your first account</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Group by type */}
          {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map(type => {
            const group = accounts.filter(a => a.type === type && !a.isPlaid);
            const plaidGroup = accounts.filter(a => a.type === type && a.isPlaid);
            const all = [...group, ...plaidGroup];
            if (all.length === 0) return null;
            return (
              <div key={type}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {ACCOUNT_ICONS[type]} {ACCOUNT_TYPE_LABELS[type]}
                </p>
                <div className="space-y-2">
                  {all.map(a => (
                    <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                          {ACCOUNT_ICONS[a.type]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-400">
                            {a.isPlaid ? '🔗 Connected via Plaid' : 'Manual'} · {a.currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${a.type === 'CREDIT' || a.type === 'LOAN' ? 'text-red-600' : 'text-gray-900'}`}>
                          {fmt(Number(a.balance))}
                        </span>
                        {!a.isPlaid && (
                          <div className="flex gap-1">
                            <button onClick={() => setEditAccount(a)} className="text-gray-400 hover:text-brand-600 text-sm transition-colors px-1">✏️</button>
                            <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-500 text-sm transition-colors px-1">✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plaid section */}
      <PlaidSection onLinked={load} />

      {showAdd && <AccountModal onClose={() => setShowAdd(false)} onSaved={load} currency={user?.currency || 'USD'} />}
      {editAccount && <AccountModal account={editAccount} onClose={() => setEditAccount(null)} onSaved={load} currency={user?.currency || 'USD'} />}
    </div>
  );
}

function AccountModal({ account, onClose, onSaved, currency }: {
  account?: Account; onClose: () => void; onSaved: () => void; currency: string;
}) {
  const [form, setForm] = useState({
    name: account?.name || '',
    type: account?.type || 'CHECKING' as AccountType,
    balance: account ? String(account.balance) : '0',
    currency,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (account) {
        await accountsApi.update(account.id, { name: form.name, balance: parseFloat(form.balance) });
      } else {
        await accountsApi.create({ ...form, balance: parseFloat(form.balance) });
      }
      onSaved(); onClose();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={account ? 'Edit Account' : 'Add Account'} onClose={onClose}>
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Account name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Chase Checking" required />
        {!account && (
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as AccountType}))}>
            {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{ACCOUNT_ICONS[v]} {l}</option>
            ))}
          </Select>
        )}
        <Input label={`Current balance (${currency})`} type="number" step="0.01" value={form.balance} onChange={e => setForm(f => ({...f, balance: e.target.value}))} required />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} className="flex-1">Save</Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function PlaidSection({ onLinked }: { onLinked: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openPlaid = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await accountsApi.createLinkToken();
      setToken(data.link_token);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Plaid is not configured';
      setError(msg);
    } finally { setLoading(false); }
  };

  // Dynamically load Plaid Link when token is ready
  useEffect(() => {
    if (!token) return;
    // We use a script tag approach to avoid bundling react-plaid-link if not needed
    const handler = (window as any).Plaid?.create({
      token,
      onSuccess: async (publicToken: string) => {
        try {
          await accountsApi.exchangePlaidToken(publicToken);
          onLinked();
          setToken(null);
        } catch { setError('Failed to link account'); }
      },
      onExit: () => setToken(null),
    });
    handler?.open();
  }, [token, onLinked]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Connect a bank</p>
          <p className="text-sm text-gray-500 mt-0.5">Link your bank account via Plaid to auto-import transactions</p>
        </div>
        <Button variant="secondary" size="sm" onClick={openPlaid} loading={loading}>
          🔗 Connect Bank
        </Button>
      </div>
      {error && <p className="text-xs text-amber-600 mt-2">{error}</p>}
    </div>
  );
}
