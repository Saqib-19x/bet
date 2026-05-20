/**
 * Reusable shimmering placeholder. Uses the global `shimmer` keyframe defined in styles/global.css.
 */
export function Skeleton({ width, height = 14, radius = 4, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--bg-tertiary) 0%, var(--bg-elevated) 50%, var(--bg-tertiary) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 1, width, ...rest }) {
  if (lines === 1) return <Skeleton width={width} {...rest} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} {...rest} />
      ))}
    </div>
  );
}

/** Match card skeleton — 2 team rows + 3 odds buttons */
export function MatchCardSkeleton() {
  return (
    <div className="match-card" style={{ pointerEvents: 'none' }}>
      <div className="match-card-header">
        <Skeleton width={90} />
        <Skeleton width={50} />
      </div>
      <div className="match-card-teams">
        <div className="match-card-team" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton width={28} height={28} radius={999} />
          <Skeleton width="60%" />
        </div>
        <div className="match-card-team" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton width={28} height={28} radius={999} />
          <Skeleton width="55%" />
        </div>
      </div>
      <div className="match-card-odds" style={{ marginTop: 12 }}>
        <Skeleton height={36} radius={6} />
        <Skeleton height={36} radius={6} />
        <Skeleton height={36} radius={6} />
      </div>
    </div>
  );
}

/** Bet card skeleton */
export function BetCardSkeleton() {
  return (
    <div className="card" style={{ padding: 'var(--space-lg)', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton width={32} height={32} radius={999} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width={120} />
            <Skeleton width={180} height={16} />
          </div>
        </div>
        <Skeleton width={60} height={22} radius={4} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width={50} height={10} />
            <Skeleton width="80%" height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Match-detail markets skeleton */
export function MarketSkeleton() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <Skeleton width={180} height={18} />
      </div>
      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <Skeleton height={50} radius={8} />
        <Skeleton height={50} radius={8} />
      </div>
    </div>
  );
}

export default Skeleton;
