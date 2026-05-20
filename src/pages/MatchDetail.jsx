import { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, Clock, MapPin, ChevronDown } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { matches as matchesApi } from '../api/client';
import { useSocketEvent, useMatchSubscription } from '../lib/socket';
import TeamLogo, { getTeamColors } from '../components/TeamLogo';
import PitchGraphic from '../components/PitchGraphic';
import { venueImageFor } from '../lib/venueImage';
import StreamPlayer from '../components/StreamPlayer';
import MatchStatsPanel from '../components/MatchStatsPanel';
import LiveStatsPanel from '../components/LiveStatsPanel';
import CommentaryFeed from '../components/CommentaryFeed';
import { Skeleton, MarketSkeleton } from '../components/Skeleton';
import MarketTooltip from '../components/MarketTooltip';

function formatScore(score) {
  if (!score) return '';
  if (typeof score === 'object') {
    if (score.runs !== undefined) return `${score.runs}/${score.wickets ?? 0}${score.overs ? ` (${score.overs})` : ''}`;
    return JSON.stringify(score);
  }
  return String(score);
}

export default function MatchDetail({ onAddSelection }) {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [collapsed, setCollapsed] = useState(new Set());
  const [activeTab, setActiveTab] = useState('markets'); // 'markets' | 'stats' | 'feed'
  const [streamMode, setStreamMode] = useState('inline'); // 'inline' | 'pip'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleCollapse = (marketId) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(marketId)) next.delete(marketId);
      else next.add(marketId);
      return next;
    });
  };

  const { mainMarkets, fancyMarkets } = useMemo(() => {
    const main = markets.filter((m) => !m.isFancy);
    const fancy = markets.filter((m) => m.isFancy);
    return { mainMarkets: main, fancyMarkets: fancy };
  }, [markets]);

  useMatchSubscription(id);

  const load = async () => {
    try {
      const data = await matchesApi.detail(id);
      setMatch(data.match);
      setMarkets(data.markets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useSocketEvent('match:scoreUpdate', (payload) => {
    if (payload.matchId !== id) return;
    setMatch((prev) => prev ? {
      ...prev,
      scoreA: payload.scoreA,
      scoreB: payload.scoreB,
      status: payload.status,
      liveStats: payload.liveStats ?? prev.liveStats,
    } : prev);
  });

  useSocketEvent('odds:update', (payload) => {
    setMarkets((prev) => prev.map((m) =>
      m._id === payload.marketId
        ? { ...m, name: payload.marketName, options: m.options.map((o, i) => ({ ...o, ...payload.options[i] })) }
        : m
    ));
  });

  useSocketEvent('market:suspended', (payload) => {
    setMarkets((prev) => prev.map((m) =>
      m._id === payload.marketId ? { ...m, status: payload.suspended ? 'suspended' : 'open' } : m
    ));
  });

  useSocketEvent('market:new', (payload) => {
    if (payload.market?.matchId !== id) return;
    setMarkets((prev) => [...prev, payload.market]);
  });

  useSocketEvent('market:settled', (payload) => {
    setMarkets((prev) => prev.map((m) =>
      m._id === payload.marketId ? { ...m, status: 'settled' } : m
    ));
  });

  useSocketEvent('match:stream', (payload) => {
    if (payload.matchId !== id) return;
    setMatch((prev) => prev ? {
      ...prev,
      streamUrl: payload.streamUrl,
      streamProvider: payload.streamProvider,
    } : prev);
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Skeleton width={140} height={28} radius={8} style={{ marginBottom: 'var(--space-lg)' }} />
        <div className="card" style={{ padding: 'var(--space-2xl)', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-lg)' }}>
            <Skeleton width={80} height={22} radius={6} />
            <Skeleton width={140} height={20} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
              <Skeleton width={88} height={88} radius={999} />
              <Skeleton width={140} height={20} />
            </div>
            <Skeleton width={80} height={36} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
              <Skeleton width={88} height={88} radius={999} />
              <Skeleton width={140} height={20} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {[0,1,2,3].map((i) => <MarketSkeleton key={i} />)}
        </div>
      </div>
    );
  }
  if (error) return <div style={{ padding: 40, color: '#f44336' }}>{error}</div>;
  if (!match) return <div style={{ padding: 40 }}>Match not found.</div>;

  const teamA = match.teamA?.name || 'Team A';
  const teamB = match.teamB?.name || 'Team B';
  const isLive = match.status === 'live';
  const [colorA] = getTeamColors(teamA);
  const [colorB] = getTeamColors(teamB);
  const venuePhoto = match.sport === 'cricket' ? venueImageFor(match, { width: 1400 }) : null;

  return (
    <div className="animate-fade-in">
      <Link to="/sports" className="btn btn-sm btn-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
        <ArrowLeft size={14} /> Back to Sports
      </Link>

      {/* Stream + header layout: side-by-side when stream is inline, stacked otherwise */}
      {(() => {
        const hasInlineStream = match.streamUrl && streamMode === 'inline';

        const header = (
          <div className="card match-hero-info-card" style={{
            background: `radial-gradient(circle at 18% 0%, ${colorA}33, transparent 55%), radial-gradient(circle at 82% 100%, ${colorB}33, transparent 55%), linear-gradient(135deg, #0d1f1c 0%, #131a2e 100%)`,
            borderColor: 'var(--accent-green-dim)',
            marginBottom: hasInlineStream ? 0 : 'var(--space-xl)',
            position: 'relative',
            overflow: 'hidden',
            padding: hasInlineStream ? 'var(--space-xl)' : 'var(--space-2xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: hasInlineStream ? '100%' : 'auto',
          }}>
        {/* Stadium photo backdrop — hidden when stream is inline (video does the atmosphere job) */}
        {venuePhoto && !hasInlineStream && (
          <>
            <div
              role="img"
              aria-label={`Stadium photograph by ${venuePhoto.credit} on Unsplash`}
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${venuePhoto.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.22,
                filter: 'saturate(0.85) blur(1px)',
                zIndex: 0,
              }}
            />
            {/* Dark gradient overlay for legibility */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(13,31,28,0.5) 0%, rgba(19,26,46,0.85) 70%, rgba(19,26,46,0.95) 100%)',
              zIndex: 0,
            }} />
          </>
        )}
        {match.sport === 'cricket' && <PitchGraphic opacity={0.05} />}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xl)' }}>
          {isLive ? (
            <span className="badge badge-live"><div className="live-dot" style={{ width: 6, height: 6 }}></div> LIVE</span>
          ) : (
            <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{match.status?.toUpperCase()}</span>
          )}
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-yellow)', fontWeight: 600 }}>🏆 {match.league}</span>
          {match.venue && (
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} /> {match.venue}
            </span>
          )}
        </div>
        <div className="match-header-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: hasInlineStream ? 'var(--space-lg)' : 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: hasInlineStream ? 8 : 'var(--space-md)' }}>
            <TeamLogo name={teamA} logo={match.teamA?.logo} size={hasInlineStream ? 60 : 88} />
            <div style={{ fontSize: hasInlineStream ? 'var(--font-md)' : 'var(--font-xl)', fontWeight: 700, textAlign: 'center' }}>{teamA}</div>
            {match.teamA?.shortName && (
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', letterSpacing: 1 }}>{match.teamA.shortName}</div>
            )}
          </div>
          <div style={{ textAlign: 'center', minWidth: hasInlineStream ? 120 : 180 }}>
            {isLive || formatScore(match.scoreA) || formatScore(match.scoreB) ? (
              <div style={{ fontSize: hasInlineStream ? 'var(--font-lg)' : 'var(--font-2xl)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                <span style={{ color: 'var(--accent-green)' }}>{formatScore(match.scoreA) || '—'}</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>vs</span>
                <span style={{ color: 'var(--accent-green)' }}>{formatScore(match.scoreB) || '—'}</span>
              </div>
            ) : (
              <div style={{ fontSize: hasInlineStream ? 'var(--font-xl)' : 'var(--font-3xl)', fontWeight: 900, color: 'var(--text-tertiary)' }}>VS</div>
            )}
            {isLive && match.currentOver && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: 'var(--accent-yellow)', fontSize: 'var(--font-sm)', fontWeight: 600, marginTop: 6 }}>
                <Clock size={12} /> Over {match.currentOver}
              </div>
            )}
            {!isLive && (
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-xs)', marginTop: 6 }}>
                {new Date(match.startTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: hasInlineStream ? 8 : 'var(--space-md)' }}>
            <TeamLogo name={teamB} logo={match.teamB?.logo} size={hasInlineStream ? 60 : 88} />
            <div style={{ fontSize: hasInlineStream ? 'var(--font-md)' : 'var(--font-xl)', fontWeight: 700, textAlign: 'center' }}>{teamB}</div>
            {match.teamB?.shortName && (
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', letterSpacing: 1 }}>{match.teamB.shortName}</div>
            )}
          </div>
        </div>
        {venuePhoto && !hasInlineStream && (
          <a
            href={`${venuePhoto.href}?utm_source=betking&utm_medium=referral`}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              position: 'absolute',
              bottom: 6,
              right: 10,
              fontSize: 9,
              color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none',
              letterSpacing: 0.3,
              zIndex: 1,
            }}
            title="Photo source on Unsplash"
          >
            photo · {venuePhoto.credit} / Unsplash
          </a>
        )}
      </div>
        );

        if (hasInlineStream) {
          return (
            <div className="match-hero-split" style={{ marginBottom: 'var(--space-xl)' }}>
              <div style={{ minHeight: '100%' }}>
                <StreamPlayer
                  url={match.streamUrl}
                  provider={match.streamProvider}
                  matchTitle={`${teamA} vs ${teamB}`}
                  mode={streamMode}
                  onModeChange={setStreamMode}
                />
              </div>
              {header}
            </div>
          );
        }

        return (
          <>
            {match.streamUrl && (
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <StreamPlayer
                  url={match.streamUrl}
                  provider={match.streamProvider}
                  matchTitle={`${teamA} vs ${teamB}`}
                  mode={streamMode}
                  onModeChange={setStreamMode}
                />
              </div>
            )}
            {header}
          </>
        );
      })()}

      {/* Live stats banner — always visible across tabs when match is live */}
      {match.status === 'live' && <LiveStatsPanel liveStats={match.liveStats} />}

      {/* Tab navigation */}
      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'markets', label: 'Markets', count: markets.length },
          { id: 'stats', label: 'Stats' },
          { id: 'feed', label: 'Feed', count: (match.commentary || []).length || null, dot: match.status === 'live' },
        ]}
      />

      {activeTab === 'markets' && (
        markets.length === 0 ? (
          <div className="card" style={{ color: 'var(--text-secondary)' }}>
            No markets available for this match yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {mainMarkets.length > 0 && (
              <MarketSection
                title="Main Markets"
                markets={mainMarkets}
                match={match}
                teamA={teamA}
                teamB={teamB}
                collapsed={collapsed}
                onToggle={toggleCollapse}
                onAddSelection={onAddSelection}
              />
            )}
            {fancyMarkets.length > 0 && (
              <MarketSection
                title="Fancy Bets"
                icon="★"
                accent="var(--accent-yellow)"
                markets={fancyMarkets}
                match={match}
                teamA={teamA}
                teamB={teamB}
                collapsed={collapsed}
                onToggle={toggleCollapse}
                onAddSelection={onAddSelection}
              />
            )}
          </div>
        )
      )}

      {activeTab === 'stats' && (
        <MatchStatsPanel matchId={id} match={match} />
      )}

      {activeTab === 'feed' && (
        <CommentaryFeed matchId={id} initialEntries={match.commentary || []} />
      )}
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: 4,
      marginBottom: 'var(--space-xl)',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      width: 'fit-content',
      maxWidth: '100%',
      overflowX: 'auto',
    }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 500,
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                fontSize: 10,
                padding: '1px 7px',
                borderRadius: 999,
                background: isActive ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                color: isActive ? '#000' : 'var(--text-tertiary)',
                fontWeight: 800,
              }}>
                {t.count}
              </span>
            )}
            {t.dot && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent-red)',
                animation: 'pulse 1.5s infinite',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function MarketSection({ title, icon, accent, markets, match, teamA, teamB, collapsed, onToggle, onAddSelection }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{
          width: 3,
          height: 16,
          borderRadius: 2,
          background: accent || 'var(--accent-green)',
        }} />
        <h2 style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}>
          {icon && <span style={{ color: accent || 'var(--accent-green)', marginRight: 6 }}>{icon}</span>}
          {title}
        </h2>
        <span style={{
          fontSize: 10,
          color: 'var(--text-tertiary)',
          background: 'var(--bg-tertiary)',
          padding: '1px 7px',
          borderRadius: 999,
          fontWeight: 700,
        }}>
          {markets.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {markets.map((market) => (
          <MarketCard
            key={market._id}
            market={market}
            match={match}
            teamA={teamA}
            teamB={teamB}
            isCollapsed={collapsed.has(market._id)}
            onToggle={() => onToggle(market._id)}
            onAddSelection={onAddSelection}
          />
        ))}
      </div>
    </div>
  );
}

