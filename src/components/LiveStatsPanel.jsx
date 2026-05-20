import { TrendingUp, TrendingDown, Target, Timer, Activity } from 'lucide-react';

function Stat({ icon, label, value, hint, accent }) {
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 0,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 6,
        background: accent ? `${accent}22` : 'rgba(255,255,255,0.04)',
        color: accent || 'var(--text-secondary)',
        flexShrink: 0,
      }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </div>
        <div style={{ fontSize: 'var(--font-md)', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
          {value}
          {hint && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 4 }}>{hint}</span>}
        </div>
      </div>
    </div>
  );
}

export default function LiveStatsPanel({ liveStats }) {
  if (!liveStats || liveStats.crr == null) return null;

  const isChase = liveStats.inning === 2 && liveStats.rrr != null;
  const onTrack = isChase ? liveStats.rrr <= liveStats.crr : null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,82,82,0.06), rgba(0,230,118,0.04))',
      border: '1px solid var(--accent-green-dim)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-md)',
      marginBottom: 'var(--space-xl)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-sm)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 8px', borderRadius: 999,
          background: 'rgba(255,82,82,0.15)', color: '#ff5252',
          fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
        }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ff5252', animation: 'pulse 1.5s infinite' }} />
          IN-PLAY
        </span>
        {liveStats.battingTeam && (
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
            {liveStats.battingTeam} batting
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 500, marginLeft: 6 }}>
              · {liveStats.inning === 1 ? '1st innings' : '2nd innings'}
            </span>
          </span>
        )}
      </div>

      {liveStats.statusText && (
        <div style={{
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          marginBottom: 'var(--space-md)',
          color: 'var(--text-primary)',
        }}>
          {liveStats.statusText}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 8,
      }}>
        <Stat
          icon={<TrendingUp size={14} />}
          label="Current RR"
          value={liveStats.crr?.toFixed(2)}
          accent="var(--accent-green)"
        />
        {isChase && (
          <>
            <Stat
              icon={onTrack ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              label="Required RR"
              value={liveStats.rrr.toFixed(2)}
              accent={onTrack ? 'var(--accent-green)' : 'var(--accent-red)'}
            />
            <Stat
              icon={<Target size={14} />}
              label="Target"
              value={liveStats.target}
              hint={`need ${liveStats.runsNeeded}`}
              accent="var(--accent-yellow)"
            />
            <Stat
              icon={<Timer size={14} />}
              label="Balls Left"
              value={liveStats.ballsRemaining}
              hint={`${(liveStats.ballsRemaining / 6).toFixed(1)} ov`}
              accent="var(--accent-blue)"
            />
          </>
        )}
        {!isChase && (
          <Stat
            icon={<Activity size={14} />}
            label="Projected Total"
            value={liveStats.crr > 0 ? Math.round(liveStats.crr * 20) : '—'}
            hint="at current rate"
            accent="var(--accent-yellow)"
          />
        )}
      </div>
    </div>
  );
}
