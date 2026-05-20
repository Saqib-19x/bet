import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trophy, AlertCircle, Banknote, MessageSquare, Info, Inbox, Trash2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const ICONS = {
  win:     { Icon: Trophy,        color: 'var(--accent-green)' },
  cashout: { Icon: Banknote,      color: 'var(--accent-green)' },
  loss:    { Icon: AlertCircle,   color: 'var(--accent-red)' },
  info:    { Icon: MessageSquare, color: 'var(--accent-blue)' },
  default: { Icon: Info,          color: 'var(--text-secondary)' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationCenter() {
  const { history, unreadCount, markAllRead, clearHistory } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = () => {
    setOpen((o) => {
      if (!o && unreadCount > 0) {
        // Mark read shortly after opening so the badge updates after the user actually sees them
        setTimeout(markAllRead, 800);
      }
      return !o;
    });
  };

  const goTo = (link) => {
    if (link) navigate(link);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        className="header-notification"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="notif-dot"
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: 'var(--accent-red)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--bg-secondary)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            background: 'rgba(22, 27, 40, 0.85)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderBottom: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={14} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: 10, padding: '1px 7px', borderRadius: 999,
                  background: 'rgba(255,82,82,0.15)', color: 'var(--accent-red)', fontWeight: 700,
                }}>{unreadCount} new</span>
              )}
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                title="Clear all"
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-tertiary)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11,
                }}
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <div style={{
                padding: 32, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, color: 'var(--text-tertiary)',
              }}>
                <Inbox size={28} strokeWidth={1.5} />
                <span style={{ fontSize: 'var(--font-sm)' }}>No notifications yet</span>
              </div>
            ) : history.map((n) => {
              const cfg = ICONS[n.type] || ICONS.default;
              const Icon = cfg.Icon;
              return (
                <button
                  key={n.id}
                  onClick={() => goTo(n.link)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: '10px 14px',
                    background: n.read ? 'transparent' : 'rgba(0,230,118,0.04)',
                    border: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'inherit',
                    cursor: n.link ? 'pointer' : 'default',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 8,
                    background: `${cfg.color}15`, color: cfg.color, flexShrink: 0,
                    marginTop: 2,
                  }}>
                    <Icon size={13} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, flex: 1, minWidth: 0 }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    {n.message && (
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