function MarketCard({ market, match, teamA, teamB, isCollapsed, onToggle, onAddSelection }) {
  const optionCount = market.options.length;
  const cols = optionCount === 2 ? 2 : optionCount === 3 ? 3 : optionCount === 4 ? 4 : 3;
  const isSuspended = market.status === 'suspended';
  const isSettled = market.status === 'settled' || market.status === 'cancelled';
  const isInteractive = !isSuspended && !isSettled;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        opacity: isSettled ? 0.6 : 1,
      }}
    >
      {/* Header bar */}
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {market.name}
          </span>
          <MarketTooltip marketType={market.type} marketName={market.name} />
          {isSuspended && (
            <span style={{
              fontSize: 9,
              padding: '2px 6px',
              background: 'rgba(255,193,7,0.15)',
              color: '#ffc107',
              borderRadius: 4,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}>SUSPENDED</span>
          )}
          {market.status === 'settled' && (
            <span style={{
              fontSize: 9,
              padding: '2px 6px',
              background: 'rgba(0,230,118,0.15)',
              color: 'var(--accent-green)',
              borderRadius: 4,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}>SETTLED</span>
          )}
          {market.status === 'cancelled' && (
            <span style={{
              fontSize: 9,
              padding: '2px 6px',
              background: 'var(--accent-red-dim)',
              color: 'var(--accent-red)',
              borderRadius: 4,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}>CANCELLED</span>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-tertiary)',
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        />
      </button>

      {!isCollapsed && (
        <>
          <div style={{
            padding: 12,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 8,
          }}>
            {market.options.map((option) => {
              const disabled = !isInteractive || option.status !== 'open';
              const teamLogo = option.label === teamA ? match.teamA?.logo
                : option.label === teamB ? match.teamB?.logo
                : null;
              const isTeamOption = option.label === teamA || option.label === teamB;
              const isPlayerOption = !!option.playerId;
              return (
                <OddsButton
                  key={option._id}
                  label={option.label}
                  odds={option.odds}
                  logo={isPlayerOption ? option.playerPhoto : teamLogo}
                  showLogo={isTeamOption || isPlayerOption}
                  sublabel={isPlayerOption ? option.playerRole : null}
                  disabled={disabled}
                  onClick={() => onAddSelection({
                    id: `${market._id}-${option._id}`,
                    matchId: match._id,
                    marketId: market._id,
                    optionId: option._id,
                    match: `${teamA} vs ${teamB}`,
                    selection: option.label,
                    marketName: market.name,
                    odds: option.odds,
                  })}
                />
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.15)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
          }}>
            <span>Min ₹{market.minStake} · Max ₹{(market.maxStake || 0).toLocaleString('en-IN')}</span>
            {market.totalStaked > 0 && (
              <span>Volume: ₹{market.totalStaked.toLocaleString('en-IN')}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function OddsButton({ label, odds, logo, showLogo, sublabel, disabled, onClick }) {
  const prevOdds = useRef(odds);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    const prev = prevOdds.current;
    if (prev !== undefined && prev !== odds) {
      const cls = odds > prev ? 'odds-flash-up' : 'odds-flash-down';
      setFlashClass(cls);
      const t = setTimeout(() => setFlashClass(''), 900);
      return () => clearTimeout(t);
    }
    prevOdds.current = odds;
  }, [odds]);

  useEffect(() => { prevOdds.current = odds; });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={flashClass}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '12px 14px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'border-color 150ms ease, transform 150ms ease',
        color: 'inherit',
        minWidth: 0,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = 'var(--accent-green)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {showLogo && <TeamLogo name={label} logo={logo} size={26} />}
        <span style={{
          display: 'flex', flexDirection: 'column', minWidth: 0,
        }}>
          <span style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
          {sublabel && (
            <span style={{
              fontSize: 10,
              color: 'var(--text-tertiary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {sublabel}
            </span>
          )}
        </span>
      </span>
      <span style={{
        fontSize: 'var(--font-base)',
        fontWeight: 800,
        color: 'var(--accent-green)',
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
      }}>
        {odds.toFixed(2)}
      </span>
    </button>
  );
}
