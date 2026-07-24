import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TicketCheck, Calendar, TrendingUp, TrendingDown, Banknote, Layers, Check, X as XIcon, Circle, Search, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { bets as betsApi } from '../api/client';
import { useSocketEvent } from '../lib/socket';
import { useAuth } from '../contexts/AuthContext';
import TeamLogo from '../components/TeamLogo';
import { BetCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

function splitMatchTitle(title) {
  if (!title) return [null, null];
  const parts = title.split(/\s+vs\s+/i);
  return [parts[0]?.trim(), parts[1]?.trim()];
}

const tabs = ['all', 'open', 'won', 'lost', 'cashout'];

const DATE_RANGES = [
  { id: 'all', label: 'All time', days: null },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'today', label: 'Today', days: 0 },
];

const BET_TYPES = [
  { id: 'all', label: 'All bets' },
  { id: 'single', label: 'Singles' },
  { id: 'multi', label: 'Bet Builder' },
];

export default function MyBets() {
  const { user, updateBalance } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [betTypeFilter, setBetTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allBets, setAllBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quotes, setQuotes] = useState({}); // { betId: { available, amount, profit, currentOdds } }
  const [cashingOut, setCashingOut] = useState(null); // betId currently being cashed out
  const [confirming, setConfirming] = useState(null); // betId pending user confirmation
  const [sharingBet, setSharingBet] = useState(null);
  const shareRef = useRef(null);

  const load = async () => {
    try {
      const res = await betsApi.list({ limit: 100 });
      setAllBets(res.bets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Poll cashout quotes for all open bets every 10s
  const refreshQuotes = useCallback(async (bets) => {
    const openIds = bets.filter((b) => b.status === 'open' && b.betType !== 'multi').map((b) => b._id);
    if (!openIds.length) return;
    const results = await Promise.allSettled(openIds.map((id) => betsApi.cashoutQuote(id)));
    setQuotes((prev) => {
      const next = { ...prev };
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') next[openIds[i]] = r.value.quote;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!allBets.length) return;
    refreshQuotes(allBets);
    const t = setInterval(() => refreshQuotes(allBets), 10000);
    return () => clearInterval(t);
  }, [allBets, refreshQuotes]);

  useSocketEvent('bet:settled', (payload) => {
    setAllBets((prev) => prev.map((b) =>
      b._id === payload.betId
        ? { ...b, status: payload.status, payout: payload.payout, settledAt: new Date().toISOString() }
        : b
    ));
    setQuotes((prev) => {
      const { [payload.betId]: _drop, ...rest } = prev;
      return rest;
    });
  });

  // Live odds change → re-quote immediately
  useSocketEvent('odds:update', () => {
    refreshQuotes(allBets);
  });

  const doCashout = async (bet) => {
    setCashingOut(bet._id);
    try {
      const quote = quotes[bet._id];
      const res = await betsApi.cashout(bet._id, quote?.amount);
      updateBalance(res.balance);
      setAllBets((prev) => prev.map((b) =>
        b._id === bet._id ? res.bet : b
      ));
      setConfirming(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setCashingOut(null);
    }
  };

  const filtered = useMemo(() => {
    const range = DATE_RANGES.find((r) => r.id === dateRange);
    const sinceMs = range?.days != null ? (() => {
      const d = new Date();
      if (range.days === 0) d.setHours(0, 0, 0, 0);
      else d.setDate(d.getDate() - range.days);
      return d.getTime();
    })() : null;
    const q = searchQuery.trim().toLowerCase();
    return allBets.filter((b) => {
      if (activeTab !== 'all' && b.status !== activeTab) return false;
      if (betTypeFilter !== 'all' && (b.betType || 'single') !== betTypeFilter) return false;
      if (sinceMs && new Date(b.createdAt).getTime() < sinceMs) return false;
      if (q) {
        const hay = `${b.matchTitle || ''} ${b.selection || ''} ${b.marketName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allBets, activeTab, dateRange, betTypeFilter, searchQuery]);

  const totalWon = allBets.filter((b) => ['won', 'cashout'].includes(b.status)).reduce((s, b) => s + (b.payout || 0), 0);
  const totalLost = allBets.filter((b) => b.status === 'lost').reduce((s, b) => s + b.stake, 0);
  const openBets = allBets.filter((b) => b.status === 'open').length;

  // Share-as-image: render the off-screen card, screenshot it, save / share
  useEffect(() => {
    if (!sharingBet || !shareRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        // give the off-screen render a tick to settle
        await new Promise((r) => setTimeout(r, 50));
        const canvas = await html2canvas(shareRef.current, {
          backgroundColor: '#0a0f1e',
          scale: 2,
          useCORS: true,
          logging: false,
        });
        if (cancelled) return;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
        const filename = `betking-${sharingBet._id.slice(-6).toUpperCase()}.png`;
        const file = new File([blob], filename, { type: 'image/png' });

        // Web Share API on supported devices
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My bet on BetKing',
              text: `${sharingBet.matchTitle} — ${sharingBet.selection} @ ${sharingBet.odds.toFixed(2)}`,
            });
            setSharingBet(null);
            return;
          } catch (err) {
            // user cancelled or share failed — fall through to download
          }
        }
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (err) {
        alert(`Couldn't generate ticket image: ${err.message}`);
      } finally {
        if (!cancelled) setSharingBet(null);
      }
    })();
    return () => { cancelled = true; };
  }, [sharingBet]);

  return (
    <div className="animate-fade-in xc-page xc-panel">
      <div className="xc-panel-head">My Bets</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        <div className="stat-card blue">
          <div className="stat-icon"><TicketCheck size={20} /></div>
          <div className="stat-label">Open Bets</div>
          <div className="stat-value">{openBets}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><TrendingUp size={20} /></div>
          <div className="stat-label">Total Won</div>
          <div className="stat-value">₹{totalWon.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><TrendingDown size={20} /></div>
          <div className="stat-label">Total Lost</div>
          <div className="stat-value">₹{totalLost.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)',
        alignItems: 'center', marginBottom: 'var(--space-xl)',
      }}>
        <div className="tabs" style={{ width: 'fit-content' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <select
          className="input-field"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px' }}
        >
          {DATE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>

        <select
          className="input-field"
          value={betTypeFilter}
          onChange={(e) => setBetTypeFilter(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px' }}
        >
          {BET_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        <div className="input-with-icon" style={{ flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={14} className="input-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search match or selection…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
          {filtered.length} of {allBets.length}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {[0,1,2].map((i) => <BetCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div style={{ color: '#f44336' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState preset={searchQuery || activeTab !== 'all' || betTypeFilter !== 'all' ? 'search' : 'bets'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {filtered.map((bet) => {
            const isCashout = bet.status === 'cashout';
            const display = bet.status === 'won' ? (bet.payout || bet.potentialWin)
              : isCashout ? bet.payout
              : bet.potentialWin;
            const [teamA, teamB] = splitMatchTitle(bet.matchTitle);
            const quote = quotes[bet._id];
            const canCashout = bet.status === 'open' && quote?.available;
            const isConfirming = confirming === bet._id;
            return (
              <div key={bet._id} className="card" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex' }}>
                      {teamA && <TeamLogo name={teamA} size={32} />}
                      {teamB && (
                        <span style={{ marginLeft: -10 }}>
                          <TeamLogo name={teamB} size={32} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                        {bet._id.slice(-6).toUpperCase()} • {bet.sport?.charAt(0).toUpperCase() + bet.sport?.slice(1)}
                        {bet.marketName && <> · {bet.marketName}</>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>{bet.matchTitle}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge badge-${bet.status}`}>
                      {bet.status === 'cashout' ? 'cashed out' : bet.status}
                    </span>
                    <button
                      onClick={() => setSharingBet(bet)}
                      disabled={!!sharingBet}
                      title="Share ticket"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 30, height: 30, borderRadius: 6,
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                      }}
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>
                {bet.betType === 'multi' && bet.legs?.length > 0 ? (
                  <div style={{
                    padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Layers size={12} style={{ color: 'var(--accent-green)' }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Bet Builder · {bet.legs.length} legs
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {bet.legs.map((leg, i) => {
                        const icon = leg.status === 'won' ? <Check size={11} />
                          : leg.status === 'lost' ? <XIcon size={11} />
                          : <Circle size={9} />;
                        const color = leg.status === 'won' ? 'var(--accent-green)'
                          : leg.status === 'lost' ? 'var(--accent-red)'
                          : leg.status === 'void' ? 'var(--text-tertiary)'
                          : 'var(--text-secondary)';
                        return (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 0',
                            borderBottom: i < bet.legs.length - 1 ? '1px solid var(--border-color)' : 'none',
                          }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 18, height: 18, borderRadius: '50%',
                              background: `${color}22`, color, flexShrink: 0,
                            }}>{icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {leg.selection}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                                {leg.marketName}
                              </div>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontVariantNumeric: 'tabular-nums' }}>
                              {leg.odds.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)',
                      marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)',
                      borderTop: '1px solid var(--border-color)',
                    }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>Combined</div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{bet.odds.toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>Stake</div>
                        <div style={{ fontWeight: 600 }}>₹{bet.stake.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                          {bet.status === 'won' ? 'Won' : bet.status === 'lost' ? 'Lost' : 'Potential Win'}
                        </div>
                        <div style={{
                          fontWeight: 700,
                          color: bet.status === 'won' ? 'var(--accent-green)' : bet.status === 'lost' ? 'var(--accent-red)' : 'var(--text-primary)',
                        }}>
                          {bet.status === 'lost' ? '−' : ''}₹{display.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)',
                    padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Selection</div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{bet.selection}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Odds</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{bet.odds.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Stake</div>
                      <div style={{ fontWeight: 600 }}>₹{bet.stake.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                        {bet.status === 'won' ? 'Won' : bet.status === 'lost' ? 'Lost' : isCashout ? 'Cashed Out' : 'Potential Win'}
                      </div>
                      <div style={{
                        fontWeight: 700,
                        color: bet.status === 'won' || isCashout ? 'var(--accent-green)' : bet.status === 'lost' ? 'var(--accent-red)' : 'var(--text-primary)',
                      }}>
                        {bet.status === 'lost' ? '−' : ''}₹{display.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cashout panel — only on open single bets (multi cashout not supported yet) */}
                {bet.status === 'open' && bet.betType !== 'multi' && (
                  <div style={{
                    marginTop: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    background: canCashout ? 'linear-gradient(135deg, rgba(0,230,118,0.08), rgba(0,230,118,0.02))' : 'var(--bg-tertiary)',
                    border: `1px solid ${canCashout ? 'var(--accent-green-dim)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-md)',
                  }}>
                    {!quote ? (
                      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
                        Loading cashout offer…
                      </span>
                    ) : !quote.available ? (
                      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
                        Cashout unavailable — {quote.reason || 'no offer right now'}.
                      </span>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Cashout offer
                          </span>
                          <span style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--accent-green)' }}>
                            ₹{quote.amount.toLocaleString('en-IN')}
                            <span style={{
                              marginLeft: 8,
                              fontSize: 'var(--font-xs)',
                              color: quote.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                              fontWeight: 600,
                            }}>
                              {quote.profit >= 0 ? '+' : ''}₹{quote.profit.toLocaleString('en-IN')}
                            </span>
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            current odds {quote.currentOdds.toFixed(2)} (you took {quote.originalOdds.toFixed(2)})
                          </span>
                        </div>
                        {!isConfirming ? (
                          <button
                            onClick={() => setConfirming(bet._id)}
                            disabled={cashingOut === bet._id || !canCashout}
                            style={{
                              padding: '10px 18px',
                              background: 'linear-gradient(135deg, var(--accent-green), #00c853)',
                              color: '#000',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              fontWeight: 700,
                              fontSize: 'var(--font-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Banknote size={14} /> Cash Out
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => doCashout(bet)}
                              disabled={cashingOut === bet._id}
                              style={{
                                padding: '10px 16px',
                                background: 'var(--accent-green)',
                                color: '#000',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 700,
                                fontSize: 'var(--font-sm)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {cashingOut === bet._id ? 'Cashing out…' : `Confirm ₹${quote.amount.toLocaleString('en-IN')}`}
                            </button>
                            <button
                              onClick={() => setConfirming(null)}
                              disabled={cashingOut === bet._id}
                              style={{
                                padding: '10px 14px',
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                fontSize: 'var(--font-sm)',
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'var(--space-md)', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                  <Calendar size={12} />
                  {new Date(bet.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Off-screen shareable ticket — rendered only when sharingBet is set */}
      {sharingBet && (
        <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden="true">
          <ShareableTicket innerRef={shareRef} bet={sharingBet} user={user} />
        </div>
      )}
    </div>
  );
}

function ShareableTicket({ innerRef, bet, user }) {
  const isMulti = bet.betType === 'multi';
  const legs = isMulti ? (bet.legs || []) : [{
    selection: bet.selection,
    marketName: bet.marketName,
    odds: bet.odds,
    status: bet.status === 'won' ? 'won' : bet.status === 'lost' ? 'lost' : 'pending',
  }];
  const display = bet.status === 'won' ? (bet.payout || bet.potentialWin)
    : bet.status === 'cashout' ? bet.payout
    : bet.potentialWin;
  const statusColor = bet.status === 'won' || bet.status === 'cashout' ? '#00e676'
    : bet.status === 'lost' ? '#ff5252'
    : '#ffc107';
  const statusLabel = bet.status === 'cashout' ? 'CASHED OUT' : bet.status.toUpperCase();

  return (
    <div ref={innerRef} style={{
      width: 540,
      padding: 28,
      background: 'linear-gradient(160deg, #0e1f1c 0%, #131a2e 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderRadius: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #00e676, #00c853)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>👑</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#00e676', letterSpacing: 0.5 }}>BetKing</span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 1,
          padding: '5px 10px', borderRadius: 4,
          background: `${statusColor}22`, color: statusColor,
        }}>{statusLabel}</span>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 6 }}>
        TICKET #{bet._id.slice(-6).toUpperCase()}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{bet.matchTitle}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
        {bet.sport?.toUpperCase()} · {new Date(bet.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>

      {isMulti && (
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00e676', letterSpacing: 1, marginBottom: 10 }}>
          ★ BET BUILDER · {legs.length} LEGS
        </div>
      )}

      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, marginBottom: 20,
      }}>
        {legs.map((l, i) => {
          const lc = l.status === 'won' ? '#00e676' : l.status === 'lost' ? '#ff5252' : 'rgba(255,255,255,0.4)';
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < legs.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{l.selection}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{l.marketName}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#00e676', fontVariantNumeric: 'tabular-nums' }}>
                  {l.odds.toFixed(2)}
                </span>
                {isMulti && (
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: lc,
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
        background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 16, marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Stake</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>₹{bet.stake.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {isMulti ? 'Combined' : 'Odds'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: '#00e676' }}>{bet.odds.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {bet.status === 'won' ? 'Won' : bet.status === 'cashout' ? 'Cashed Out' : bet.status === 'lost' ? 'Lost' : 'Potential'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: statusColor }}>
            {bet.status === 'lost' ? '−' : ''}₹{display.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: 'rgba(255,255,255,0.4)',
      }}>
        <span>{user?.name || 'Player'}</span>
        <span>betking.app</span>
      </div>
    </div>
  );
}
