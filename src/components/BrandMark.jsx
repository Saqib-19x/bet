/**
 * Custom SVG crown that replaces the 👑 emoji. Renders crisp at any size,
 * picks up its colour from CSS, and pairs nicely with the gradient logo tile.
 */
export default function BrandMark({ size = 22, strokeWidth = 2, color = '#000', style }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {/* Crown band */}
      <path d="M5 23h22" />
      {/* Crown peaks */}
      <path d="M5 23 L4 11 L11 17 L16 8 L21 17 L28 11 L27 23 Z" fill={color} fillOpacity={0.18} />
      {/* Jewels */}
      <circle cx="11" cy="17" r="1.6" fill={color} />
      <circle cx="16" cy="8" r="1.6" fill={color} />
      <circle cx="21" cy="17" r="1.6" fill={color} />
      {/* Base details */}
      <path d="M8 26h16" />
    </svg>
  );
}

/**
 * Wrapped variant — the crown inside the green-gradient tile, sized for headers.
 */
export function BrandLogoTile({ size = 44 }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: 'var(--radius-md)',
      background: 'linear-gradient(135deg, var(--accent-green), #00c853)',
      boxShadow: '0 4px 14px rgba(0,230,118,0.35)',
    }}>
      <BrandMark size={Math.round(size * 0.55)} color="#0a1612" strokeWidth={2.2} />
    </span>
  );
}
