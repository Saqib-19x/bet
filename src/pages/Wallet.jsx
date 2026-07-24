import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, CreditCard, Smartphone, Building } from 'lucide-react';
import { wallet as walletApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const typeIcons = {
  deposit: <ArrowDownCircle size={16} style={{ color: 'var(--accent-green)' }} />,
  withdraw: <ArrowUpCircle size={16} style={{ color: 'var(--accent-red)' }} />,
  bet: <CreditCard size={16} style={{ color: 'var(--accent-blue)' }} />,
  win: <ArrowDownCircle size={16} style={{ color: 'var(--accent-green)' }} />,
  refund: <ArrowDownCircle size={16} style={{ color: 'var(--accent-yellow)' }} />,
  adjustment: <CreditCard size={16} style={{ color: 'var(--accent-yellow)' }} />,
};

const methodLabels = { upi: 'UPI', card: 'Card', bank: 'Bank Transfer' };

export default function Wallet() {
  const { user, updateBalance } = useAuth();
  const [mode, setMode] = useState(null); // 'deposit' | 'withdraw' | null
  const [method, setMethod] = useState('upi');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const res = await walletApi.transactions({ limit: 50 });
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const submit = async () => {
    setError('');
    setSuccess('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setSubmitting(true);
    try {
      const fn = mode === 'deposit' ? walletApi.deposit : walletApi.withdraw;
      const result = await fn({ amount: amt, method: methodLabels[method] });
      updateBalance(result.balance);
      setSuccess(result.message || `${mode === 'deposit' ? 'Deposit requested — pending admin approval' : 'Withdrawal requested'} · ₹${amt.toLocaleString('en-IN')}.`);
      setAmount('');
      loadTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const balance = (user?.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="animate-fade-in xc-page xc-panel">
      <div className="xc-panel-head">Wallet</div>

      <div className="wallet-balance-card">
        <div className="wallet-balance-label">Available Balance</div>
        <div className="wallet-balance-amount">₹{balance}</div>
        <div className="wallet-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => { setMode(mode === 'deposit' ? null : 'deposit'); setError(''); setSuccess(''); }}
          >
            <ArrowDownCircle size={18} /> Deposit
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => { setMode(mode === 'withdraw' ? null : 'withdraw'); setError(''); setSuccess(''); }}
          >
            <ArrowUpCircle size={18} /> Withdraw
          </button>
        </div>
      </div>

      {mode && (
        <div className="card animate-slide-up" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)', textTransform: 'capitalize' }}>{mode}</h3>

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)',
              background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: 'var(--font-sm)'
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)',
              background: 'rgba(0,230,118,0.1)', color: 'var(--accent-green)', fontSize: 'var(--font-sm)'
            }}>{success}</div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            {[
              { id: 'upi', label: 'UPI', icon: <Smartphone size={16} /> },
              { id: 'card', label: 'Card', icon: <CreditCard size={16} /> },
              { id: 'bank', label: 'Bank', icon: <Building size={16} /> },
            ].map((m) => (
              <button
                key={m.id}
                className={`btn ${method === m.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMethod(m.id)}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="input-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', margin: 'var(--space-lg) 0' }}>
            {[500, 1000, 2000, 5000].map((a) => (
              <button
                key={a}
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setAmount(String(a))}
              >
                ₹{a}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'Processing…' : mode === 'deposit' ? 'Deposit Now' : 'Request Withdrawal'}
          </button>
          {mode === 'deposit' && (
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
              Min ₹100 · Max ₹5,00,000.
            </p>
          )}
          {mode === 'withdraw' && (
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
              Min ₹500. Withdrawals are processed within 24 hours.
            </p>
          )}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-lg) var(--space-xl)', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontWeight: 700 }}>Transaction History</h3>
        </div>
        {loading ? (
          <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skeleton width={16} height={16} radius={4} />
                <Skeleton width={70} height={14} />
                <Skeleton width={60} height={14} />
                <Skeleton width={80} height={16} style={{ marginLeft: 'auto' }} />
                <Skeleton width={70} height={20} radius={4} />
                <Skeleton width={100} height={12} />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState preset="transactions" compact />
        ) : (
          <table className="data-table" id="transaction-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const positive = ['deposit', 'win', 'refund'].includes(txn.type) || (txn.type === 'adjustment' && txn.balanceAfter > txn.balanceBefore);
                return (
                  <tr key={txn._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {typeIcons[txn.type] || <CreditCard size={16} />}
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{txn.type}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                      {txn._id.slice(-6).toUpperCase()}
                    </td>
                    <td>{txn.method}</td>
                    <td style={{
                      fontWeight: 700,
                      color: positive ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                      {positive ? '+' : '−'}₹{txn.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge badge-${txn.status === 'completed' ? 'won' : txn.status === 'cancelled' ? 'lost' : 'pending'}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {new Date(txn.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
