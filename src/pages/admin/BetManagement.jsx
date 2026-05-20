import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { admin as adminApi } from '../../api/client';

const STATUSES = ['all', 'open', 'won', 'lost', 'cancelled'];

export default function BetManagement() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminApi.bets(params);
      setBets(res.bets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const settle = async (id, status) => {
    if (!window.confirm(`Settle this bet as ${status}?`)) return;
    try {
      const res = await adminApi.settleBet(id, status);
      setBets((prev) => prev.map((b) => (b._id === id ? res.bet : b)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Bet Management</h1>
      <p className="page-subtitle">View and manage all platform bets</p>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {STATUSES.map((status) => (
            <button
              key={status}
              className={`tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
              style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
            >
              {status}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
          {bets.length} bets
        </span>
      </div>

      {error && <div style={{ color: '#f44336', marginBottom: 'var(--space-md)' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>Loading…</div>
        ) : bets.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>No bets found.</div>
        ) : (
          <table className="data-table" id="bets-table">
            <thead>
              <tr>
                <th>Bet ID</th>
                <th>User</th>
                <th>Match</th>
                <th>Market</th>
                <th>Selection</th>
                <th>Odds</th>
                <th>Stake</th>
                <th>Potential</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet._id}>
                  <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{bet._id.slice(-6).toUpperCase()}</td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{bet.userId?.name || bet.userId?.email || '—'}</td>
                  <td style={{ fontSize: 'var(--font-sm)', maxWidth: '180px' }} className="truncate">{bet.matchTitle}</td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{bet.marketName}</td>
                  <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{bet.selection}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{bet.odds.toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>₹{bet.stake.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600 }}>₹{bet.potentialWin.toLocaleString('en-IN')}</td>
                  <td><span className={`badge badge-${bet.status}`}>{bet.status}</span></td>
                  <td>
                    {bet.status === 'open' && (
                      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button className="btn btn-icon btn-secondary" title="Settle as Won" style={{ color: 'var(--accent-green)' }} onClick={() => settle(bet._id, 'won')}>
                          <CheckCircle size={14} />
                        </button>
                        <button className="btn btn-icon btn-secondary" title="Settle as Lost" style={{ color: 'var(--accent-red)' }} onClick={() => settle(bet._id, 'lost')}>
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
