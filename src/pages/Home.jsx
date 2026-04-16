import { Link } from 'react-router-dom';
import { Zap, TrendingUp, ArrowRight, ChevronRight } from 'lucide-react';
import { liveMatches, upcomingMatches, sports } from '../data/mockData';

export default function Home({ onAddSelection }) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="hero-banner" id="hero-banner">
        <h2>Welcome to <span style={{ color: 'var(--accent-green)' }}>BetKing</span></h2>
        <p>Experience the thrill of live sports betting. Get the best odds on Cricket, Football, Tennis, and more.</p>
        <div style={{ display: 'flex', gap: 'var(--space-md)', position: 'relative' }}>
          <Link to="/sports" className="btn btn-primary btn-lg">
            <Zap size={18} /> Start Betting
          </Link>
          <Link to="/live" className="btn btn-secondary btn-lg">
            <Zap size={18} /> Live Now
          </Link>
        </div>
      </div>

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
        <div className="live-matches-scroll">
          {liveMatches.map(match => (
            <div key={match.id} className="match-card" onClick={() => {}}>
              <div className="match-card-header">
                <span className="match-card-league">{match.league}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="live-dot"></div>
                  <span className="match-card-time">{match.time}</span>
                </div>
              </div>
              <div className="match-card-teams">
                <div className="match-card-team">
                  <span className="match-card-team-name">{match.teamA}</span>
                  <span className="match-card-score">{match.scoreA}</span>
                </div>
                <div className="match-card-team">
                  <span className="match-card-team-name">{match.teamB}</span>
                  <span className="match-card-score">{match.scoreB}</span>
                </div>
              </div>
              <div className="match-card-odds">
                <button
                  className="odds-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSelection({
                      id: `${match.id}-home`,
                      match: `${match.teamA} vs ${match.teamB}`,
                      selection: match.teamA,
                      odds: match.odds.home,
                    });
                  }}
                >
                  <span className="odds-label">1</span>
                  <span className="odds-value">{match.odds.home.toFixed(2)}</span>
                </button>
                {match.odds.draw && (
                  <button
                    className="odds-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSelection({
                        id: `${match.id}-draw`,
                        match: `${match.teamA} vs ${match.teamB}`,
                        selection: 'Draw',
                        odds: match.odds.draw,
                      });
                    }}
                  >
                    <span className="odds-label">X</span>
                    <span className="odds-value">{match.odds.draw.toFixed(2)}</span>
                  </button>
                )}
                <button
                  className="odds-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSelection({
                      id: `${match.id}-away`,
                      match: `${match.teamA} vs ${match.teamB}`,
                      selection: match.teamB,
                      odds: match.odds.away,
                    });
                  }}
                >
                  <span className="odds-label">2</span>
                  <span className="odds-value">{match.odds.away.toFixed(2)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sports */}
      <div className="live-section">
        <div className="section-header">
          <div className="section-title">
            <Trophy size={20} /> Popular Sports
          </div>
        </div>
        <div className="sports-grid">
          {sports.map(sport => (
            <Link key={sport.id} to={`/sports?sport=${sport.id}`} className="sport-card">
              <div className="sport-icon">{sport.icon}</div>
              <div className="sport-name">{sport.name}</div>
              <div className="sport-count">{sport.count} events</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
          {upcomingMatches.slice(0, 4).map(match => (
            <div key={match.id} className="match-card">
              <div className="match-card-header">
                <span className="match-card-league">{match.league}</span>
                <span className="match-card-time" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(match.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="match-card-teams">
                <div className="match-card-team">
                  <span className="match-card-team-name">{match.teamA}</span>
                </div>
                <div className="match-card-team">
                  <span className="match-card-team-name">{match.teamB}</span>
                </div>
              </div>
              <div className="match-card-odds">
                <button className="odds-btn" onClick={() => onAddSelection({
                  id: `${match.id}-home`, match: `${match.teamA} vs ${match.teamB}`,
                  selection: match.teamA, odds: match.odds.home
                })}>
                  <span className="odds-label">1</span>
                  <span className="odds-value">{match.odds.home.toFixed(2)}</span>
                </button>
                {match.odds.draw && (
                  <button className="odds-btn" onClick={() => onAddSelection({
                    id: `${match.id}-draw`, match: `${match.teamA} vs ${match.teamB}`,
                    selection: 'Draw', odds: match.odds.draw
                  })}>
                    <span className="odds-label">X</span>
                    <span className="odds-value">{match.odds.draw.toFixed(2)}</span>
                  </button>
                )}
                <button className="odds-btn" onClick={() => onAddSelection({
                  id: `${match.id}-away`, match: `${match.teamA} vs ${match.teamB}`,
                  selection: match.teamB, odds: match.odds.away
                })}>
                  <span className="odds-label">2</span>
                  <span className="odds-value">{match.odds.away.toFixed(2)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Trophy({ size }) {
  return <span style={{ fontSize: size }}>🏆</span>;
}
