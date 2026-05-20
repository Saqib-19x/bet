import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { matches as matchesApi } from '../api/client';
import { useSocketEvent } from '../lib/socket';
import TeamLogo from '../components/TeamLogo';
import { MatchCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

function formatScore(score) {
  if (!score) return '—';
  if (typeof score === 'object') {
    if (score.runs !== undefined) return `${score.runs}/${score.wickets ?? 0}${score.overs ? ` (${score.overs})` : ''}`;
    return JSON.stringify(score);
  }
  return String(score);
}

export default function LiveBetting({ onAddSelection }) {
  const [matches, setMatches] = useState([]);
  const [selectedSport, setSelectedSport] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchesApi.live()
      .then((res) => setMatches(res.matches || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useSocketEvent('match:scoreUpdate', (payload) => {
    setMatches((prev) => prev.map((m) =>
      m._id === payload.matchId
        ? { ...m, scoreA: payload.scoreA, scoreB: payload.scoreB, status: payload.status }
        : m
    ).filter((m) => m.status === 'live'));
  });

  useSocketEvent('odds:update', (payload) => {
    setMatches((prev) => prev.map((m) =>
      m._id === payload.matchId ? { ...m, odds: payload.odds || m.odds } : m
    ));
  });

  const sportSet = ['all', ...new Set(matches.map((m) => m.sport).filter(Boolean))];
  const filtered = selectedSport === 'all' ? matches : matches.filter((m) => m.sport === selectedSport);

  const oddsButton = (match, side, label) => {
    const odds = match.odds?.[side];
    if (!odds) return null;
    const teamA = match.teamA?.name;
    const teamB = match.teamB?.name;
    const selection = side === 'home' ? teamA : side === 'away' ? teamB : 'Draw';
    return (
      <button className="odds-btn" onClick={() => onAddSelection({
        id: `live-${match._id}-${side}`,
        matchId: match._id,
        match: `${teamA} vs ${teamB}`,
        selection,
        odds,
      })}>
        <span className="odds-label">{label}</span>
        <span className="odds-value">{odds.toFixed(2)}</span>
      </button>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
        <div className="live-dot" style={{ width: 12, height: 12 }}></div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Live Betting</h1>
        <span className="badge badge-live" style={{ fontSize: 'var(--font-sm)' }}>{matches.length} Live</span>
      </div>
      <p className="page-subtitle">Bet on live events with real-time odds updates</p>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        {sportSet.map((sport) => (
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

      {loading ? (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {[0,1,2].map((i) => <MatchCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState preset="liveMatches" />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {filtered.map((match) => (
            <div key={match._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div className="live-dot"></div>
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-red)', fontWeight: 600 }}>LIVE</span>
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>•</span>
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{match.league}</span>
                  </div>
                  {match.currentOver && (
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-yellow)', fontWeight: 600 }}>{match.currentOver} ov</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2xl)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 'var(--font-md)' }}>
                        <TeamLogo name={match.teamA?.name} logo={match.teamA?.logo} size={32} />
                        {match.teamA?.name}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 'var(--font-xl)', color: 'var(--accent-green)' }}>
                        {formatScore(match.scoreA)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 'var(--font-md)' }}>
                        <TeamLogo name={match.teamB?.name} logo={match.teamB?.logo} size={32} />
                        {match.teamB?.name}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 'var(--font-xl)', color: 'var(--accent-green)' }}>
                        {formatScore(match.scoreB)}
                      </span>
                    </div>
                  </div>

                  {(match.odds?.home || match.odds?.away) && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      {oddsButton(match, 'home', '1')}
                      {oddsButton(match, 'draw', 'X')}
                      {oddsButton(match, 'away', '2')}
                    </div>
                  )}
                </div>
              </div>
              <Link
                to={`/match/${match._id}`}
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
      )}
    </div>
  );
}
