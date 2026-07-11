import { useState, useEffect, useMemo } from 'react';
import { Info, X } from 'lucide-react';
import { ladderFromOption, fmtSize, stepUp, stepDown } from '../../lib/exchangeOdds';
import { bets } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import TeamLogo from '../TeamLogo';

const QUICK_STAKES = [100, 500, 1000, 5000, 25000, 50000, 100000];

// ---------- One ladder cell (a single back or lay price) ----------
function LadderCell({ data, side, best, disabled, onClick, flash }) {
  const isBack = side === 'back';
  const bg = isBack
    ? best ? 'var(--xch-back-best)' : 'var(--xch-back)'
    : best ? 'var(--xch-lay-best)' : 'var(--xch-lay)';
  const empty = data?.price == null;
  return (
    <button
      type="button"
      className={`xch-cell${flash ? ' xch-cell-flash' : ''}`}
      disabled={disabled || empty}
      onClick={() => !empty && onClick(data.price)}
      style={{ background: bg, opacity: disabled ? 0.4 : 1, cursor: empty || disabled ? 'default' : 'pointer' }}
    >
      <span className="xch-cell-price">{empty ? '–' : data.price.toFixed(2)}</span>
      <span className="xch-cell-size">{empty ? '' : fmtSize(data.size)}</span>
    </button>
  );
}

// ---------- One runner row (a selection: team / player / yes-no) ----------
function RunnerRow({ option, market, match, teamA, teamB, onPick }) {
  // Real mirrored ladder from the API (no synthesis).
  const ladder = useMemo(() => ladderFromOption(option), [option]);
  // Track previous odds as state (React's "info from previous render" pattern):
  // setState during render with a changed value is allowed and re-renders once,
  // staying clear of both the set-state-in-effect and refs-in-render lint rules.
  const [prevOdds, setPrevOdds] = useState(option.odds);
  const [flash, setFlash] = useState('');
  if (option.odds !== prevOdds) {
    setFlash(option.odds > prevOdds ? 'up' : 'down');
    setPrevOdds(option.odds);
  }
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(''), 800);
    return () => clearTimeout(t);
  }, [flash]);

  const disabled = market.status === 'suspended' || market.status === 'settled'
    || (option.status && option.status !== 'open');
  const teamLogo = option.label === teamA ? match.teamA?.logo : option.label === teamB ? match.teamB?.logo : null;
  const isTeam = option.label === teamA || option.label === teamB;
  // Fancy run-line (e.g. "15 over run" line 34) shown under the selection name.
  const line = option.line != null ? option.line : null;

  const pick = (side, price) => onPick({
    marketId: market._id,
    optionId: option._id,
    selection: option.label,
    marketName: market.name,
    side,
    price,
    matchId: match._id,
    match: `${teamA} vs ${teamB}`,
  });

  return (
    <div className={`xch-row${disabled ? ' xch-row-suspended' : ''}`}>
      <div className="xch-runner">
        {isTeam && <TeamLogo name={option.label} logo={teamLogo} size={22} />}
        {option.playerId && option.playerPhoto && <TeamLogo name={option.label} logo={option.playerPhoto} size={22} />}
        <div style={{ minWidth: 0 }}>
          <div className="xch-runner-name">{option.label}</div>
          {line != null && <div className="xch-runner-line">Line: {line}</div>}
        </div>
      </div>
      <div className="xch-ladder">
        {ladder.back.map((d, i) => (
          <LadderCell key={`b${i}`} data={d} side="back" best={i === 2} disabled={disabled}
            flash={i === 2 && flash} onClick={(p) => pick('back', p)} />
        ))}
        {ladder.lay.map((d, i) => (
          <LadderCell key={`l${i}`} data={d} side="lay" best={i === 0} disabled={disabled}
            flash={i === 0 && flash} onClick={(p) => pick('lay', p)} />
        ))}
      </div>
      {disabled && <div className="xch-suspended-overlay">SUSPENDED</div>}
    </div>
  );
}

