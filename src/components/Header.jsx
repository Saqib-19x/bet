import { Search, Wallet, ChevronDown, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const shortName = user?.name ? user.name.split(' ').slice(0, 2).map((s, i, a) => i === a.length - 1 && a.length > 1 ? `${s[0]}.` : s).join(' ') : 'Guest';

  const balance = (user?.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
          <span className="balance-amount">{balance}</span>
        </Link>

        <NotificationCenter />

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="header-user"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div className="header-avatar">{initials}</div>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{shortName}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', minWidth: 180, zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)', padding: 'var(--space-xs)',
            }}>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}
              >
                Profile
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}
                >
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
    </header>
  );
}
