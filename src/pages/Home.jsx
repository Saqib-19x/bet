import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { matches as matchesApi } from '../api/client';
import { useSocketEvent } from '../lib/socket';
import TeamLogo from '../components/TeamLogo';
import { MatchCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import HeroCarousel from '../components/HeroCarousel';

// SVG pattern data URIs — encoded inline so they don't require extra files.
// All built from heropatterns-style geometry; tweak fill='%23<hex>' to recolour.
const PATTERN_CIRCLES = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/svg%3E\")";
const PATTERN_DIAMONDS = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z'/%3E%3C/g%3E%3C/svg%3E\")";
const PATTERN_STRIPES = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 20 L40 0 L40 4 L0 24 Z'/%3E%3C/g%3E%3C/svg%3E\")";
const PATTERN_HEX = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='60' viewBox='0 0 52 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M26 0 L52 15 L52 45 L26 60 L0 45 L0 15 Z' stroke='%23ffffff' stroke-width='1.5' fill='none'/%3E%3C/g%3E%3C/svg%3E\")";

const sports = [
  { id: 'cricket', name: 'Cricket', icon: '🏏', gradient: 'linear-gradient(135deg, rgba(0,230,118,0.30), rgba(13,42,30,0.15))', pattern: PATTERN_CIRCLES },
  { id: 'football', name: 'Football', icon: '⚽', gradient: 'linear-gradient(135deg, rgba(68,138,255,0.30), rgba(11,32,72,0.15))', pattern: PATTERN_HEX },
  { id: 'tennis', name: 'Tennis', icon: '🎾', gradient: 'linear-gradient(135deg, rgba(255,193,7,0.28), rgba(68,30,0,0.15))', pattern: PATTERN_DIAMONDS },
  { id: 'basketball', name: 'Basketball', icon: '🏀', gradient: 'linear-gradient(135deg, rgba(255,112,67,0.30), rgba(74,22,0,0.15))', pattern: PATTERN_STRIPES },
];

function formatScore(score) {
  if (!score) return '—';
  if (typeof score === 'object') {
    if (score.runs !== undefined) return `${score.runs}/${score.wickets ?? 0}${score.overs ? ` (${score.overs})` : ''}`;
    return JSON.stringify(score);
  }
  return String(score);
}

export default function Home({ onAddSelection }) {
  const navigate = useNavigate();
  const [live, setLive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [liveRes, upRes] = await Promise.all([
        matchesApi.live(),
        matchesApi.upcoming(),
      ]);
      setLive(liveRes.matches || []);
      setUpcoming(upRes.matches || []);
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useSocketEvent('match:scoreUpdate', (payload) => {
    setLive((prev) => prev.map((m) =>
      m._id === payload.matchId
        ? { ...m, scoreA: payload.scoreA, scoreB: payload.scoreB, status: payload.status }
        : m
    ));
  });

  const renderOdds = (match, prefix = '') => {
    const odds = match.odds || {};
    const teamA = match.teamA?.name || 'A';
    const teamB = match.teamB?.name || 'B';
    if (!odds.home && !odds.away) {
      return (
        <button
          className="btn btn-sm btn-secondary w-full"
          onClick={() => navigate(`/match/${match._id}`)}
        >
          View Markets <ChevronRight size={14} />
        </button>
      );
    }
    return (
      <div className="match-card-odds">
        {odds.home && (
          <button
            className="odds-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddSelection({
                id: `${prefix}${match._id}-home`,
                matchId: match._id,
                match: `${teamA} vs ${teamB}`,
                selection: teamA,
                odds: odds.home,
              });
            }}
          >
            <span className="odds-label">1</span>
            <span className="odds-value">{odds.home.toFixed(2)}</span>
          </button>
        )}
        {odds.draw && (
          <button
            className="odds-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddSelection({
                id: `${prefix}${match._id}-draw`,
                matchId: match._id,
                match: `${teamA} vs ${teamB}`,
                selection: 'Draw',
                odds: odds.draw,
              });
            }}
          >
            <span className="odds-label">X</span>
            <span className="odds-value">{odds.draw.toFixed(2)}</span>
          </button>
        )}
        {odds.away && (
          <button
            className="odds-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddSelection({
                id: `${prefix}${match._id}-away`,
                matchId: match._id,
                match: `${teamA} vs ${teamB}`,
                selection: teamB,
                odds: odds.away,
              });
            }}
          >
            <span className="odds-label">2</span>
            <span className="odds-value">{odds.away.toFixed(2)}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Hero carousel — live first, then upcoming */}
      <HeroCarousel matches={[...live, ...upcoming]} />

      {/* Live Now */}
      <div className="live-section">
        <div className="section-header">
          <div className="section-title">
            <div className="live-dot"></div>
            Live Now
          </div>
          <Link to="/live" className="btn btn-sm btn-secondary">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="live-matches-scroll">
            {[0,1,2].map((i) => <MatchCardSkeleton key={i} />)}
          </div>
        ) : live.length === 0 ? (
          <EmptyState preset="liveMatches" compact />
        ) : (
          <div className="live-matches-scroll">
            {live.map((match) => (
              <div key={match._id} className="match-card" onClick={() => navigate(`/match/${match._id}`)}>
                <div className="match-card-header">
                  <span className="match-card-league">{match.league}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="live-dot"></div>
                    <span className="match-card-time">LIVE</span>
                  </div>
                </div>
                <div className="match-card-teams">
                  <div className="match-card-team" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <TeamLogo name={match.teamA?.name} logo={match.teamA?.logo} size={28} />
                    <span className="match-card-team-name" style={{ flex: 1 }}>{match.teamA?.name}</span>
                    <span className="match-card-score">{formatScore(match.scoreA)}</span>
                  </div>
                  <div className="match-card-team" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <TeamLogo name={match.teamB?.name} logo={match.teamB?.logo} size={28} />
                    <span className="match-card-team-name" style={{ flex: 1 }}>{match.teamB?.name}</span>
                    <span className="match-card-score">{formatScore(match.scoreB)}</span>
                  </div>
                </div>
                {renderOdds(match)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sports */}
      <div className="live-section">
        <div className="section-header">
          <div className="section-title">
            🏆 Popular Sports
          </div>
        </div>
        <div className="sports-grid">
          {sports.map((sport) => (
            <Link
              key={sport.id}
              to={`/sports?sport=${sport.id}`}
              className="sport-card"
              style={{
                '--sport-gradient': sport.gradient,
                '--sport-pattern': sport.pattern,
              }}
            >
              <div className="sport-icon">{sport.icon}</div>
              <div className="sport-name">{sport.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="live-section">
        <div className="section-header">
          <div className="section-title">
            <TrendingUp size={20} /> Upcoming Matches
          </div>
          <Link to="/sports" className="btn btn-sm btn-secondary">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
            {[0,1,2,3].map((i) => <MatchCardSkeleton key={i} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState preset="matches" compact />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
            {upcoming.slice(0, 6).map((match) => (
              <div
                key={match._id}
                className="match-card"
                onClick={() => navigate(`/match/${match._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="match-card-header">
                  <span className="match-card-league">{match.league}</span>
                  <span className="match-card-time" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(match.startTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="match-card-teams">
                  <div className="match-card-team" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <TeamLogo name={match.teamA?.name} logo={match.teamA?.logo} size={28} />
                    <span className="match-card-team-name">{match.teamA?.name}</span>
                  </div>
                  <div className="match-card-team" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <TeamLogo name={match.teamB?.name} logo={match.teamB?.logo} size={28} />
                    <span className="match-card-team-name">{match.teamB?.name}</span>
                  </div>
                </div>
                {renderOdds(match, 'up-')}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
