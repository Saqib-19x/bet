import { Search, ChevronDown, LogOut, PiggyBank, BanknoteArrowDown } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bets as betsApi } from '../api/client';
import NotificationCenter from './NotificationCenter';

// Only sports the backend actually supports (Match.js sport enum) get a nav
// entry — a link to a sport with no markets behind it is worse than no link.
const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/live', label: 'In-Play' },
  { to: '/sports?sport=cricket', label: 'Cricket' },
  { to: '/sports?sport=football', label: 'Football' },
  { to: '/sports?sport=tennis', label: 'Tennis' },
  { to: '/sports?sport=basketball', label: 'Basketball' },
  { to: '/sports?sport=baseball', label: 'Baseball' },
  { to: '/sports?sport=hockey', label: 'Hockey' },
  { to: '/sports?sport=mma', label: 'MMA' },
  { to: '/sports?sport=esports', label: 'Esports' },
  { to: '/bet-history', label: 'Bet History' },
  { to: '/account-statement', label: 'Statement' },
];

const TICKER = [
  'Welcome to BetKing — live cricket markets are open now',
  'Deposits and withdrawals are processed 24x7',
  'Bet responsibly. 18+ only.',
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // There's no `exposure` field on the user — it's the sum of `stake` (the
  // at-risk amount, per Bet.js) across still-open bets. Refetched on balance
  // change, since settling a bet moves money and frees exposure together.
  const [exposure, setExposure] = useState(0);
  useEffect(() => {
    let alive = true;
    betsApi.list({ status: 'open' })
      .then((res) => {
        if (!alive) return;
        const open = res.bets || [];
        setExposure(open.reduce((sum, b) => sum + (b.stake || 0), 0));
      })
      .catch(() => { if (alive) setExposure(0); });
    return () => { alive = false; };
  }, [user?.balance]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const money = (n) => (n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header className="xc-header" id="main-header">
      {/* Row 1 — brand, cashier, balance, account */}
      <div className="xc-topbar">
        <Link to="/" className="xc-logo">BET<span>KING</span></Link>

        <Link to="/deposit" className="xc-pill xc-pill-deposit">
          <PiggyBank size={16} /> DEPOSIT
        </Link>
        <Link to="/wallet" className="xc-pill xc-pill-withdraw">
          <BanknoteArrowDown size={16} /> WITHDRAWAL
        </Link>

        <div className="xc-topbar-spacer" />

        <button
          type="button"
          className="xc-user"
          onClick={() => navigate('/sports')}
          aria-label="Search events"
        >
          <Search size={18} />
        </button>

        <Link to="/my-bets" className="xc-rules">Rules</Link>

        <NotificationCenter />

        <div className="xc-balance">
          <div>Balance: <b>{money(user?.balance)}</b></div>
          <div><u>Exposure: {money(exposure)}</u></div>
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen((o) => !o)} className="xc-user">
            {user?.name || 'Account'} <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', minWidth: 180, zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)', padding: 'var(--space-xs)',
            }}>
              <Link to="/profile" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}>
                Profile
              </Link>
              <Link to="/my-bets" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}>
                My Bets
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}>
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#f44336',
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — scrolling notice ticker */}
      <div className="xc-ticker">
        <div className="xc-ticker-track">
          {TICKER.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* Row 3 — sports nav */}
      <nav className="xc-nav">
        {NAV.map((item) => (
          <NavLink key={item.label} to={item.to} end={item.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
