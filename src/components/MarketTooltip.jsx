import { useState, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Plain-language explanations for every market the platform creates.
 * Keyed by the canonical `Market.type` value, with fallback rules
 * for fancy markets that share a type but differ by threshold.
 */
const EXPLANATIONS = {
  match_winner:
    'Pick the team that wins the match. If the match is a tie or no-result, this market is voided and stakes refunded.',
  innings_runs:
    'Bet on whether the chosen innings total finishes above (Over) or below (Under) the line. Only counts the runs scored in that innings.',
  total_runs:
    'Total runs across both innings of the match. Includes extras.',
  over_runs:
    'Runs scored in a specific over. Wides and no-balls count toward the over total.',
  boundaries:
    'Total number of fours/sixes hit by both teams over the entire match. DLS or abandoned innings count whatever was completed.',
  fall_of_wicket:
    'Total wickets that fall in the innings (max 10). Retired-out counts; retired-hurt does not.',
  partnership:
    'Highest unbroken partnership in the match. Doesn\'t need to be at the time of cashout — settled on the final scorecard.',
  player_runs:
    'Runs scored by a specific player. If the player doesn\'t bat, the bet is voided.',
  top_batsman:
    'Player who scores the most runs in the match. If a player doesn\'t bat, they automatically lose. Dead-heat rules apply if there\'s a tie.',
  top_bowler:
    'Player who takes the most wickets. Tied wicket counts → fewer runs conceded wins. Hattricks count as 3 wickets.',
  man_of_match:
    'Official Man of the Match awarded after the game. We follow the broadcaster\'s announcement.',
  toss_winner:
    'Pick which team wins the coin toss before the match. Settled the moment toss happens.',
  run_rate:
    'Final run rate of the chosen innings, Over/Under the line. Calculated as total runs ÷ overs faced.',
  extras:
    'Total extras (wides, no-balls, byes, leg-byes, penalty) in the match. Excludes overthrows that were charged as runs to the batter.',
  over_under:
    'Match-level over/under line. The market name tells you what\'s being counted (goals/runs/etc.).',
  both_teams_score:
    'Whether both teams score in the match (football: 1+ goal each; cricket: at least 1 run each).',
  correct_score:
    'Predict the exact final score. High-odds market with no consolation for "close".',
  half_time:
    'Result at half-time (football) — Team A leads, Team B leads, or draw.',
  first_goal:
    'Which team scores the first goal of the match.',
  first_ball:
    'Outcome off the very first ball of the match.',
  custom:
    'Custom market — see the market name and operator notes for settlement rules.',
};

export default function MarketTooltip({ marketType, marketName }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const text = EXPLANATIONS[marketType] || EXPLANATIONS.custom;

  const close = () => setOpen(false);

  return (
    <span
      ref={wrapRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        title="What's this market?"
        aria-label="What's this market?"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 16, height: 16, borderRadius: '50%',
          background: 'transparent', border: 'none',
          color: 'var(--text-tertiary)', cursor: 'help',
        }}
      >
        <HelpCircle size={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 50,
            marginTop: 8,
            minWidth: 260,
            maxWidth: 320,
            padding: '10px 12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            fontSize: 'var(--font-xs)',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            whiteSpace: 'normal',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {marketName || 'Market'}
          </div>
          {text}
        </span>
      )}
    </span>
  );
}
