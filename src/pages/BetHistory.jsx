import { useEffect, useMemo, useState } from 'react';
import { TODAY, DAYS_AGO } from '../lib/dateFormat';
import { bets as betsApi } from '../api/client';

const STATUSES = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Matched (open)' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
  { id: 'cashout', label: 'Cashed out' },
  { id: 'cancelled', label: 'Cancelled' },
];

const SPORTS = ['all', 'cricket', 'football', 'tennis', 'basketball', 'baseball', 'hockey', 'mma', 'esports'];

const PAGE_CAP = 500;

const money = (n) => Number(n ?? 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

/**
 * Realised P/L. `payout` is what was credited on settlement and `stake` is the
 * amount at risk (Bet.js), so profit is payout − stake for anything settled.
 * Open bets have no realised result yet, so they show a dash rather than a 0
 * that would read as "broke even".
 */
function profitLoss(bet) {
  if (bet.status === 'open') return null;
  if (bet.status === 'cancelled') return 0;
  return (bet.payout ?? 0) - (bet.stake ?? 0);
}

export default function BetHistory() {
  const [from, setFrom] = useState(DAYS_AGO(7));
  const [to, setTo] = useState(TODAY);
  const [sport, setSport] = useState('all');
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [truncated, setTruncated] = useState(false);

  // See AccountStatement — fetch keyed on reqId so the effect never sets state
  // synchronously; Submit bumps it from an event handler.
  const [reqId, setReqId] = useState(0);

  useEffect(() => {
    let alive = true;
    const params = { limit: PAGE_CAP };
    if (status !== 'all') params.status = status;
    betsApi.list(params)
      .then((res) => {
        if (!alive) return;
        const list = res.bets || [];
        setRows(list);
        setTruncated((res.pagination?.total || 0) > list.length);
      })
      .catch((err) => { if (alive) setError(err.message || 'Could not load bet history'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [reqId]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    setLoading(true);
    setError('');
    setReqId((n) => n + 1);
  };

  const filtered = useMemo(() => {
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T23:59:59`);
    return rows.filter((b) => {
      if (sport !== 'all' && b.sport !== sport) return false;
      const d = new Date(b.createdAt);
      return d >= start && d <= end;
    });
  }, [rows, from, to, sport]);

  return (
    <div className="xc-page xc-panel">
      <div className="xc-panel-head">Bet History</div>

      <div className="xc-panel-body">
        <div className="xc-filters">
          <select className="xc-input" value={sport} onChange={(e) => setSport(e.target.value)}>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Sports' : s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select className="xc-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <input type="date" className="xc-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="xc-input" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="xc-submit" onClick={submit} disabled={loading}>
            {loading ? 'Loading…' : 'Submit'}
          </button>
        </div>

        {truncated && (
          <div className="xc-grid-empty">
            Showing the most recent {PAGE_CAP} bets — older ones are not included.
          </div>
        )}

        <table className="xc-grid">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Nation</th>
              <th>Bet Type</th>
              <th>User Rate</th>
              <th>Amount</th>
              <th>Profit/loss</th>
              <th>Place Date</th>
              <th>Match Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const pl = profitLoss(b);
              return (
                <tr key={b._id} className={b.side === 'lay' ? 'xc-row-lay' : 'xc-row-back'}>
                  <td>{b.matchTitle}</td>
                  <td>{b.selection}{b.marketName ? ` (${b.marketName})` : ''}</td>
                  <td>{b.side}</td>
                  <td>{Number(b.odds).toFixed(2)}</td>
                  <td>{money(b.stake)}</td>
                  <td className={pl == null ? undefined : pl >= 0 ? 'xc-pl-win' : 'xc-pl-loss'}>
                    {pl == null ? '—' : money(pl)}
                  </td>
                  <td>{new Date(b.createdAt).toLocaleString('en-IN', { hour12: false })}</td>
                  {/* The bets endpoint doesn't populate the match, so there's
                      no start time to show here. */}
                  <td>—</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {error && <div className="xc-grid-empty">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="xc-grid-empty">No bets in this date range.</div>
        )}
      </div>
    </div>
  );
}
