// ===== Betfair / Lotus365-style back-lay ladder =====
// The backend (Diamond feed) exposes the REAL mirrored ladder per option:
//   option.priceLadder = [{ side:'back'|'lay', tier:0..n (0=best), price, size }]
//   option.backOdds / option.layOdds = tier-0 (best) prices
//   option.size = tier-0 back liquidity
// Fancy options carry a single real price (backOdds OR layOdds) and no ladder.
// We render exactly what the feed gives us — no synthetic prices or volumes.

// Standard Betfair price increments by band (used only by the bet-slip stepper).
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

const EMPTY = { price: null, size: 0 };

/**
 * Build the back/lay display arrays straight from the option's REAL ladder.
 * Returns { back: [{price,size} x3], lay: [{price,size} x3] }.
 *   - back is ordered worst→best (best adjacent to the spread, at index 2)
 *   - lay  is ordered best→worst (best adjacent to the spread, at index 0)
 * When there's no ladder (fancy = single price, or a suspended market with no
 * prices) we show only the real best price the API gives — never a fake spread.
 */
export function ladderFromOption(option, depth = 3) {
  const rungs = Array.isArray(option?.priceLadder) ? option.priceLadder : [];
  const back = rungs.filter((r) => r.side === 'back').sort((a, b) => a.tier - b.tier); // best→worst
  const lay = rungs.filter((r) => r.side === 'lay').sort((a, b) => a.tier - b.tier);   // best→worst

  const pad = (arr) => {
    const out = arr.slice(0, depth).map((r) => ({ price: r.price, size: r.size }));
    while (out.length < depth) out.push({ ...EMPTY });
    return out;
  };

  if (back.length || lay.length) {
    // Real full ladder (Match Odds / Bookmaker when live).
    return { back: pad(back).reverse(), lay: pad(lay) };
  }

  // No ladder: single real price (fancy) or nothing (suspended → both null).
  // Never fall back to option.odds — that can be the 1.01 suspended placeholder.
  const b = option?.backOdds ?? null;
  const l = option?.layOdds ?? null;
  const size = option?.size || 0;
  return {
    back: [{ ...EMPTY }, { ...EMPTY }, { price: b, size: b != null ? size : 0 }],
    lay: [{ price: l, size: l != null ? size : 0 }, { ...EMPTY }, { ...EMPTY }],
  };
}

// Compact money formatting used inside ladder cells: 25000 -> "25k", 738 -> "738".
export function fmtSize(n) {
  if (!n) return '';
  if (n >= 100000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}
