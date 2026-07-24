import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { matches as matchesApi } from '../api/client';
import OddsTable from '../components/exchange/OddsTable';

const SPORT_LABEL = {
  all: 'All Sports',
  cricket: 'Cricket',
  football: 'Football',
  tennis: 'Tennis',
  basketball: 'Basketball',
  baseball: 'Baseball',
  hockey: 'Hockey',
  mma: 'Mixed Martial Arts',
  esports: 'Esports',
};

export default function Sports({ onAddSelection }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sport = searchParams.get('sport') || 'all';

  const [matches, setMatches] = useState([]);
  const [live, setLive] = useState([]);
  // Which sport the loaded rows belong to. Deriving `loading` from this
  // avoids a synchronous setState in the effect (which would cascade a render)
  // while still showing the spinner immediately when `sport` changes.
  const [loadedSport, setLoadedSport] = useState(null);
  const [liveOnly, setLiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState('time');
  const [query, setQuery] = useState('');

  const loading = loadedSport !== sport;

  useEffect(() => {
    let alive = true;
    const params = sport === 'all' ? {} : { sport };
    Promise.all([matchesApi.list(params), matchesApi.live(params)])
      .then(([listRes, liveRes]) => {
        if (!alive) return;
        setMatches(listRes.matches || []);
        setLive(liveRes.matches || []);
      })
      .catch((err) => console.error('Failed to load matches', err))
      .finally(() => { if (alive) setLoadedSport(sport); });
    return () => { alive = false; };
  }, [sport]);

  const liveIds = useMemo(() => new Set(live.map((m) => m._id)), [live]);

  const rows = useMemo(() => {
    let out = matches;
    if (liveOnly) out = out.filter((m) => liveIds.has(m._id));
    if (query) {
      const q = query.toLowerCase();
      out = out.filter((m) =>
        (m.teamA?.name || '').toLowerCase().includes(q) ||
        (m.teamB?.name || '').toLowerCase().includes(q) ||
        (m.league || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...out];
    if (sortBy === 'league') {
      sorted.sort((a, b) => (a.league || '').localeCompare(b.league || '')
        || new Date(a.startTime) - new Date(b.startTime));
    } else {
      sorted.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }
    return sorted;
  }, [matches, liveOnly, liveIds, query, sortBy]);

  return (
    <div className="xc-page xc-panel">
      <div className="xc-panel-head">{SPORT_LABEL[sport] || sport}</div>

      <div className="xc-panel-body">
        <div className="xc-filters">
          <input
            className="xc-input"
            placeholder="Search team or league…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="xc-input"
            value={sport}
            onChange={(e) => setSearchParams({ sport: e.target.value })}
          >
            {Object.entries(SPORT_LABEL).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>

          <button
            className={`xc-toggle${liveOnly ? ' active' : ''}`}
            onClick={() => setLiveOnly((v) => !v)}
          >
            • LIVE
          </button>

          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: '#1a1a1a', fontWeight: 600 }}>
            View by:
            <select className="xc-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="time">TIME</option>
              <option value="league">LEAGUE</option>
            </select>
          </span>
        </div>

        <OddsTable
          matches={rows}
          liveIds={liveIds}
          onAddSelection={onAddSelection}
          loading={loading}
          emptyText={liveOnly ? 'No live events right now.' : 'No events for this sport.'}
        />
      </div>
    </div>
  );
}
