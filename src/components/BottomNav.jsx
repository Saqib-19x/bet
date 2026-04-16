import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, Tv, TicketCheck, Wallet, LayoutDashboard, Users, Sliders, Receipt, Settings } from 'lucide-react';

const userItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/sports', icon: Trophy, label: 'Sports' },
  { path: '/live', icon: Tv, label: 'Live' },
  { path: '/my-bets', icon: TicketCheck, label: 'My Bets' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
];

const adminItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/bets', icon: TicketCheck, label: 'Bets' },
  { path: '/admin/transactions', icon: Receipt, label: 'Txns' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const items = isAdmin ? adminItems : userItems;

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/' || item.path === '/admin'}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
