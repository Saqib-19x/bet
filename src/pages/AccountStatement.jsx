import { useEffect, useMemo, useState } from 'react';
import { TODAY, DAYS_AGO } from '../lib/dateFormat';
import { wallet as walletApi } from '../api/client';

const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'bet', label: 'Bet' },
  { id: 'win', label: 'Win' },
  { id: 'refund', label: 'Refund' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'adjustment', label: 'Adjustment' },
];

// The endpoint paginates and has no date-range filter, so we pull a generous
// page and narrow it here. PAGE_CAP is surfaced in the UI when it's hit, so a
// truncated statement never reads as a complete one.
const PAGE_CAP = 500;

const money = (n) => Number(n ?? 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

export default function AccountStatement() {
  const [from, setFrom] = useState(DAYS_AGO(14));
  const [to, setTo] = useState(TODAY);
  const [type, setType] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [truncated, setTruncated] = useState(false);

  // Fetching lives in the effect, keyed on `reqId`. Submit bumps reqId (an
  // event handler, so setting `loading` there is fine) — this keeps the effect
  // free of synchronous setState while preserving the explicit Submit flow.
  const [reqId, setReqId] = useState(0);

  useEffect(() => {
    let alive = true;
    const params = { limit: PAGE_CAP };
    if (type !== 'all') params.type = type;
    walletApi.transactions(params)
      .then((res) => {
        if (!alive) return;
        const list = res.transactions || [];
        setRows(list);
        setTruncated((res.pagination?.total || 0) > list.length);
      })
      .catch((err) => { if (alive) setError(err.message || 'Could not load statement'); })
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
    return rows.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= start && d <= end;
    });
  }, [rows, from, to]);

  return (
    <div className="xc-page xc-panel">
      <div className="xc-panel-head">Account Statement</div>

      <div className="xc-panel-body">
        <div className="xc-filters">
          <input type="date" className="xc-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="xc-input" value={to} onChange={(e) => setTo(e.target.value)} />
          <select className="xc-input" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <button className="xc-submit" onClick={submit} disabled={loading}>
            {loading ? 'Loading…' : 'Submit'}
          </button>
        </div>

        {truncated && (
          <div className="xc-grid-empty">
            Showing the most recent {PAGE_CAP} entries — older ones are not included.
          </div>
        )}

        <table className="xc-grid">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Date</th>
              <th>Credit</th>
              <th>Debit</th>
              <th>Balance</th>
              <th>Sports</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              // The balance delta is authoritative for direction — `type` alone
              // can't tell you which way an `adjustment` went.
              const delta = (t.balanceAfter ?? 0) - (t.balanceBefore ?? 0);
              return (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td>{new Date(t.createdAt).toLocaleString('en-IN', { hour12: false })}</td>
                  <td className={delta > 0 ? 'xc-credit' : undefined}>
                    {delta > 0 ? money(delta) : '-'}
                  </td>
                  <td className={delta < 0 ? 'xc-debit' : undefined}>
                    {delta < 0 ? money(delta) : '-'}
                  </td>
                  <td className="xc-credit">{money(t.balanceAfter)}</td>
                  <td>{t.type === 'bet' || t.type === 'win' ? 'Sportsbook' : ''}</td>
                  <td className="xc-left">
                    <span className="xc-remark">
                      {t.description || t.reference || t.type}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {error && <div className="xc-grid-empty">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="xc-grid-empty">No transactions in this date range.</div>
        )}
      </div>
    </div>
  );
}
