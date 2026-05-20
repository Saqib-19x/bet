import { useEffect, useState } from 'react';
import {
  RefreshCw, AlertTriangle, TrendingUp, Users, Activity, Wallet,
  ChevronDown, Send, Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { admin as adminApi } from '../../api/client';
import { Skeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { useSocketEvent } from '../../lib/socket';

function inr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="stat-card" style={{ borderColor: accent ? `${accent}33` : undefined }}>
      <div className="stat-icon" style={{ color: accent }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function MatchExposureCard({ match, expanded, onToggle }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-md) var(--space-lg)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          borderBottom: expanded ? '1px solid var(--border-color)' : 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700 }}>{match.teamA?.name} vs {match.teamB?.name}</span>
            {match.status === 'live' ? (
              <span className="badge badge-live">LIVE</span>
            ) : (
              <span className="badge" style={{ background: 'var(--bg-tertiary)', fontSize: 10 }}>
                {match.status?.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {match.league} · {new Date(match.startTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {match.markets.length} markets
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Staked
            </div>
            <div style={{ fontWeight: 700 }}>{inr(match.totalStaked)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Worst case
            </div>
            <div style={{
              fontWeight: 700,
              color: match.maxExposure > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
            }}>
              {match.maxExposure > 0 ? `−${inr(match.maxExposure)}` : inr(0)}
            </div>
          </div>
          <ChevronDown
            size={16}
            style={{
              color: 'var(--text-tertiary)',
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {match.markets.length === 0 ? (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>No open markets.</div>
          ) : match.markets.map((mk) => (
            <div key={mk._id} style={{
              padding: 'var(--space-sm) var(--space-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                  {mk.name}
                  {mk.isFancy && <span style={{ color: 'var(--accent-yellow)', marginLeft: 6 }}>★</span>}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Book: {inr(mk.totalStaked)}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(mk.options.length, 4)}, 1fr)`, gap: 8 }}>
                {mk.options.map((o) => {
                  const isRisky = o.liability > 0;
                  return (
                    <div key={o._id} style={{
                      padding: '6px 8px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 6,
                      border: isRisky ? '1px solid rgba(255,82,82,0.3)' : '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.label}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        {o.totalBets} bets · {inr(o.totalStaked)} staked
                      </div>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 800,
                        marginTop: 2,
                        color: isRisky ? 'var(--accent-red)' : 'var(--accent-green)',
                      }}>
                        {isRisky ? `−${inr(o.liability)}` : `+${inr(-o.liability)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickRecharge({ onDone }) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setMsg(''); setError('');
    if (!phone.trim()) return setError('Phone (or email in the same field) required.');
    if (!parseFloat(amount)) return setError('Amount required.');
    setBusy(true);
    try {
      const lookup = phone.includes('@') ? { email: phone } : { phone };
      const res = await adminApi.quickRecharge({ ...lookup, amount: parseFloat(amount), note });
      setMsg(`${res.user.name}: ${inr(res.balanceBefore)} → ${inr(res.balanceAfter)}`);
      setAmount(''); setNote('');
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Wallet size={16} style={{ color: 'var(--accent-green)' }} />
        <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Quick Recharge
        </h3>
      </div>
      {error && <div style={{ marginBottom: 8, fontSize: 'var(--font-sm)', color: '#f44336' }}>{error}</div>}
      {msg && <div style={{ marginBottom: 8, fontSize: 'var(--font-sm)', color: 'var(--accent-green)' }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Phone or email"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ flex: '2 1 200px' }}
        />
        <input
          type="number"
          className="input-field"
          placeholder="Amount (+/-)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ flex: '1 1 120px' }}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ flex: '1 1 160px' }}
        />
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          <Send size={14} /> {busy ? 'Saving…' : 'Apply'}
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
        Use +amount to credit, -amount to debit. User gets a balance update over socket.
      </p>
    </div>
  );
}

export default function RiskDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const load = async () => {
    try {
      const res = await adminApi.risk();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Live-update: any new bet or balance change → re-poll silently
  useSocketEvent('balance:update', () => load());
  useSocketEvent('bet:settled', () => load());

  // Periodic refresh — every 20s
  useEffect(() => {
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Skeleton width={240} height={32} radius={8} style={{ marginBottom: 8 }} />
        <Skeleton width={360} height={16} style={{ marginBottom: 'var(--space-xl)' }} />
        <div className="admin-grid">
          {[0,1,2,3].map((i) => (
            <div key={i} className="stat-card">
              <Skeleton width={28} height={28} radius={6} style={{ marginBottom: 12 }} />
              <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={28} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div style={{ padding: 40, color: '#f44336' }}>{error}</div>;
  if (!data) return null;

  const { totals, matches, topPositions, imbalanced } = data;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Risk & Exposure</h1>
          <p className="page-subtitle">Live operator view — refreshes every 20s</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="admin-grid">
        <StatCard
          icon={<Activity size={20} />}
          label="Open Matches"
          value={totals.openMatches}
          accent="var(--accent-blue)"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Open Bets"
          value={totals.openBets}
          accent="var(--accent-green)"
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Total Staked"
          value={inr(totals.totalStaked)}
          accent="var(--accent-yellow)"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Worst-case Liability"
          value={totals.worstCaseExposure > 0 ? `−${inr(totals.worstCaseExposure)}` : inr(0)}
          accent="var(--accent-red)"
        />
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <QuickRecharge onDone={load} />
      </div>

      {/* Imbalanced markets — warnings */}
      {imbalanced.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-md) var(--space-lg)', borderColor: 'rgba(255,193,7,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} style={{ color: '#ffc107' }} />
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#ffc107' }}>
              Imbalanced markets ({imbalanced.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {imbalanced.map((im) => (
              <Link
                key={im.marketId}
                to="/admin/odds"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{im.marketName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {im.skewedPct}% on "{im.skewedOption}" · book {inr(im.totalStaked)}
                  </div>
                </div>
                <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
                  −{inr(im.liability)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Per-match exposure */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Per-match Exposure
        </h2>
        {matches.length === 0 ? (
          <EmptyState preset="matches" compact />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {matches.map((m) => (
              <MatchExposureCard
                key={m._id}
                match={m}
                expanded={!!expanded[m._id]}
                onToggle={() => setExpanded((p) => ({ ...p, [m._id]: !p[m._id] }))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top open positions */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Top Open Positions
        </h2>
        {topPositions.length === 0 ? (
          <div className="card" style={{ color: 'var(--text-tertiary)' }}>No open bets.</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Match · Market</th>
                  <th>Selection</th>
                  <th>Odds</th>
                  <th>Stake</th>
                  <th>Potential</th>
                </tr>
              </thead>
              <tbody>
                {topPositions.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontSize: 'var(--font-sm)' }}>{b.userId?.name || b.userId?.email || '—'}</td>
                    <td>
                      <span className="badge" style={{
                        background: b.betType === 'multi' ? 'rgba(179,136,255,0.15)' : 'var(--bg-tertiary)',
                        color: b.betType === 'multi' ? '#b388ff' : 'var(--text-secondary)',
                        fontSize: 10,
                      }}>
                        {b.betType === 'multi' ? 'BUILDER' : 'SINGLE'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-sm)' }}>
                      <div>{b.matchTitle?.replace(/^Bet Builder: /, '')}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{b.marketName}</div>
                    </td>
                    <td style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{b.selection}</td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{b.odds.toFixed(2)}</td>
                    <td>{inr(b.stake)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-red)' }}>−{inr(b.potentialWin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
