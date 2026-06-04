import { useEffect, useState, useMemo } from 'react';
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
import ExchangeMarkets from '../components/exchange/ExchangeMarkets';

function formatScore(score) {
  if (!score) return '';
  if (typeof score === 'object') {
    if (score.runs !== undefined) return `${score.runs}/${score.wickets ?? 0}${score.overs ? ` (${score.overs})` : ''}`;
    return JSON.stringify(score);
  }
  return String(score);
}

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [activeTab, setActiveTab] = useState('markets'); // 'markets' | 'stats' | 'feed'
  const [streamMode, setStreamMode] = useState('inline'); // 'inline' | 'pip'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <ExchangeMarkets
          markets={[...mainMarkets, ...fancyMarkets]}
          match={match}
          teamA={teamA}
          teamB={teamB}
        />
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