// ---------- One market block (yellow header + ladder table) ----------
function MarketBlock({ market, match, teamA, teamB, onPick }) {
  return (
    <div className="xch-market">
      <div className="xch-market-head">
        <span className="xch-market-title">{market.name}</span>
        <Info size={14} className="xch-market-info" />
      </div>
      <div className="xch-minmax">
        Min: ₹{market.minStake ?? 100} &nbsp; Max: ₹{(market.maxStake || 0).toLocaleString('en-IN')}
        <span className="xch-col-labels">
          <span className="xch-lbl-back">BACK</span>
          <span className="xch-lbl-lay">LAY</span>
        </span>
      </div>
      <div className="xch-rows">
        {market.options.map((opt) => (
          <RunnerRow key={opt._id} option={opt} market={market} match={match}
            teamA={teamA} teamB={teamB} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

// ---------- One fancy / session market (single price per side, no ladder) ----------
// Fancy markets quote one run-line per side: a "No" (lay, under the line) and a
// "Yes" (back, over the line), each at a single price. Rendered as two big cells
// rather than a sparse 3+3 grid.
// Tidy a runner label for display: "0 Number" → "0", "Back 141" → "141" (when no
// line), leave "Odd"/"Even"/team names alone.
function cleanRunnerLabel(label) {
  return String(label || '').replace(/\s*Number$/i, '').replace(/^(Back|Lay)\s+/i, '').trim();
}

// One fancy runner cell. Derives its back/lay side from the option, shows its run
// line (or a short label) + price, and pulses when line or price changes.
function FancyCell({ opt, suspended, onPick }) {
  const isLay = opt.layOdds != null && opt.backOdds == null;
  const side = isLay ? 'lay' : 'back';
  const price = isLay ? (opt.layOdds ?? opt.odds) : (opt.backOdds ?? opt.odds);
  const display = opt.line != null ? opt.line : cleanRunnerLabel(opt.label);
  const tag = opt.line != null ? (side === 'back' ? 'YES' : 'NO') : null;

  const sig = `${opt.line}|${price}`;
  const [prevSig, setPrevSig] = useState(sig);
  const [flash, setFlash] = useState(false);
  if (sig !== prevSig) { setFlash(true); setPrevSig(sig); }
  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(false), 800);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <button type="button" className={`xch-fancy-cell ${side}${flash ? ' xch-cell-flash' : ''}`}
      disabled={suspended || price == null}
      onClick={() => price != null && onPick(opt, side, price)}>
      {tag && <span className="xch-fancy-tag">{tag}</span>}
      <span className="xch-fancy-run">{display !== '' && display != null ? display : '—'}</span>
      <span className="xch-fancy-price">@ {price != null ? price.toFixed(2) : '—'}</span>
    </button>
  );
}

// Any isFancy market (session / line / odd-even / meter / number) — renders all its
// runners as a responsive grid of cells.
function FancyBlock({ market, match, teamA, teamB, onPick }) {
  const suspended = market.status !== 'open';
  const pick = (opt, side, price) => onPick({
    marketId: market._id, optionId: opt._id, selection: opt.label, marketName: market.name,
    side, price, matchId: match._id, match: `${teamA} vs ${teamB}`,
  });
  return (
    <div className="xch-market">
      <div className="xch-market-head">
        <span className="xch-market-title">{market.name}</span>
        <Info size={14} className="xch-market-info" />
      </div>
      <div className="xch-minmax">
        Min: ₹{market.minStake ?? 100} &nbsp; Max: ₹{(market.maxStake || 0).toLocaleString('en-IN')}
      </div>
      <div className={`xch-fancy${suspended ? ' xch-row-suspended' : ''}`}>
        {market.options.map((o) => (
          <FancyCell key={o._id} opt={o} suspended={suspended} onPick={pick} />
        ))}
        {suspended && <div className="xch-suspended-overlay">SUSPENDED</div>}
      </div>
    </div>
  );
}

// ---------- The Place Bet panel (right column) ----------
function PlaceBetPanel({ bet, onClose, onPlaced }) {
  const { user, updateBalance } = useAuth();
  const [odds, setOdds] = useState(bet?.price ?? 0);
  const [stake, setStake] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { setOdds(bet?.price ?? 0); setStake(''); setMsg(null); }, [bet?.marketId, bet?.optionId, bet?.side, bet?.price]);

  if (!bet) {
    return (
      <div className="xch-betpanel xch-betpanel-empty">
        <div className="xch-betpanel-head">Place Bet</div>
        <div className="xch-betpanel-placeholder">
          Click any <span style={{ color: 'var(--xch-back-best)' }}>BACK</span> or{' '}
          <span style={{ color: 'var(--xch-lay-best)' }}>LAY</span> price to start a bet.
        </div>
      </div>
    );
  }

  const isBack = bet.side === 'back';
  const stakeNum = parseFloat(stake) || 0;
  const profit = stakeNum > 0 && odds > 1 ? stakeNum * (odds - 1) : 0;       // back profit
  const liability = stakeNum > 0 && odds > 1 ? stakeNum * (odds - 1) : 0;     // lay liability
  // Amount actually at risk / debited: stake for a back, liability for a lay.
  const atRisk = isBack ? stakeNum : liability;

  const submit = async () => {
    setMsg(null);
    if (stakeNum <= 0) { setMsg({ type: 'err', text: 'Enter a stake.' }); return; }
    if (atRisk > (user?.balance ?? 0)) {
      setMsg({ type: 'err', text: `Insufficient balance (₹${(user?.balance ?? 0).toLocaleString('en-IN')}). This lay risks ₹${atRisk.toLocaleString('en-IN')}.` });
      return;
    }
    setSubmitting(true);
    try {
      const res = await bets.place({ marketId: bet.marketId, optionId: bet.optionId, stake: stakeNum, odds, side: bet.side });
      if (res.balance != null) updateBalance(res.balance);
      onPlaced?.({ ...bet, odds, stake: stakeNum, profit, id: res._id || res.id || `${bet.optionId}-${stakeNum}` });
      setMsg({ type: 'ok', text: 'Bet placed.' });
      setStake('');
    } catch (e) {
      setMsg({ type: 'err', text: e.message || 'Failed to place bet.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="xch-betpanel">
      <div className="xch-betpanel-head">Place Bet</div>
      <div className={`xch-betform ${isBack ? 'xch-form-back' : 'xch-form-lay'}`}>
        <div className="xch-betform-grid xch-betform-labels">
          <span>{isBack ? 'Back' : 'Lay'} (Bet for)</span><span>Odds</span><span>Stake</span><span>{isBack ? 'Profit' : 'Liability'}</span>
        </div>
        <div className="xch-betform-grid">
          <div className="xch-sel">
            <button className="xch-sel-x" onClick={onClose}><X size={13} /></button>
            <span>{bet.selection}</span>
          </div>
          <div className="xch-stepper">
            <input type="number" value={odds} step="0.01" onChange={(e) => setOdds(parseFloat(e.target.value) || 0)} />
            <div className="xch-stepper-btns">
              <button onClick={() => setOdds((o) => stepUp(o))}>▲</button>
              <button onClick={() => setOdds((o) => stepDown(o))}>▼</button>
            </div>
          </div>
          <input className="xch-stakeinput" type="number" placeholder="0" value={stake}
            onChange={(e) => setStake(e.target.value)} />
          <span className="xch-profit">{(isBack ? profit : liability).toFixed(0)}</span>
        </div>

        <div className="xch-chips">
          {QUICK_STAKES.map((v) => (
            <button key={v} onClick={() => setStake(String(v))}>{v >= 1000 ? `${v / 1000}k` : v}</button>
          ))}
          <button className="xch-chip-clear" onClick={() => setStake('')}>CLEAR</button>
        </div>

        {msg && <div className={`xch-msg ${msg.type === 'ok' ? 'xch-msg-ok' : 'xch-msg-err'}`}>{msg.text}</div>}

        <div className="xch-betform-actions">
          <button className="xch-reset" onClick={() => { setStake(''); setOdds(bet.price); setMsg(null); }}>Reset</button>
          <button className="xch-submit" onClick={submit} disabled={submitting}>
            {submitting ? 'Placing…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- "My Bet" list (placed bets this session) ----------
function MyBetList({ bets: placed }) {
  return (
    <div className="xch-mybet">
      <div className="xch-mybet-head">My Bet</div>
      {placed.length === 0 ? (
        <div className="xch-mybet-empty">No bets placed yet.</div>
      ) : (
        <div className="xch-mybet-rows">
          <div className="xch-mybet-row xch-mybet-rowhead">
            <span>Selection</span><span>Odds</span><span>Stake</span>
          </div>
          {placed.map((b) => (
            <div key={b.id} className={`xch-mybet-row ${b.side === 'back' ? 'xch-mybet-back' : 'xch-mybet-lay'}`}>
              <span className="xch-mybet-sel">{b.selection}<small>{b.marketName}</small></span>
              <span>{b.odds.toFixed(2)}</span>
              <span>{b.stake}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Public component ----------
export default function ExchangeMarkets({ markets, match, teamA, teamB }) {
  const [activeBet, setActiveBet] = useState(null);
  const [placed, setPlaced] = useState([]);

  // Load the user's persisted OPEN bets for this match so the "My Bet" list
  // survives a refresh (it's not just session state).
  useEffect(() => {
    let alive = true;
    if (!match?._id) return undefined;
    bets.list({ status: 'open', limit: 100 })
      .then((res) => {
        if (!alive) return;
        const mine = (res.bets || [])
          .filter((b) => String(b.matchId) === String(match._id))
          .map((b) => ({ id: b._id, selection: b.selection, marketName: b.marketName, side: b.side || 'back', odds: b.odds, stake: b.stake }));
        setPlaced(mine);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [match?._id]);

  // Active markets float to the top, suspended sink to the bottom (settled last),
  // so bettable markets are always in view. Reflows live as markets toggle.
  // Match Odds stays pinned first among the active group.
  const ordered = useMemo(() => {
    const rank = (m) => (m.status === 'open' ? 0 : m.status === 'settled' ? 2 : 1);
    return [...(markets || [])].sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r) return r;
      if (a.type === 'match_winner') return -1;
      if (b.type === 'match_winner') return 1;
      return 0;
    });
  }, [markets]);

  if (!markets || markets.length === 0) {
    return <div className="card" style={{ color: 'var(--text-secondary)' }}>No markets available for this match yet.</div>;
  }

  return (
    <div className="xch-layout">
      <div className="xch-markets-col">
        {ordered.map((m) => (
          m.isFancy
            ? <FancyBlock key={m._id} market={m} match={match} teamA={teamA} teamB={teamB} onPick={setActiveBet} />
            : <MarketBlock key={m._id} market={m} match={match} teamA={teamA} teamB={teamB} onPick={setActiveBet} />
        ))}
      </div>
      <div className="xch-side-col">
        <PlaceBetPanel
          bet={activeBet}
          onClose={() => setActiveBet(null)}
          onPlaced={(b) => { setPlaced((p) => [b, ...p]); setActiveBet(null); }}
        />
        <MyBetList bets={placed} />
      </div>
    </div>
  );
}
