import { useState } from 'react';
import { X, Trash2, TicketCheck } from 'lucide-react';

export default function BetSlip({ isOpen, onClose, selections, setSelections }) {
  const [stakes, setStakes] = useState({});

  const updateStake = (id, value) => {
    setStakes(prev => ({ ...prev, [id]: value }));
  };

  const removeSelection = (id) => {
    setSelections(prev => prev.filter(s => s.id !== id));
  };

  const clearAll = () => {
    setSelections([]);
    setStakes({});
  };

  const totalStake = Object.values(stakes).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const totalPotential = selections.reduce((sum, sel) => {
    const stake = parseFloat(stakes[sel.id]) || 0;
    return sum + stake * sel.odds;
  }, 0);

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
            Click on odds to add selections to your bet slip
          </p>
        </div>
      ) : (
        <>
          <div className="betslip-body">
            {selections.map(sel => (
              <div key={sel.id} className="betslip-item">
                <div className="betslip-item-header">
                  <div>
                    <div className="betslip-item-match">{sel.match}</div>
                    <div className="betslip-item-selection">{sel.selection}</div>
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
                <div className="betslip-stake">
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>₹</span>
                  <input
                    type="number"
                    placeholder="Stake"
                    value={stakes[sel.id] || ''}
                    onChange={e => updateStake(sel.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
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
            <button className="btn btn-primary w-full btn-lg">
              Place Bet — ₹{totalStake.toFixed(2)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
