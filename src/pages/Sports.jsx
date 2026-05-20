import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { matches as matchesApi } from '../api/client';
import TeamLogo from '../components/TeamLogo';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const sports = [
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
];

export default function Sports({ onAddSelection }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSport, setActiveSport] = useState(searchParams.get('sport') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = activeSport === 'all' ? {} : { sport: activeSport };
    matchesApi.list(params)
      .then((res) => setMatches(res.matches || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeSport]);

  const filtered = matches.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.teamA?.name || '').toLowerCase().includes(q) ||
      (m.teamB?.name || '').toLowerCase().includes(q) ||
      (m.league || '').toLowerCase().includes(q)
    );
  });

  const oddsBtn = (match, side) => {
    const odds = match.odds?.[side];
    const teamA = match.teamA?.name;
    const teamB = match.teamB?.name;
    if (!odds) return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
    const selection = side === 'home' ? teamA : side === 'away' ? teamB : 'Draw';
    return (
      <button
        className="odds-btn"
        onClick={(e) => {
          e.stopPropagation();
          onAddSelection({
            id: `${match._id}-${side}`,
            matchId: match._id,
            match: `${teamA} vs ${teamB}`,
            selection,
            odds,
          });
        }}
      >
        <span className="odds-value">{odds.toFixed(2)}</span>
      </button>
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Sports</h1>
      <p className="page-subtitle">Browse all available events and place your bets</p>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-xl)' }}>
        <button
          className={`tab ${activeSport === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSport('all')}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          All Sports
        </button>
        {sports.map((sport) => (
          <button
            key={sport.id}
            className={`tab ${activeSport === sport.id ? 'active' : ''}`}
            onClick={() => setActiveSport(sport.id)}
            style={{ borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{sport.icon}</span> {sport.name}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 'var(--space-xl)', maxWidth: '400px' }}>
        <div className="input-with-icon">
          <Search size={16} className="input-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search teams, leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2,3,4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skeleton width={28} height={28} radius={999} />
                <Skeleton width="35%" height={16} />
                <Skeleton width={80} height={14} style={{ marginLeft: 'auto' }} />
                <Skeleton width={48} height={28} radius={6} />
                <Skeleton width={48} height={28} radius={6} />
                <Skeleton width={48} height={28} radius={6} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState preset={searchQuery ? 'search' : 'matches'} compact />
        ) : (
          <table className="data-table" id="sports-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>League</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>1</th>
                <th style={{ textAlign: 'center' }}>X</th>
                <th style={{ textAlign: 'center' }}>2</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((match) => (
                <tr key={match._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/match/${match._id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <TeamLogo name={match.teamA?.name} logo={match.teamA?.logo} size={24} />
                        <TeamLogo name={match.teamB?.name} logo={match.teamB?.logo} size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{match.teamA?.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>vs {match.teamB?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{match.league}</span>
                  </td>
                  <td>
                    {match.status === 'live' ? (
                      <span className="badge badge-live"><div className="live-dot" style={{ width: 6, height: 6 }}></div> LIVE</span>
                    ) : match.status === 'completed' ? (
                      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>Completed</span>
                    ) : (
                      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                        {new Date(match.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{oddsBtn(match, 'home')}</td>
                  <td style={{ textAlign: 'center' }}>{oddsBtn(match, 'draw')}</td>
                  <td style={{ textAlign: 'center' }}>{oddsBtn(match, 'away')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
