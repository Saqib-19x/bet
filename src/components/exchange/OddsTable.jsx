import { Link, useNavigate } from 'react-router-dom';
import { fmtTime } from '../../lib/dateFormat';

const SPORT_ICON = {
  cricket: '🏏', football: '⚽', tennis: '🎾', basketball: '🏀',
  baseball: '⚾', hockey: '🏒', mma: '🥊', esports: '🎮',
};

/**
 * The Game / 1 / X / 2 grid shared by Home and Sports.
 *
 * Each outcome renders a back (blue) and a lay (pink) cell. The match-list
 * endpoints only carry one decimal per outcome (odds.home/draw/away) — that's
 * the back price. Lay prices live on the per-match markets endpoint, so they
 * render as a disabled "-" here rather than being invented.
 */
export default function OddsTable({ matches, liveIds, onAddSelection, loading, emptyText = 'No events in this section right now.' }) {
  const navigate = useNavigate();

  const addSelection = (match, side, label, price) => {
    onAddSelection?.({
      id: `${match._id}-${side}`,
      matchId: match._id,
      match: `${match.teamA?.name} v ${match.teamB?.name}`,
      selection: label,
      odds: price,
    });
  };

  const priceCells = (match) => {
    const odds = match.odds || {};
    const outcomes = [
      { key: 'home', back: odds.home, label: match.teamA?.name || '1' },
      { key: 'draw', back: odds.draw, label: 'Draw' },
      { key: 'away', back: odds.away, label: match.teamB?.name || '2' },
    ];
    return outcomes.flatMap(({ key, back, label }) => [
      <td className="xc-odd" key={`${key}-b`}>
        <button
          className="xc-back"
          disabled={!back}
          onClick={(e) => { e.stopPropagation(); addSelection(match, key, label, back); }}
        >
          {back ? back.toFixed(2) : '-'}
        </button>
      </td>,
      <td className="xc-odd" key={`${key}-l`}>
        <button className="xc-lay" disabled title="Lay prices are not in the match feed">-</button>
      </td>,
    ]);
  };

  return (
    <div className="xc-table-wrap">
      <table className="xc-table">
        <thead>
          <tr>
            <th className="xc-th-game">Game</th>
            <th colSpan={2}>1</th>
            <th colSpan={2}>X</th>
            <th colSpan={2}>2</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m._id} onClick={() => navigate(`/match/${m._id}`)} style={{ cursor: 'pointer' }}>
              <td>
                <div className="xc-game">
                  <span>{SPORT_ICON[m.sport] || '•'}</span>
                  <Link
                    to={`/match/${m._id}`}
                    className="xc-game-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.teamA?.name} v {m.teamB?.name} / {fmtTime(m.startTime)} (IST)
                  </Link>
                  <span className="xc-flags">
                    {liveIds?.has(m._id) && <span className="xc-live-dot" title="In-play" />}
                    {m.league && <span className="xc-tag xc-tag-bm">{m.league}</span>}
                  </span>
                </div>
              </td>
              {priceCells(m)}
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div className="xc-empty">Loading events…</div>}
      {!loading && matches.length === 0 && <div className="xc-empty">{emptyText}</div>}
    </div>
  );
}
