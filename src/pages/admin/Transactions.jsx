import { useState } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { transactions } from '../../data/mockData';

const adminTxns = [
  ...transactions,
  { id: 'TXN008', type: 'withdraw', amount: 8000, method: 'UPI', status: 'pending', date: '2026-04-06T10:00:00Z', user: 'Sneha Gupta' },
  { id: 'TXN009', type: 'deposit', amount: 15000, method: 'Card', status: 'completed', date: '2026-04-06T08:00:00Z', user: 'Karan Mehta' },
  { id: 'TXN010', type: 'withdraw', amount: 3500, method: 'Bank Transfer', status: 'pending', date: '2026-04-06T07:00:00Z', user: 'Ananya Reddy' },
].map((t, i) => ({ ...t, user: t.user || 'Rahul Sharma' }));

export default function Transactions() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? adminTxns
    : filter === 'pending' ? adminTxns.filter(t => t.status === 'pending')
    : adminTxns.filter(t => t.type === filter);

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Transactions</h1>
      <p className="page-subtitle">Monitor all deposits, withdrawals, and payments</p>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {['all', 'deposit', 'withdraw', 'pending'].map(f => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
            >
              {f === 'pending' ? '⏳ Pending' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
            {filtered.map(txn => (
              <tr key={txn.id}>
                <td style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{txn.id}</td>
                <td style={{ fontSize: 'var(--font-sm)' }}>{txn.user}</td>
                <td>
                  <span style={{
                    textTransform: 'capitalize', fontWeight: 500,
                    color: txn.type === 'deposit' || txn.type === 'win' ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    {txn.type}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>₹{txn.amount.toLocaleString()}</td>
                <td style={{ fontSize: 'var(--font-sm)' }}>{txn.method}</td>
                <td>
                  <span className={`badge badge-${txn.status === 'completed' ? 'won' : 'pending'}`}>
                    {txn.status}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                  {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  {txn.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <button className="btn btn-icon btn-secondary" title="Approve" style={{ color: 'var(--accent-green)' }}>
                        <CheckCircle size={14} />
                      </button>
                      <button className="btn btn-icon btn-secondary" title="Reject" style={{ color: 'var(--accent-red)' }}>
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
