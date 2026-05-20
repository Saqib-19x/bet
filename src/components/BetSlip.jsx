import { useState, useMemo } from 'react';
import { X, Trash2, TicketCheck, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bets } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import TeamLogo from './TeamLogo';

function splitMatch(title) {
  if (!title) return [null, null];
  const parts = title.split(/\s+vs\s+/i);
  return [parts[0]?.trim(), parts[1]?.trim()];
}

export default function BetSlip({ isOpen, onClose, selections, setSelections }) {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuth();
  const [stakes, setStakes] = useState({});           // per-selection singles stake
  const [builderStakes, setBuilderStakes] = useState({}); // per-match builder stake
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateStake = (id, value) => {
    setStakes((prev) => ({ ...prev, [id]: value }));
  };
  const updateBuilderStake = (matchId, value) => {
    setBuilderStakes((prev) => ({ ...prev, [matchId]: value }));
  };

  const removeSelection = (id) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
    setStakes((prev) => {
      const { [id]: _o, ...rest } = prev;
      return rest;
    });
  };

  const clearAll = () => {
    setSelections([]);
    setStakes({});
    setBuilderStakes({});
    setError('');
    setSuccess('');
  };

  // Group placeable selections by matchId so we can offer Bet Builder per-match
  const builderGroups = useMemo(() => {
    const groups = {};
    for (const sel of selections) {
      if (!sel.marketId || !sel.optionId || !sel.matchId) continue;
      const key = String(sel.matchId);
      if (!groups[key]) groups[key] = { matchId: sel.matchId, match: sel.match, selections: [] };
      groups[key].selections.push(sel);
    }
    // Only same-match groups with 2+ legs qualify for Bet Builder
    return Object.values(groups).filter((g) => g.selections.length >= 2);
  }, [selections]);

  const builderCombinedOdds = (groupSelections) =>
    parseFloat(groupSelections.reduce((acc, s) => acc * s.odds, 1).toFixed(2));

  const totalSinglesStake = Object.values(stakes).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const totalBuilderStake = Object.values(builderStakes).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const totalStake = totalSinglesStake + totalBuilderStake;

  const totalPotential = (() => {
    let p = 0;
    // singles
    for (const sel of selections) {
      const stake = parseFloat(stakes[sel.id]) || 0;
      p += stake * sel.odds;
    }
    // builders
    for (const g of builderGroups) {
      const stake = parseFloat(builderStakes[g.matchId]) || 0;
      p += stake * builderCombinedOdds(g.selections);
    }
    return p;
  })();

  const placeBets = async () => {
    setError('');
    setSuccess('');

    const browsable = selections.filter((s) => !s.marketId || !s.optionId);

    // Build the list of placements
    const placements = []; // each: { type: 'single'|'multi', payload, sourceIds }

    // 1. Singles — any selection with a stake
    for (const sel of selections) {
      if (!sel.marketId || !sel.optionId) continue;
      const stake = parseFloat(stakes[sel.id]);
      if (!stake || stake <= 0) continue;
      placements.push({
        type: 'single',
        payload: { marketId: sel.marketId, optionId: sel.optionId, stake },
        sourceIds: [sel.id],
      });
    }

    // 2. Bet Builders — one per match-group with a builder stake
    for (const g of builderGroups) {
      const stake = parseFloat(builderStakes[g.matchId]);
      if (!stake || stake <= 0) continue;
      placements.push({
        type: 'multi',
        payload: {
          stake,
          legs: g.selections.map((s) => ({ marketId: s.marketId, optionId: s.optionId })),
        },
        sourceIds: g.selections.map((s) => s.id),
      });
    }

    if (placements.length === 0) {
      setError(browsable.length > 0
        ? 'Open a match and pick odds inside a market to place a real bet.'
        : 'Enter a stake on at least one selection or Bet Builder.');
      return;
    }

    if (totalStake > (user?.balance ?? 0)) {
      setError(`Insufficient balance. You have ₹${(user?.balance ?? 0).toLocaleString('en-IN')}.`);
      return;
    }

    setSubmitting(true);
    try {
      let lastBalance = user?.balance ?? 0;
      const placedIds = new Set();
      let placedCount = 0;
      for (const p of placements) {
        const result = await bets.place(p.payload);
        lastBalance = result.balance;
        p.sourceIds.forEach((id) => placedIds.add(id));
        placedCount++;
      }
      updateBalance(lastBalance);
      setSelections((prev) => prev.filter((s) => !placedIds.has(s.id)));
      setStakes((prev) => {
        const next = { ...prev };
        placedIds.forEach((id) => delete next[id]);
        return next;
      });
      setBuilderStakes({});
      setSuccess(`Placed ${placedCount} bet${placedCount > 1 ? 's' : ''}. View in My Bets.`);
    } catch (err) {
      setError(err.message || 'Failed to place bet.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`betslip${isOpen ? ' open' : ''}`} id="bet-slip">
      <div className="betslip-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3>Bet Slip</h3>
          {selections.length > 0 && (
            <span className="betslip-count">{selections.length}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selections.length > 0 && (
            <button onClick={clearAll} className="btn btn-sm btn-secondary" style={{ fontSize: '11px' }}>
              <Trash2 size={12} /> Clear
            </button>
          )}
          <button onClick={onClose} className="btn btn-icon btn-secondary">
            <X size={16} />
          </button>
        </div>
      </div>

      {selections.length === 0 ? (
        <div className="betslip-empty">
          <TicketCheck size={48} strokeWidth={1} />
          <p style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            No selections
          </p>
          <p style={{ fontSize: 'var(--font-sm)' }}>
            Click on odds inside a match to add a selection
          </p>
        </div>
      ) : (
        <>
          <div className="betslip-body">
            {error && (
              <div style={{
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'rgba(244,67,54,0.1)', color: '#f44336',
                fontSize: 'var(--font-sm)', marginBottom: 'var(--space-sm)'
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'rgba(0,230,118,0.1)', color: 'var(--accent-green)',
                fontSize: 'var(--font-sm)', marginBottom: 'var(--space-sm)',
                cursor: 'pointer',
              }} onClick={() => navigate('/my-bets')}>
                {success}
              </div>
            )}

            {/* Single selections */}
            {selections.map((sel) => {
              const needsMarket = !sel.marketId || !sel.optionId;
              const [teamA, teamB] = splitMatch(sel.match);
              return (
                <div key={sel.id} className="betslip-item">
                  <div className="betslip-item-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {teamA && (
                          <span style={{ display: 'flex' }}>
                            <TeamLogo name={teamA} size={20} />
                            {teamB && <span style={{ marginLeft: -6 }}><TeamLogo name={teamB} size={20} /></span>}
                          </span>
                        )}
                        <div className="betslip-item-match">{sel.match}</div>
                      </div>
                      <div className="betslip-item-selection">
                        {sel.selection}
                        {sel.marketName && <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}> · {sel.marketName}</span>}
                      </div>
                      {needsMarket && (
                        <button
                          onClick={() => sel.matchId && navigate(`/match/${sel.matchId}`)}
                          style={{
                            marginTop: 4, fontSize: 'var(--font-xs)', color: 'var(--accent-yellow)',
                            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                          }}
                        >
                          Open match to choose a market →
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="betslip-item-odds">{sel.odds.toFixed(2)}</span>
                      <button
                        className="betslip-item-remove"
                        onClick={() => removeSelection(sel.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {!needsMarket && (
                    <div className="betslip-stake">
                      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>₹</span>
                      <input
                        type="number"
                        placeholder="Single stake"
                        min="0"
                        value={stakes[sel.id] || ''}
                        onChange={(e) => updateStake(sel.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bet Builder cards — one per match with 2+ legs */}
            {builderGroups.map((g) => {
              const combined = builderCombinedOdds(g.selections);
              const stake = parseFloat(builderStakes[g.matchId]) || 0;
              const potential = stake * combined;
              return (
                <div
                  key={`builder-${g.matchId}`}
                  style={{
                    marginTop: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    background: 'linear-gradient(135deg, rgba(0,230,118,0.06), rgba(68,138,255,0.04))',
                    border: '1px solid var(--accent-green-dim)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Layers size={14} style={{ color: 'var(--accent-green)' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--accent-green)' }}>
                      Bet Builder
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {g.selections.length} legs · {g.match}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Combined odds</span>
                    <span style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--accent-green)' }}>
                      {combined.toFixed(2)}
                    </span>
                  </div>
                  <div className="betslip-stake">
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>₹</span>
                    <input
                      type="number"
                      placeholder="Bet Builder stake"
                      min="0"
                      value={builderStakes[g.matchId] || ''}
                      onChange={(e) => updateBuilderStake(g.matchId, e.target.value)}
                    />
                  </div>
                  {stake > 0 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right' }}>
                      Potential win: <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>
                        ₹{potential.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="betslip-footer">
            <div className="betslip-summary">
              <div className="betslip-summary-row">
                <span>Selections</span>
                <span>{selections.length}</span>
              </div>
              <div className="betslip-summary-row">
                <span>Total Stake</span>
                <span>₹{totalStake.toFixed(2)}</span>
              </div>
              <div className="betslip-summary-row total">
                <span>Potential Win</span>
                <span>₹{totalPotential.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary w-full btn-lg"
              onClick={placeBets}
              disabled={submitting || totalStake <= 0}
            >
              {submitting ? 'Placing…' : `Place Bet — ₹${totalStake.toFixed(2)}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
