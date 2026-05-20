/**
 * Decorative cricket pitch graphic — sits as a faint background in the
 * MatchDetail header. Pure SVG, no images, scales to fill its parent.
 */
export default function PitchGraphic({ opacity = 0.04 }) {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* Outer boundary oval */}
      <ellipse cx="400" cy="150" rx="380" ry="135" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      {/* Inner 30-yard circle */}
      <ellipse cx="400" cy="150" rx="220" ry="78" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 4" />
      {/* Pitch strip */}
      <rect x="340" y="120" width="120" height="60" fill="none" stroke="#ffffff" strokeWidth="1" />
      {/* Crease lines */}
      <line x1="340" y1="135" x2="460" y2="135" stroke="#ffffff" strokeWidth="0.8" />
      <line x1="340" y1="165" x2="460" y2="165" stroke="#ffffff" strokeWidth="0.8" />
      {/* Stumps */}
      <line x1="360" y1="140" x2="360" y2="160" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="440" y1="140" x2="440" y2="160" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}
