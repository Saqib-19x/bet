import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, PiggyBank, BanknoteArrowDown,
  LayoutDashboard, Users, Receipt, Sliders, TicketCheck, AlertTriangle, Settings, Zap, Landmark,
} from 'lucide-react';

// Mirrors the Match.js sport enum — these are the only sports the API can
// actually return events for.
const SPORTS = [
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'baseball', label: 'Baseball' },
  { id: 'hockey', label: 'Hockey' },
  { id: 'mma', label: 'Mixed Martial Arts' },
  { id: 'esports', label: 'Esports' },
];

const OTHERS = [
  { to: '/bet-history', label: 'Bet History' },
  { to: '/account-statement', label: 'Account Statement' },
  { to: '/my-bets', label: 'My Bets' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/profile', label: 'Profile' },
];

const adminNav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/risk', icon: AlertTriangle, label: 'Risk' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/bets', icon: TicketCheck, label: 'Bets' },
  { path: '/admin/odds', icon: Sliders, label: 'Odds' },
  { path: '/admin/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/admin/payment-accounts', icon: Landmark, label: 'Payment Accounts' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [sportsOpen, setSportsOpen] = useState(true);
  const [othersOpen, setOthersOpen] = useState(false);

  // Admin keeps its own flat nav — the sports tree is meaningless there.
  if (isAdmin) {
    return (
      <aside className="xc-sidebar" id="main-sidebar">
        <div className="xc-side-label">Admin</div>
        {adminNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => `xc-side-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={15} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <div className="xc-side-label">Platform</div>
        <Link to="/" className="xc-side-item"><Zap size={15} /> Back to App</Link>
      </aside>
    );
  }

  return (
    <aside className="xc-sidebar" id="main-sidebar">
      <Link to="/deposit" className="xc-side-action xc-side-deposit">
        <PiggyBank size={17} /> Deposit
      </Link>
      <Link to="/wallet" className="xc-side-action xc-side-withdraw">
        <BanknoteArrowDown size={17} /> Withdraw
      </Link>

      <button className="xc-side-head" onClick={() => setOthersOpen((o) => !o)}>
        Others {othersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {othersOpen && OTHERS.map((o) => (
        <NavLink
          key={o.to}
          to={o.to}
          className={({ isActive }) => `xc-side-item${isActive ? ' active' : ''}`}
        >
          <span className="xc-side-plus">+</span>
          <span>{o.label}</span>
        </NavLink>
      ))}

      <button className="xc-side-head" onClick={() => setSportsOpen((o) => !o)}>
        All Sports {sportsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {sportsOpen && SPORTS.map((s) => (
        <NavLink
          key={s.id}
          to={`/sports?sport=${s.id}`}
          className={({ isActive }) => `xc-side-item${isActive ? ' active' : ''}`}
        >
          <span className="xc-side-plus">+</span>
          <span>{s.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
