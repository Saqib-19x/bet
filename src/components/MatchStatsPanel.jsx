import { useEffect, useState } from 'react';
import { Award, MapPin, CloudSun, FileText, BarChart3 } from 'lucide-react';
import { matches as matchesApi } from '../api/client';
import TeamLogo from './TeamLogo';

function FormBar({ form, teamName, logo }) {
  const W = form.filter((r) => r.outcome === 'W').length;
  const L = form.filter((r) => r.outcome === 'L').length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px' }}>
      <TeamLogo name={teamName} logo={logo} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {teamName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Last {form.length || 0}: {W}W · {L}L
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {form.length === 0
          ? <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>No history</span>
          : form.map((r, i) => (
              <div
                key={i}
                title={`${r.outcome === 'W' ? 'Won' : 'Lost'} vs ${r.opponent || '?'} — ${r.description || ''}`}
                style={{
                  width: 22, height: 22, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  background: r.outcome === 'W' ? 'var(--accent-green)'
                    : r.outcome === 'L' ? 'var(--accent-red)'
                    : 'var(--bg-elevated)',
                }}
              >
                {r.outcome || '–'}
              </div>
            ))}
      </div>
    </div>
  );
}

function H2HBar({ winsA, winsB, total, teamAName, teamBName }) {
  if (!total) {
    return (
      <div style={{ padding: 12, fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        No head-to-head history yet.
      </div>
    );
  }
  const aPct = (winsA / total) * 100;
  const bPct = (winsB / total) * 100;
  const drawPct = 100 - aPct - bPct;
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--font-sm)' }}>
        <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{winsA}</span>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
          {total} match{total > 1 ? 'es' : ''}
        </span>
        <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{winsB}</span>
      </div>
      <div style={{
        display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ width: `${aPct}%`, background: 'var(--accent-green)' }} />
        <div style={{ width: `${drawPct}%`, background: 'var(--bg-elevated)' }} />
        <div style={{ width: `${bPct}%`, background: 'var(--accent-blue)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-tertiary)' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '45%' }}>{teamAName}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '45%', textAlign: 'right' }}>{teamBName}</span>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px' }}>
      <span style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 'var(--font-sm)' }}>{children}</div>
      </div>
    </div>
  );
}

export default function MatchStatsPanel({ matchId, match }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    matchesApi.stats(matchId)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <div className="card" style={{ padding: 14, color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
        Loading match insights…
      </div>
    );
  }
  if (!stats) return null;

  const teamAName = match.teamA?.name;
  const teamBName = match.teamB?.name;
  const formA = stats.form?.[teamAName] || [];
  const formB = stats.form?.[teamBName] || [];
  const hasPreview = stats.preview?.pitchReport || stats.preview?.weather || stats.preview?.notes;
  const hasToss = stats.toss?.winner;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 'var(--space-md)',
      marginBottom: 'var(--space-xl)',
    }}>
      {/* Form card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px', borderBottom: '1px solid var(--border-color)',
        }}>
          <BarChart3 size={14} style={{ color: 'var(--accent-green)' }} />
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)' }}>
            Recent Form
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', divideColor: 'var(--border-color)' }}>
          <FormBar form={formA} teamName={teamAName} logo={match.teamA?.logo} />
          <div style={{ height: 1, background: 'var(--border-color)' }} />
          <FormBar form={formB} teamName={teamBName} logo={match.teamB?.logo} />
        </div>
      </div>

      {/* H2H card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px', borderBottom: '1px solid var(--border-color)',
        }}>
          <Award size={14} style={{ color: 'var(--accent-yellow)' }} />
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)' }}>
            Head to Head
          </h3>
        </div>
        <H2HBar
          winsA={stats.h2h.winsA}
          winsB={stats.h2h.winsB}
          total={stats.h2h.total}
          teamAName={teamAName}
          teamBName={teamBName}
        />
        {stats.h2h.history?.length > 0 && (
          <div style={{ padding: '0 14px 12px', fontSize: 11, color: 'var(--text-tertiary)' }}>
            Last meeting: {stats.h2h.history[0].result || '—'}
          </div>
        )}
      </div>

      {/* Info / pitch report card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px', borderBottom: '1px solid var(--border-color)',
        }}>
          <FileText size={14} style={{ color: 'var(--accent-blue)' }} />
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)' }}>
            Match Info
          </h3>
        </div>
        {match.venue && (
          <InfoRow icon={<MapPin size={13} />} label="Venue">{match.venue}</InfoRow>
        )}
        {hasToss && (
          <InfoRow icon={<Award size={13} />} label="Toss">
            {stats.toss.winner} won, chose to {stats.toss.decision || 'play'}
          </InfoRow>
        )}
        {stats.preview?.pitchReport && (
          <InfoRow icon={<FileText size={13} />} label="Pitch Report">{stats.preview.pitchReport}</InfoRow>
        )}
        {stats.preview?.weather && (
          <InfoRow icon={<CloudSun size={13} />} label="Weather">{stats.preview.weather}</InfoRow>
        )}
        {stats.preview?.notes && (
          <InfoRow icon={<FileText size={13} />} label="Notes">{stats.preview.notes}</InfoRow>
        )}
        {!hasPreview && !hasToss && !match.venue && (
          <div style={{ padding: 14, fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)' }}>
            No additional match info yet.
          </div>
        )}
      </div>
    </div>
  );
}
