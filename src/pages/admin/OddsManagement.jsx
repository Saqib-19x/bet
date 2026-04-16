import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { liveMatches, upcomingMatches } from '../../data/mockData';

const allEvents = [...liveMatches, ...upcomingMatches];

export default function OddsManagement() {
  const [odds, setOdds] = useState(
    Object.fromEntries(allEvents.map(m => [m.id, { ...m.odds }]))
  );

  const updateOdds = (matchId, type, value) => {
    setOdds(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [type]: parseFloat(value) || 0 }
    }));
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Odds Management</h1>
      <p className="page-subtitle">Update and manage odds for all events</p>

      <div className="admin-toolbar">
        <button className="btn btn-primary">
          <Save size={16} /> Save All Changes
        </button>
        <button className="btn btn-secondary">
          <RefreshCw size={16} /> Reset to Default
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" id="odds-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>League</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Home (1)</th>
              <th style={{ textAlign: 'center' }}>Draw (X)</th>
              <th style={{ textAlign: 'center' }}>Away (2)</th>
            </tr>
          </thead>
          <tbody>
            {allEvents.map(match => (
              <tr key={match.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{match.teamA}</div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>vs {match.teamB}</div>
                </td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{match.league}</td>
                <td>
                  {match.isLive ? (
                    <span className="badge badge-live">LIVE</span>
                  ) : (
                    <span className="badge badge-open">Upcoming</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={odds[match.id]?.home || ''}
                    onChange={e => updateOdds(match.id, 'home', e.target.value)}
                    className="input-field"
                    style={{ width: '80px', textAlign: 'center', padding: '6px 10px', fontSize: 'var(--font-sm)' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  {odds[match.id]?.draw !== null ? (
                    <input
                      type="number"
                      step="0.01"
                      value={odds[match.id]?.draw || ''}
                      onChange={e => updateOdds(match.id, 'draw', e.target.value)}
                      className="input-field"
                      style={{ width: '80px', textAlign: 'center', padding: '6px 10px', fontSize: 'var(--font-sm)' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={odds[match.id]?.away || ''}
                    onChange={e => updateOdds(match.id, 'away', e.target.value)}
                    className="input-field"
                    style={{ width: '80px', textAlign: 'center', padding: '6px 10px', fontSize: 'var(--font-sm)' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
