import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Trophy, X, AlertCircle, Banknote, Info, MessageSquare } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const CONFETTI_COLORS = ['#00e676', '#ffc107', '#448aff', '#ff5252', '#b388ff', '#ff7043'];

function Confetti() {
  const pieces = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 250}ms`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: `${Math.random() * 60 - 30}deg`,
      duration: `${1200 + Math.random() * 800}ms`,
    })),
    []
  );
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: p.left,
            top: -12,
            background: p.color,
            transform: `rotate(${p.rotate})`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

const PRESETS = {
  win:     { accent: '#00e676', Icon: Trophy,       border: '#00e676' },
  cashout: { accent: '#00e676', Icon: Banknote,     border: '#00e676' },
  loss:    { accent: '#ff5252', Icon: AlertCircle,  border: 'rgba(255,82,82,0.4)' },
  info:    { accent: '#448aff', Icon: MessageSquare, border: 'rgba(68,138,255,0.3)' },
  default: { accent: '#448aff', Icon: Info,         border: 'rgba(255,255,255,0.1)' },
};

export default function ToastStack() {
  const { toasts, dismissToast } = useNotifications();
  const navigate = useNavigate();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
        maxWidth: 360,
      }}
      aria-live="polite"
    >
      {toasts.slice(-3).map((t) => {
        const p = PRESETS[t.type] || PRESETS.default;
        const Icon = p.Icon;
        const clickable = !!t.link;
        return (
          <div
            key={t.id}
            onClick={() => {
              if (clickable) {
                navigate(t.link);
                dismissToast(t.id);
              }
            }}
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-card)',
              border: `1px solid ${p.border}`,
              borderLeft: `3px solid ${p.accent}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
              cursor: clickable ? 'pointer' : 'default',
              minWidth: 280,
              animation: 'slideUp 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {t.type === 'win' && (
              <>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 20% 0%, rgba(0,230,118,0.15), transparent 60%)',
                  pointerEvents: 'none',
                }} />
                <Confetti />
              </>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              background: `${p.accent}22`, color: p.accent, flexShrink: 0,
              position: 'relative',
            }}>
              <Icon size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t.title}
              </div>
              {t.message && (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                  {t.message}
                </div>
              )}
              {t.amount && t.type === 'win' && (
                <div style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: p.accent, marginTop: 4 }}>
                  +₹{Number(t.amount).toLocaleString('en-IN')}
                </div>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }}
              aria-label="Dismiss"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: 2,
                position: 'relative',
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
