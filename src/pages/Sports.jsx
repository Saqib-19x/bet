import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { sports, upcomingMatches, liveMatches } from '../data/mockData';

const allMatches = [...liveMatches, ...upcomingMatches];

export default function Sports({ onAddSelection }) {
  const [activeSport, setActiveSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = allMatches.filter(m => {
    const matchesSport = activeSport === 'all' || m.sport === activeSport;
    const matchesSearch = searchQuery === '' ||
      m.teamA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.teamB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.league.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Sports</h1>
      <p className="page-subtitle">Browse all available events and place your bets</p>

      {/* Sport Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-xl)' }}>
        <button
          className={`tab ${activeSport === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSport('all')}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          All Sports
        </button>
        {sports.map(sport => (
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

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-xl)', maxWidth: '400px' }}>
        <div className="input-with-icon">
          <Search size={16} className="input-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search teams, leagues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Matches Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
            {filtered.map(match => (
              <tr key={match.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{match.teamA}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>vs {match.teamB}</div>
                </td>
                <td>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{match.league}</span>
                </td>
                <td>
                  {match.isLive ? (
                    <span className="badge badge-live"><div className="live-dot" style={{ width: 6, height: 6 }}></div> {match.time}</span>
                  ) : (
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {new Date(match.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="odds-btn" onClick={() => onAddSelection({
                    id: `${match.id}-home`, match: `${match.teamA} vs ${match.teamB}`,
                    selection: match.teamA, odds: match.odds.home
                  })}>
                    <span className="odds-value">{match.odds.home.toFixed(2)}</span>
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {match.odds.draw ? (
                    <button className="odds-btn" onClick={() => onAddSelection({
                      id: `${match.id}-draw`, match: `${match.teamA} vs ${match.teamB}`,
                      selection: 'Draw', odds: match.odds.draw
                    })}>
                      <span className="odds-value">{match.odds.draw.toFixed(2)}</span>
                    </button>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="odds-btn" onClick={() => onAddSelection({
                    id: `${match.id}-away`, match: `${match.teamA} vs ${match.teamB}`,
                    selection: match.teamB, odds: match.odds.away
                  })}>
                    <span className="odds-value">{match.odds.away.toFixed(2)}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
