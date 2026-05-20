import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSocketEvent } from '../lib/socket';

const NotificationContext = createContext(null);

const MAX_HISTORY = 50;
const STORAGE_PREFIX = 'betking:notifications:';

function storageKey(userId) {
  return userId ? `${STORAGE_PREFIX}${userId}` : null;
}

function loadHistory(userId) {
  const key = storageKey(userId);
  if (!key || typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveHistory(userId, history) {
  const key = storageKey(userId);
  if (!key || typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    /* quota / private mode — ignore */
  }
}

function inr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id;
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState(() => loadHistory(userId));
  const counter = useRef(0);

  // Re-load history when user changes (login / logout)
  useEffect(() => {
    setHistory(loadHistory(userId));
  }, [userId]);

  // Persist history whenever it changes
  useEffect(() => {
    if (userId) saveHistory(userId, history);
  }, [history, userId]);

  const nextId = () => {
    counter.current += 1;
    return `n${Date.now()}-${counter.current}`;
  };

  const push = useCallback((notif) => {
    const id = notif.id || nextId();
    const entry = {
      id,
      type: notif.type || 'info',
      title: notif.title || '',
      message: notif.message || '',
      amount: notif.amount ?? null,
      link: notif.link || null,
      createdAt: notif.createdAt || new Date().toISOString(),
      read: false,
    };
    setToasts((prev) => [...prev, entry]);
    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));

    // Auto-dismiss toast — wins linger longer than info
    const ttl = entry.type === 'win' ? 9000 : 5500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ttl);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setHistory((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const unreadCount = history.filter((n) => !n.read).length;

  // ---- Socket integration ----
  useSocketEvent('bet:settled', (payload) => {
    if (!payload?.betId) return;
    const isWin = payload.status === 'won';
    const isCashout = payload.status === 'cashout';
    const isLoss = payload.status === 'lost';
    const amount = payload.payout || 0;
    push({
      type: isWin ? 'win' : isCashout ? 'cashout' : isLoss ? 'loss' : 'info',
      title: isWin ? '🎉 Bet won!' : isCashout ? '💰 Cashed out' : isLoss ? 'Bet lost' : 'Bet settled',
      message: isWin || isCashout
        ? `Payout ${inr(amount)} hit your wallet.`
        : 'Better luck next time.',
      amount,
      link: '/my-bets',
    });
  });

  useSocketEvent('match:commentary', (payload) => {
    // Only surface admin-authored or wicket events as toasts (auto-derived run updates would be too noisy)
    const e = payload?.entry;
    if (!e) return;
    if (e.type !== 'admin' && e.type !== 'wicket' && e.type !== 'match' && e.type !== 'milestone') return;
    push({
      type: 'info',
      title: e.type === 'wicket' ? '🏏 Wicket!' : e.type === 'milestone' ? '📈 Milestone' : 'Match update',
      message: e.text,
      link: `/match/${payload.matchId}`,
    });
  });

  return (
    <NotificationContext.Provider value={{
      toasts,
      history,
      unreadCount,
      push,
      dismissToast,
      markAllRead,
      clearHistory,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
