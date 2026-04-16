import { useState, useEffect } from 'react';
import { Tv, Zap, TrendingUp } from 'lucide-react';
import { liveMatches } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function LiveBetting({ onAddSelection }) {
  const [matches, setMatches] = useState(liveMatches);
  const [selectedSport, setSelectedSport] = useState('all');

  // Simulate live odds changes
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prev => prev.map(m => ({
        ...m,
        odds: {
          home: +(m.odds.home + (Math.random() - 0.5) * 0.1).toFixed(2),
          draw: m.odds.draw ? +(m.odds.draw + (Math.random() - 0.5) * 0.1).toFixed(2) : null,
          away: +(m.odds.away + (Math.random() - 0.5) * 0.1).toFixed(2),
        }
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sportFilters = ['all', ...new Set(liveMatches.map(m => m.sport))];
  const filtered = selectedSport === 'all' ? matches : matches.filter(m => m.sport === selectedSport);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
        <div className="live-dot" style={{ width: 12, height: 12 }}></div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Live Betting</h1>
        <span className="badge badge-live" style={{ fontSize: 'var(--font-sm)' }}>{matches.length} Live</span>
      </div>
      <p className="page-subtitle">Bet on live events with real-time odds updates</p>

      {/* Sport Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        {sportFilters.map(sport => (
          <button
            key={sport}
            className={`tab ${selectedSport === sport ? 'active' : ''}`}
            onClick={() => setSelectedSport(sport)}
            style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
          >
            {sport === 'all' ? '🔥 All Live' : sport}
          </button>
        ))}
      </div>

      {/* Live Matches */}
      <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
        {filtered.map(match => (
          <div key={match.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div className="live-dot"></div>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-red)', fontWeight: 600 }}>LIVE</span>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>•</span>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{match.league}</span>
                </div>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-yellow)', fontWeight: 600 }}>{match.time}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2xl)' }}>
                {/* Teams & Score */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>{match.teamA}</span>
                    <span style={{ fontWeight: 800, fontSize: 'var(--font-xl)', color: 'var(--accent-green)' }}>{match.scoreA}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>{match.teamB}</span>
                    <span style={{ fontWeight: 800, fontSize: 'var(--font-xl)', color: 'var(--accent-green)' }}>{match.scoreB}</span>
                  </div>
                </div>

                {/* Odds */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="odds-btn" onClick={() => onAddSelection({
                    id: `live-${match.id}-home`, match: `${match.teamA} vs ${match.teamB}`,
                    selection: match.teamA, odds: match.odds.home,
                  })}>
                    <span className="odds-label">1</span>
                    <span className="odds-value" style={{ transition: 'color 0.3s' }}>{match.odds.home.toFixed(2)}</span>
                  </button>
                  {match.odds.draw && (
                    <button className="odds-btn" onClick={() => onAddSelection({
                      id: `live-${match.id}-draw`, match: `${match.teamA} vs ${match.teamB}`,
                      selection: 'Draw', odds: match.odds.draw,
                    })}>
                      <span className="odds-label">X</span>
                      <span className="odds-value">{match.odds.draw.toFixed(2)}</span>
                    </button>
                  )}
                  <button className="odds-btn" onClick={() => onAddSelection({
                    id: `live-${match.id}-away`, match: `${match.teamA} vs ${match.teamB}`,
                    selection: match.teamB, odds: match.odds.away,
                  })}>
                    <span className="odds-label">2</span>
                    <span className="odds-value">{match.odds.away.toFixed(2)}</span>
                  </button>
                </div>
              </div>
            </div>
            <Link
              to="/match/1"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px', background: 'var(--bg-tertiary)', fontSize: 'var(--font-sm)',
                color: 'var(--text-secondary)', fontWeight: 600,
                transition: 'all var(--transition-fast)'
              }}
            >
              <TrendingUp size={14} /> View all markets
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
