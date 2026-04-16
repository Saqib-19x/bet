import { useState } from 'react';
import { ArrowLeft, Clock, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { markets } from '../data/mockData';

const match = {
  id: 1, sport: 'football', league: 'Premier League',
  teamA: 'Manchester United', teamB: 'Liverpool',
  scoreA: 2, scoreB: 1, time: "67'", isLive: true,
};

export default function MatchDetail({ onAddSelection }) {
  const [activeMarket, setActiveMarket] = useState(0);

  return (
    <div className="animate-fade-in">
      <Link to="/sports" className="btn btn-sm btn-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
        <ArrowLeft size={14} /> Back to Sports
      </Link>

      {/* Match Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0d2818 0%, #1a2040 100%)',
        borderColor: 'var(--accent-green-dim)',
        marginBottom: 'var(--space-2xl)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,230,118,0.08), transparent)', pointerEvents: 'none' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
          <span className="badge badge-live"><div className="live-dot" style={{ width: 6, height: 6 }}></div> LIVE</span>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{match.league}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3xl)', position: 'relative' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: '4px' }}>{match.teamA}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-4xl)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span style={{ color: 'var(--accent-green)' }}>{match.scoreA}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-2xl)' }}>-</span>
              <span style={{ color: 'var(--accent-green)' }}>{match.scoreB}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: 'var(--accent-yellow)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
              <Clock size={12} /> {match.time}
            </div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: '4px' }}>{match.teamB}</div>
          </div>
        </div>
      </div>

      {/* Market Tabs */}
      <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: 'var(--space-xl)', overflowX: 'auto' }}>
        {markets.map((market, i) => (
          <button
            key={i}
            className={`tab ${activeMarket === i ? 'active' : ''}`}
            onClick={() => setActiveMarket(i)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {market.name}
          </button>
        ))}
      </div>

      {/* Market Odds */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
          {markets[activeMarket].name}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(markets[activeMarket].options.length, 3)}, 1fr)`,
          gap: 'var(--space-md)',
        }}>
          {markets[activeMarket].options.map((option, i) => (
            <button
              key={i}
              className="odds-btn"
              style={{ padding: '16px', flexDirection: 'column' }}
              onClick={() => onAddSelection({
                id: `${match.id}-${activeMarket}-${i}`,
                match: `${match.teamA} vs ${match.teamB}`,
                selection: option.label,
                odds: option.odds,
              })}
            >
              <span className="odds-label" style={{ fontSize: 'var(--font-sm)' }}>{option.label}</span>
              <span className="odds-value" style={{ fontSize: 'var(--font-lg)' }}>{option.odds.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
          <BarChart3 size={18} />
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>Match Statistics</h3>
        </div>
        {[
          { label: 'Possession', home: 58, away: 42 },
          { label: 'Shots on Target', home: 6, away: 3 },
          { label: 'Corners', home: 7, away: 4 },
          { label: 'Fouls', home: 9, away: 12 },
        ].map((stat, i) => (
          <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: 'var(--font-sm)' }}>
              <span style={{ fontWeight: 600 }}>{stat.home}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              <span style={{ fontWeight: 600 }}>{stat.away}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
              <div style={{ flex: stat.home, background: 'var(--accent-green)', borderRadius: '2px' }}></div>
              <div style={{ flex: stat.away, background: 'var(--accent-blue)', borderRadius: '2px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
