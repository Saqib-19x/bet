/**
 * Custom inline-SVG illustrations for empty states. Each is hand-drawn,
 * animated subtly, and uses CSS variables so they pick up the theme.
 */

function CricketBatIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      {/* Soft halo */}
      <circle cx="60" cy="60" r="50" fill="var(--accent-green)" opacity="0.08" />
      {/* Bat */}
      <g transform="rotate(-25 60 60)" style={{ transformOrigin: '60px 60px' }}>
        <rect x="55" y="28" width="10" height="6" rx="2" fill="#8b6a3f" />
        <line x1="60" y1="34" x2="60" y2="58" stroke="#a0784a" strokeWidth="4" strokeLinecap="round" />
        <path d="M48 60 Q60 56 72 60 L72 92 Q60 96 48 92 Z" fill="#d4a86a" stroke="#8b6a3f" strokeWidth="1.2" />
        <line x1="54" y1="68" x2="54" y2="88" stroke="#a0784a" strokeWidth="0.6" />
        <line x1="60" y1="68" x2="60" y2="88" stroke="#a0784a" strokeWidth="0.6" />
        <line x1="66" y1="68" x2="66" y2="88" stroke="#a0784a" strokeWidth="0.6" />
      </g>
      {/* Cricket ball — bobbing */}
      <g style={{ animation: 'ballBob 2.4s ease-in-out infinite' }}>
        <circle cx="88" cy="78" r="6.5" fill="#c8201f" />
        <path d="M82 76 Q88 73 94 76" stroke="#fff" strokeWidth="0.6" fill="none" />
        <path d="M82 80 Q88 83 94 80" stroke="#fff" strokeWidth="0.6" fill="none" />
      </g>
    </svg>
  );
}

function TrophyIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="var(--accent-yellow)" opacity="0.10" />
      <g style={{ animation: 'trophyShine 2.6s ease-in-out infinite' }}>
        <path d="M40 36 L80 36 L78 56 Q78 70 60 74 Q42 70 42 56 Z" fill="#f6c948" stroke="#c48f1c" strokeWidth="1.4" />
        <path d="M40 40 Q26 40 30 56 Q34 60 42 56" fill="none" stroke="#c48f1c" strokeWidth="1.4" />
        <path d="M80 40 Q94 40 90 56 Q86 60 78 56" fill="none" stroke="#c48f1c" strokeWidth="1.4" />
        <rect x="52" y="76" width="16" height="4" fill="#c48f1c" />
        <rect x="46" y="80" width="28" height="6" rx="2" fill="#c48f1c" />
        <rect x="42" y="86" width="36" height="6" rx="2" fill="#a8730d" />
        <path d="M52 48 L56 50 L54 56" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
      {/* Stars */}
      <g fill="var(--accent-yellow)" opacity="0.85">
        <path d="M28 28 L29 31 L32 31 L29.5 33 L30.5 36 L28 34 L25.5 36 L26.5 33 L24 31 L27 31 Z" />
        <path d="M92 22 L93 24 L95 24 L93.5 25.5 L94 28 L92 26.5 L90 28 L90.5 25.5 L89 24 L91 24 Z" />
      </g>
    </svg>
  );
}

function TicketIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="var(--accent-blue)" opacity="0.08" />
      <g transform="rotate(-8 60 60)">
        <path d="M28 50 Q28 46 32 46 L88 46 Q92 46 92 50 L92 56 Q88 58 88 62 Q88 66 92 68 L92 74 Q92 78 88 78 L32 78 Q28 78 28 74 L28 68 Q32 66 32 62 Q32 58 28 56 Z"
              fill="#1e3a52" stroke="var(--accent-green)" strokeWidth="1.4" />
        <line x1="60" y1="46" x2="60" y2="78" stroke="var(--accent-green)" strokeWidth="1" strokeDasharray="2 3" />
        <text x="46" y="66" fontSize="9" fontWeight="800" fill="var(--accent-green)" textAnchor="middle">BET</text>
        <text x="76" y="66" fontSize="9" fontWeight="800" fill="var(--accent-green)" textAnchor="middle">WIN</text>
      </g>
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="var(--accent-blue)" opacity="0.08" />
      <g style={{ animation: 'searchTilt 3s ease-in-out infinite' }}>
        <circle cx="54" cy="54" r="20" fill="none" stroke="var(--accent-blue)" strokeWidth="3" />
        <line x1="68" y1="68" x2="86" y2="86" stroke="var(--accent-blue)" strokeWidth="4" strokeLinecap="round" />
        <path d="M44 54 L52 62 L66 46" stroke="var(--accent-blue)" strokeWidth="2" fill="none" strokeLinecap="round" strokeOpacity="0.4" />
      </g>
    </svg>
  );
}

function InboxIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="var(--accent-green)" opacity="0.08" />
      <path d="M30 50 L42 38 L78 38 L90 50 L90 80 Q90 84 86 84 L34 84 Q30 84 30 80 Z"
            fill="#1e3a52" stroke="var(--accent-green)" strokeWidth="1.4" />
      <path d="M30 50 L52 62 L68 62 L90 50" fill="none" stroke="var(--accent-green)" strokeWidth="1.4" />
      <rect x="50" y="44" width="20" height="14" rx="2" fill="var(--accent-green)" opacity="0.2" />
    </svg>
  );
}

const PRESETS = {
  bets:         { Illust: TicketIllustration,   title: 'No bets yet',           description: 'Pick an event from the Sports page and start your run.' },
  matches:      { Illust: CricketBatIllustration, title: 'No matches available', description: 'Nothing to bet on right now — check back when fixtures are live.' },
  liveMatches:  { Illust: TrophyIllustration,   title: 'Nothing live right now', description: 'Live matches will appear here as soon as they start.' },
  search:       { Illust: SearchIllustration,   title: 'No results',            description: 'Try a different search term or clear the filters.' },
  transactions: { Illust: InboxIllustration,    title: 'No transactions yet',   description: 'Your deposits, bets and payouts will show up here.' },
};

export default function EmptyState({ preset, illustration, title, description, action, compact = false }) {
  const base = preset ? PRESETS[preset] : null;
  const Illust = illustration || base?.Illust || InboxIllustration;
  const t = title ?? base?.title ?? 'Nothing here yet';
  const d = description ?? base?.description ?? '';
  const size = compact ? 80 : 120;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: compact ? '24px 16px' : '48px 24px',
      textAlign: 'center',
      color: 'var(--text-secondary)',
    }}>
      <div style={{ width: size, height: size }}>
        <Illust />
      </div>
      <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{t}</div>
      {d && (
        <div style={{ fontSize: 'var(--font-sm)', maxWidth: 320, lineHeight: 1.5 }}>
          {d}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
