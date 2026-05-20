import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import TeamLogo, { getTeamColors } from './TeamLogo';
import { venueImageFor } from '../lib/venueImage';

function formatStart(start) {
  if (!start) return '';
  const d = new Date(start);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HeroCarousel({ matches = [] }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const slides = matches.slice(0, 5);
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (!hasSlides || paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer.current);
  }, [slides.length, paused, hasSlides]);

  if (!hasSlides) {
    return (
      <div className="hero-banner" style={{
        background: 'radial-gradient(circle at 15% 20%, rgba(0,230,118,0.20), transparent 45%), radial-gradient(circle at 90% 80%, rgba(68,138,255,0.18), transparent 45%), linear-gradient(135deg, #0e1f1c 0%, #131a2e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, fontSize: 220, opacity: 0.06, pointerEvents: 'none',
          transform: 'rotate(-15deg)',
        }}>🏏</div>
        <div style={{ position: 'relative' }}>
          <h2>Welcome to <span style={{ color: 'var(--accent-green)' }}>BetKing</span></h2>
          <p>No live matches right now — check back when fixtures are on.</p>
        </div>
      </div>
    );
  }

  const m = slides[index];
  const teamA = m.teamA?.name;
  const teamB = m.teamB?.name;
  const isLive = m.status === 'live';
  const [colorA] = getTeamColors(teamA);
  const [colorB] = getTeamColors(teamB);
  const venuePhoto = m.sport === 'cricket' ? venueImageFor(m, { width: 1600 }) : null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-xl)',
        cursor: 'pointer',
        background: `radial-gradient(circle at 18% 20%, ${colorA}40, transparent 55%), radial-gradient(circle at 82% 85%, ${colorB}40, transparent 55%), linear-gradient(135deg, #0d1f1c 0%, #131a2e 100%)`,
        border: '1px solid var(--border-color)',
        minHeight: 220,
        transition: 'background 600ms ease',
      }}
      onClick={() => navigate(`/match/${m._id}`)}
    >
      {/* Stadium photo backdrop */}
      {venuePhoto && (
        <>
          <div
            role="img"
            aria-label={`Stadium photograph by ${venuePhoto.credit} on Unsplash`}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${venuePhoto.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.28,
              filter: 'saturate(0.9)',
              transition: 'background-image 600ms ease',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(13,31,28,0.45) 0%, rgba(19,26,46,0.85) 80%)',
          }} />
        </>
      )}

      <div style={{
        position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.05, pointerEvents: 'none',
        transform: 'rotate(-15deg)',
      }}>🏏</div>

      <div style={{
        position: 'relative',
        padding: 'var(--space-2xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 220,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {isLive ? (
            <span className="badge badge-live">
              <div className="live-dot" style={{ width: 6, height: 6 }}></div> LIVE
            </span>
          ) : (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 999,
              background: 'rgba(0,230,118,0.15)', color: 'var(--accent-green)',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            }}>
              🏆 FEATURED
            </span>
          )}
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--accent-yellow)' }}>
            {m.league}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            · {formatStart(m.startTime)}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 'var(--space-xl)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <TeamLogo name={teamA} logo={m.teamA?.logo} size={56} />
            <div style={{ fontSize: 'var(--font-base)', fontWeight: 700, textAlign: 'center' }}>{teamA}</div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900 }}>VS</div>
            {(m.odds?.home || m.odds?.away) && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                {m.odds.home?.toFixed(2)} · {m.odds.away?.toFixed(2)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <TeamLogo name={teamB} logo={m.teamB?.logo} size={56} />
            <div style={{ fontSize: 'var(--font-base)', fontWeight: 700, textAlign: 'center' }}>{teamB}</div>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/match/${m._id}`); }}
          className="btn btn-primary"
          style={{
            alignSelf: 'flex-start',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Zap size={14} /> View Markets
        </button>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          display: 'flex',
          gap: 6,
          zIndex: 2,
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === index ? 'var(--accent-green)' : 'rgba(255,255,255,0.25)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
