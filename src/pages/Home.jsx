import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { matches as matchesApi } from '../api/client';
import { useSocketEvent } from '../lib/socket';
import OddsTable from '../components/exchange/OddsTable';
import { fmtTime } from '../lib/dateFormat';

const TABS = [
  { id: 'inplay', label: 'In-Play' },
  { id: 'all', label: 'All' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'baseball', label: 'Baseball' },
  { id: 'hockey', label: 'Hockey' },
  { id: 'mma', label: 'MMA' },
  { id: 'esports', label: 'Esports' },
];

export default function Home({ onAddSelection }) {
  const [live, setLive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inplay');

  useEffect(() => {
    let alive = true;
    Promise.all([matchesApi.live(), matchesApi.upcoming()])
      .then(([liveRes, upRes]) => {
        if (!alive) return;
        setLive(liveRes.matches || []);
        setUpcoming(upRes.matches || []);
      })
      .catch((err) => console.error('Failed to load matches', err))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useSocketEvent('match:scoreUpdate', (payload) => {
    setLive((prev) => prev.map((m) =>
      m._id === payload.matchId
        ? { ...m, scoreA: payload.scoreA, scoreB: payload.scoreB, status: payload.status }
        : m
    ));
  });

  const liveIds = useMemo(() => new Set(live.map((m) => m._id)), [live]);

  const rows = useMemo(() => {
    const all = [...live, ...upcoming];
    if (tab === 'inplay') return live;
    if (tab === 'all') return all;
    return all.filter((m) => m.sport === tab);
  }, [tab, live, upcoming]);

  return (
    <div className="xc-page">
      {upcoming.length > 0 && (
        <div className="xc-chips">
          {upcoming.slice(0, 10).map((m) => (
            <Link key={m._id} to={`/match/${m._id}`} className="xc-chip">
              <div className="xc-chip-name">{m.teamA?.name} V {m.teamB?.name}</div>
              <span className="xc-chip-time">{fmtTime(m.startTime)}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="xc-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`xc-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <OddsTable
        matches={rows}
        liveIds={liveIds}
        onAddSelection={onAddSelection}
        loading={loading}
      />
    </div>
  );
}
