import { Search, Bell, Wallet, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header" id="main-header">
      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="input-field"
          placeholder="Search events, teams, leagues..."
        />
      </div>

      <div className="header-actions">
        <Link to="/wallet" className="header-balance">
          <Wallet size={14} />
          <span>₹</span>
          <span className="balance-amount">12,500.00</span>
        </Link>

        <div className="header-notification">
          <Bell size={18} />
          <div className="notif-dot"></div>
        </div>

        <Link to="/profile" className="header-user">
          <div className="header-avatar">RS</div>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>Rahul S.</span>
          <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
        </Link>
      </div>
    </header>
  );
}
