import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { myBets } from '../../data/mockData';

const allBets = [
  ...myBets,
  { id: 'BET006', match: 'PSG vs Bayern', selection: 'PSG Win', odds: 2.40, stake: 800, potentialWin: 1920, status: 'open', sport: 'football', placedAt: '2026-04-06T11:00:00Z', user: 'Sneha Gupta' },
  { id: 'BET007', match: 'Celtics vs Bucks', selection: 'Celtics -3.5', odds: 1.95, stake: 1500, potentialWin: 2925, status: 'open', sport: 'basketball', placedAt: '2026-04-06T13:00:00Z', user: 'Karan Mehta' },
  { id: 'BET008', match: 'India vs Australia', selection: 'India Win', odds: 1.60, stake: 2000, potentialWin: 3200, status: 'won', sport: 'cricket', placedAt: '2026-04-05T09:00:00Z', user: 'Ananya Reddy' },
].map((b, i) => ({ ...b, user: b.user || 'Rahul Sharma' }));

export default function BetManagement() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all' ? allBets : allBets.filter(b => b.status === statusFilter);

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Bet Management</h1>
      <p className="page-subtitle">View and manage all platform bets</p>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {['all', 'open', 'won', 'lost'].map(status => (
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
          {filtered.length} bets
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" id="bets-table">
          <thead>
            <tr>
              <th>Bet ID</th>
              <th>User</th>
              <th>Match</th>
              <th>Selection</th>
              <th>Odds</th>
              <th>Stake</th>
              <th>Potential</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(bet => (
              <tr key={bet.id}>
                <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{bet.id}</td>
                <td style={{ fontSize: 'var(--font-sm)' }}>{bet.user}</td>
                <td style={{ fontSize: 'var(--font-sm)', maxWidth: '160px' }} className="truncate">{bet.match}</td>
                <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{bet.selection}</td>
                <td style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{bet.odds.toFixed(2)}</td>
                <td style={{ fontWeight: 600 }}>₹{bet.stake.toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>₹{bet.potentialWin.toLocaleString()}</td>
                <td><span className={`badge badge-${bet.status}`}>{bet.status}</span></td>
                <td>
                  {bet.status === 'open' && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <button className="btn btn-icon btn-secondary" title="Settle as Won" style={{ color: 'var(--accent-green)' }}>
                        <CheckCircle size={14} />
                      </button>
                      <button className="btn btn-icon btn-secondary" title="Settle as Lost" style={{ color: 'var(--accent-red)' }}>
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
