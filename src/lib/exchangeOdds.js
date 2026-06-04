// ===== Betfair / Lotus365-style back-lay ladder synthesis =====
// The backend exposes a single decimal `odds` per option. Exchange UIs show a
// 3-deep back ladder and a 3-deep lay ladder with traded volumes. We synthesise
// that ladder deterministically around the base price so the display is stable
// across re-renders (no Math.random — keeps SSR/StrictMode double-renders quiet).

// Standard Betfair price increments by band.
function tickSize(price) {
  if (price < 2) return 0.01;
  if (price < 3) return 0.02;
  if (price < 4) return 0.05;
  if (price < 6) return 0.1;
  if (price < 10) return 0.2;
  if (price < 20) return 0.5;
  if (price < 30) return 1;
  if (price < 50) return 2;
  if (price < 100) return 5;
  return 10;
}

const round2 = (n) => Math.round(n * 100) / 100;

export function stepUp(price, n = 1) {
  let v = price;
  for (let i = 0; i < n; i++) v = round2(v + tickSize(v));
  return v;
}

export function stepDown(price, n = 1) {
  let v = price;
  for (let i = 0; i < n; i++) v = round2(Math.max(1.01, v - tickSize(v)));
  return v;
}

// Deterministic pseudo-volume from price + slot, in the 0.7k–80k range banks see.
function synthSize(price, seed, slot) {
  const h = Math.abs(Math.sin((price * 12.9898 + seed * 4.1414 + slot * 7.233)) * 43758.5453);
  const frac = h - Math.floor(h);
  const base = price < 3 ? 6000 : price < 8 ? 2500 : 800;
  return Math.round(base * (0.4 + frac * 5)) / 1; // ~0.3k .. 14k-ish
}

/**
 * Build a back/lay ladder around a base decimal price.
 * Returns { back: [{price,size} x3], lay: [{price,size} x3] }.
 * back is ordered worst→best (left→right, best adjacent to the spread).
 * lay is ordered best→worst (left→right, best adjacent to the spread).
 */
export function buildLadder(odds, seed = 1) {
  if (!odds || odds <= 1) {
    const empty = [{ price: null, size: 0 }, { price: null, size: 0 }, { price: null, size: 0 }];
    return { back: empty, lay: empty };
  }
  const bestBack = round2(odds);
  const bestLay = stepUp(bestBack, 1);
  const back = [stepDown(bestBack, 2), stepDown(bestBack, 1), bestBack];
  const lay = [bestLay, stepUp(bestLay, 1), stepUp(bestLay, 2)];
  return {
    back: back.map((price, i) => ({ price, size: synthSize(price, seed, i) })),
    lay: lay.map((price, i) => ({ price, size: synthSize(price, seed, i + 3) })),
  };
}

// Compact money formatting used inside ladder cells: 25000 -> "25k", 738 -> "738".
export function fmtSize(n) {
  if (!n) return '0.0';
  if (n >= 100000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

// A stable numeric seed from a market/option id string.
export function seedFrom(str) {
  const s = String(str || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h || 1;
}
