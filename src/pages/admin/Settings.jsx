import { useState, useEffect } from 'react';
import { RefreshCw, Download, Power, AlertTriangle } from 'lucide-react';
import { admin as adminApi } from '../../api/client';

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await adminApi.scraperStatus();
      setStatus(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async () => {
    setBusy(true);
    setInfo('');
    setError('');
    try {
      const res = await adminApi.toggleScraper(!status.enabled);
      setStatus((s) => ({ ...s, enabled: res.enabled }));
      setInfo(`Scheduler ${res.enabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fetchNow = async () => {
    setBusy(true);
    setInfo('');
    setError('');
    try {
      const res = await adminApi.fetchScraper();
      setInfo(`Sync complete: ${res.result?.created || 0} new, ${res.result?.updated || 0} updated, ${res.result?.synced || 0} total.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Platform Settings</h1>
      <p className="page-subtitle">Manage the data scraper and platform info</p>

      {error && <div style={{ marginBottom: 'var(--space-md)', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(244,67,54,0.1)', color: '#f44336' }}>{error}</div>}
      {info && <div style={{ marginBottom: 'var(--space-md)', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(0,230,118,0.1)', color: 'var(--accent-green)' }}>{info}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xl)' }}>
            <Power size={18} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontWeight: 700 }}>Cricket Scraper</h3>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-secondary)' }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>API Key</span>
                  <span style={{ fontWeight: 700, color: status?.apiKeySet ? 'var(--accent-green)' : '#f44336' }}>
                    {status?.apiKeySet ? 'Configured' : 'Not set'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Scheduler</span>
                  <span style={{ fontWeight: 700, color: status?.enabled ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                    {status?.enabled ? 'Running' : 'Paused'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={toggle} disabled={busy}>
                  <Power size={14} /> {status?.enabled ? 'Pause Scheduler' : 'Start Scheduler'}
                </button>
                <button className="btn btn-secondary" onClick={fetchNow} disabled={busy}>
                  <Download size={14} /> Fetch Now
                </button>
                <button className="btn btn-secondary" onClick={load} disabled={busy}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <p style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                Free tier: 100 requests/day. The scheduler polls live scores every 30s — leave it paused unless an IPL match is live.
              </p>
            </>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xl)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-yellow)' }} />
            <h3 style={{ fontWeight: 700 }}>Configured via .env</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-md)' }}>
            Betting limits, overround targets, and exposure caps are configured server-side via environment variables.
            Edit <code>play_backend/.env</code> and restart the server.
          </p>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            {[
              { k: 'DEFAULT_OVERROUND', desc: 'Target overround % for new markets' },
              { k: 'MIN_OVERROUND', desc: 'Minimum allowed overround on market creation' },
              { k: 'MAX_BET_PER_USER', desc: 'Hard cap on a single bet' },
              { k: 'MAX_MARKET_EXPOSURE', desc: 'Auto-reject bets that push exposure past this' },
              { k: 'CRICKET_API_KEY', desc: 'CricAPI key for live data' },
            ].map((row) => (
              <div key={row.k} style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <code style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-green)', fontWeight: 700 }}>{row.k}</code>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{row.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
