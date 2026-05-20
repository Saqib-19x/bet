import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { admin as adminApi } from '../../api/client';

const TYPE_FILTERS = ['all', 'deposit', 'withdraw', 'bet', 'win'];

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (pendingOnly) params.status = 'pending';
      const res = await adminApi.transactions(params);
      setTxns(res.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [typeFilter, pendingOnly]);

  const act = async (id, action) => {
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this transaction?`)) return;
    try {
      const res = await adminApi.approveTransaction(id, action);
      setTxns((prev) => prev.map((t) => (t._id === id ? res.transaction : t)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Transactions</h1>
      <p className="page-subtitle">Monitor all deposits, withdrawals, and payments</p>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              className={`tab ${typeFilter === f && !pendingOnly ? 'active' : ''}`}
              onClick={() => { setTypeFilter(f); setPendingOnly(false); }}
              style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
          <button
            className={`tab ${pendingOnly ? 'active' : ''}`}
            onClick={() => setPendingOnly((p) => !p)}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            ⏳ Pending
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#f44336', marginBottom: 'var(--space-md)' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>Loading…</div>
        ) : txns.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>No transactions found.</div>
        ) : (
          <table className="data-table" id="admin-txn-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((txn) => {
                const positive = ['deposit', 'win', 'refund'].includes(txn.type);
                return (
                  <tr key={txn._id}>
                    <td style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{txn._id.slice(-6).toUpperCase()}</td>
                    <td style={{ fontSize: 'var(--font-sm)' }}>{txn.userId?.name || txn.userId?.email || '—'}</td>
                    <td>
                      <span style={{
                        textTransform: 'capitalize', fontWeight: 500,
                        color: positive ? 'var(--accent-green)' : 'var(--accent-red)',
                      }}>
                        {txn.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{txn.amount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 'var(--font-sm)' }}>{txn.method}</td>
                    <td>
                      <span className={`badge badge-${txn.status === 'completed' ? 'won' : txn.status === 'cancelled' ? 'lost' : 'pending'}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {new Date(txn.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      {txn.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                          <button className="btn btn-icon btn-secondary" title="Approve" style={{ color: 'var(--accent-green)' }} onClick={() => act(txn._id, 'approve')}>
                            <CheckCircle size={14} />
                          </button>
                          <button className="btn btn-icon btn-secondary" title="Reject" style={{ color: 'var(--accent-red)' }} onClick={() => act(txn._id, 'reject')}>
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
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
