import { useEffect, useState } from 'react';
import { MessageSquare, AlertOctagon, TrendingUp, Repeat, Flag, User } from 'lucide-react';
import { useSocketEvent } from '../lib/socket';

const ICON = {
  wicket: { icon: AlertOctagon, color: 'var(--accent-red)' },
  milestone: { icon: TrendingUp, color: 'var(--accent-green)' },
  innings: { icon: Repeat, color: 'var(--accent-yellow)' },
  match: { icon: Flag, color: 'var(--accent-blue)' },
  admin: { icon: User, color: 'var(--accent-purple, #b388ff)' },
  note: { icon: MessageSquare, color: 'var(--text-secondary)' },
  update: { icon: MessageSquare, color: 'var(--text-secondary)' },
};

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '';
  }
}

export default function CommentaryFeed({ matchId, initialEntries = [] }) {
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    setEntries(initialEntries || []);
  }, [matchId, initialEntries?.length]);

  useSocketEvent('match:commentary', (payload) => {
    if (payload.matchId !== matchId) return;
    setEntries((prev) => {
      // de-dupe by createdAt + text — server appends server-timestamped entries
      const key = `${payload.entry.createdAt}-${payload.entry.text}`;
      if (prev.some((e) => `${e.createdAt}-${e.text}` === key)) return prev;
      return [...prev, payload.entry];
    });
  });

  if (!entries.length) {
    return null;
  }

  // newest first
  const ordered = [...entries].reverse();

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-xl)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 14px', borderBottom: '1px solid var(--border-color)',
      }}>
        <MessageSquare size={14} style={{ color: 'var(--accent-green)' }} />
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)' }}>
          Match Feed
        </h3>
        <span style={{
          fontSize: 10, color: 'var(--text-tertiary)',
          background: 'var(--bg-tertiary)', padding: '1px 7px', borderRadius: 999, fontWeight: 700,
        }}>{entries.length}</span>
      </div>
      <div style={{
        maxHeight: 360,
        overflowY: 'auto',
        padding: 'var(--space-sm) 0',
      }}>
        {ordered.map((e, i) => {
          const cfg = ICON[e.type] || ICON.update;
          const Icon = cfg.icon;
          return (
            <div
              key={`${e.createdAt}-${i}`}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 14px',
                borderBottom: i < ordered.length - 1 ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 6,
                background: `${cfg.color}15`, color: cfg.color, flexShrink: 0,
              }}>
                <Icon size={14} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                  {e.text}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {formatTime(e.createdAt)}
                  {e.author && e.author !== 'system' && ` · ${e.author}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
