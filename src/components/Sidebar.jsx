import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Trophy, Tv, TicketCheck, Wallet, User, Settings,
  LayoutDashboard, Users, Receipt, Sliders, BarChart3, Zap, Shield, AlertTriangle
} from 'lucide-react';
import BrandMark from './BrandMark';
import { useAuth } from '../contexts/AuthContext';

const userNav = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/sports', icon: Trophy, label: 'Sports' },
  { path: '/live', icon: Tv, label: 'Live Betting', badge: '5' },
  { path: '/my-bets', icon: TicketCheck, label: 'My Bets' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const adminNav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/risk', icon: AlertTriangle, label: 'Risk' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/bets', icon: TicketCheck, label: 'Bets' },
  { path: '/admin/odds', icon: Sliders, label: 'Odds' },
  { path: '/admin/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminUser = user?.role === 'admin';
  const isAdmin = location.pathname.startsWith('/admin');
  const nav = isAdmin ? adminNav : userNav;

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BrandMark size={22} color="#0a1612" strokeWidth={2.2} />
        </div>
        <h1>BetKing</h1>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">{isAdmin ? 'Admin' : 'Menu'}</div>
          {nav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/' || item.path === '/admin'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        {!isAdmin && isAdminUser && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Quick Links</div>
            <NavLink to="/admin" className="nav-link">
              <Shield size={18} />
              <span>Admin Panel</span>
            </NavLink>
          </div>
        )}

        {isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Platform</div>
            <NavLink to="/" className="nav-link">
              <Zap size={18} />
              <span>Back to App</span>
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
}
