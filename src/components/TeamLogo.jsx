import { useState } from 'react';

/**
 * IPL franchise-coloured fallback when no logo is available.
 * Keys are normalized lowercase substrings of team names.
 */
const TEAM_COLORS = {
  'mumbai indians':           ['#045093', '#d1ab3e'],
  'chennai super kings':      ['#fdb913', '#fa8a02'],
  'royal challengers':        ['#cf1019', '#000000'],
  'kolkata knight riders':    ['#3a225d', '#f7c12f'],
  'rajasthan royals':         ['#ea1a85', '#254aa5'],
  'delhi capitals':           ['#17479e', '#ee1c25'],
  'punjab kings':             ['#dd1f2d', '#a7a9ac'],
  'sunrisers hyderabad':      ['#fb643e', '#000000'],
  'gujarat titans':           ['#1c2046', '#b69b58'],
  'lucknow super giants':     ['#a0deff', '#003c7e'],
};

function colorsFor(name) {
  const lower = (name || '').toLowerCase();
  for (const key of Object.keys(TEAM_COLORS)) {
    if (lower.includes(key)) return TEAM_COLORS[key];
  }
  return ['#00e676', '#1e3a52'];
}

export { colorsFor as getTeamColors };

function initialsOf(name) {
  return (name || 'T')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 3)
    .join('')
    .toUpperCase();
}

/**
 * CricAPI logos come with a ?w=48 query param by default which looks blurry
 * on retina at any reasonable size. Bump it to ~2x display size for sharp rendering.
 */
function upscaleLogoUrl(url, displaySize) {
  if (!url) return url;
  try {
    const target = Math.max(96, Math.round(displaySize * 2));
    if (url.includes('?w=') || url.includes('&w=')) {
      return url.replace(/([?&])w=\d+/, `$1w=${target}`);
    }
    return `${url}${url.includes('?') ? '&' : '?'}w=${target}`;
  } catch {
    return url;
  }
}

/**
 * Known generic placeholders that should fall through to the initials
 * fallback instead of being rendered as broken / generic images.
 */
const PLACEHOLDER_URL_PATTERNS = [
  /h\.cricapi\.com\/img\/icon512\.png/i,
  /g\.cricapi\.com\/img\/icon\.png/i,
];

function isPlaceholderUrl(url) {
  if (!url) return false;
  return PLACEHOLDER_URL_PATTERNS.some((p) => p.test(url));
}

export default function TeamLogo({ name, logo, size = 32, rounded = true, style }) {
  const [errored, setErrored] = useState(false);
  const [c1, c2] = colorsFor(name);

  const wrap = {
    width: size,
    height: size,
    borderRadius: rounded ? '50%' : 6,
    background: `linear-gradient(135deg, ${c1}, ${c2})`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    color: '#fff',
    fontSize: Math.max(10, Math.round(size * 0.36)),
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.08)',
    ...style,
  };

  const usable = logo && !errored && !isPlaceholderUrl(logo);
  if (usable) {
    return (
      <span style={wrap} title={name}>
        <img
          src={upscaleLogoUrl(logo, size)}
          alt={name}
          onError={() => setErrored(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </span>
    );
  }

  return (
    <span style={wrap} title={name}>
      {initialsOf(name)}
    </span>
  );
}
