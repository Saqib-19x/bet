import { useState } from 'react';
import { TicketCheck, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { myBets } from '../data/mockData';

const tabs = ['all', 'open', 'won', 'lost'];

export default function MyBets() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? myBets
    : myBets.filter(b => b.status === activeTab);

  const totalWon = myBets.filter(b => b.status === 'won').reduce((s, b) => s + b.potentialWin, 0);
  const totalLost = myBets.filter(b => b.status === 'lost').reduce((s, b) => s + b.stake, 0);
  const openBets = myBets.filter(b => b.status === 'open').length;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">My Bets</h1>
      <p className="page-subtitle">Track all your bets and winnings</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        <div className="stat-card blue">
          <div className="stat-icon"><TicketCheck size={20} /></div>
          <div className="stat-label">Open Bets</div>
          <div className="stat-value">{openBets}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><TrendingUp size={20} /></div>
          <div className="stat-label">Total Won</div>
          <div className="stat-value">₹{totalWon.toLocaleString()}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><TrendingDown size={20} /></div>
          <div className="stat-label">Total Lost</div>
          <div className="stat-value">₹{totalLost.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-xl)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bet Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {filtered.map(bet => (
          <div key={bet.id} className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                  {bet.id} • {bet.sport.charAt(0).toUpperCase() + bet.sport.slice(1)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>{bet.match}</div>
              </div>
              <span className={`badge badge-${bet.status}`}>
                {bet.status}
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-lg)',
              padding: 'var(--space-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Selection</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{bet.selection}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Odds</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{bet.odds.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Stake</div>
                <div style={{ fontWeight: 600 }}>₹{bet.stake.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                  {bet.status === 'won' ? 'Won' : 'Potential Win'}
                </div>
                <div style={{ fontWeight: 700, color: bet.status === 'won' ? 'var(--accent-green)' : bet.status === 'lost' ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                  {bet.status === 'lost' ? '−' : ''}₹{bet.potentialWin.toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'var(--space-md)', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
              <Calendar size={12} />
              {new Date(bet.placedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
