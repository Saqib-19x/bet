/**
 * Curated cricket stadium photographs from Unsplash.
 *
 * Unsplash license: free for commercial + non-commercial use, no attribution required
 * (https://unsplash.com/license). We still credit the photographers in the UI as a courtesy.
 *
 * Each entry stores the photo ID plus the photographer + photo page URL for attribution.
 */
const STADIUM_PHOTOS = [
  { id: '1531415074968-036ba1b575da', credit: 'Alessandro Bogliari',  href: 'https://unsplash.com/photos/SgQHsRRMtNs' },
  { id: '1540747913346-19e32dc3e97e', credit: 'Patrick Case',         href: 'https://unsplash.com/photos/wuKE3vRcK7g' },
  { id: '1489944440615-453fc2b6a9a9', credit: 'Mick Haupt',           href: 'https://unsplash.com/photos/Q-OvAv5pwzc' },
  { id: '1512719994953-eabf50895df7', credit: 'Alessandro Bogliari',  href: 'https://unsplash.com/photos/lJp4PpsXEnA' },
  { id: '1625401586060-f12be3d7cc57', credit: 'Yogendra Singh',       href: 'https://unsplash.com/photos/SoUv8MUNV2Q' },
  { id: '1663832952954-170d73947ba7', credit: 'Manish Verma',         href: 'https://unsplash.com/photos/dB8sNz0bI7s' },
  { id: '1675693303492-9a5bc898bf94', credit: 'Mick Haupt',           href: 'https://unsplash.com/photos/o42cuYi24qY' },
  { id: '1594470117722-de4b9a02ebed', credit: 'Yogendra Singh',       href: 'https://unsplash.com/photos/HSY1apzZQ7M' },
];

/** Stable deterministic hash so the same match always gets the same photo. */
function hashKey(key) {
  let h = 0;
  const s = String(key || '');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Pick a stadium photo for this match. Same input → same photo (so users see
 * a stable image, not a flicker on every navigation).
 *
 * Returns { url, srcSet, credit, href } — pass the url straight into a
 * `background-image: url(…)` or `<img src>`.
 */
export function venueImageFor(match, { width = 1200 } = {}) {
  const seed = match?.venue || match?._id || match?.externalId || '';
  const photo = STADIUM_PHOTOS[hashKey(seed) % STADIUM_PHOTOS.length];
  return {
    url: `https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=${width}&q=70`,
    // 2x for retina screens
    srcSet: `https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=${width * 2}&q=70 2x`,
    credit: photo.credit,
    href: photo.href,
  };
}

export const VENUE_PHOTO_COUNT = STADIUM_PHOTOS.length;
