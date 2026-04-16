import { useState } from 'react';
import { Save, Shield, AlertTriangle, Globe, Percent, DollarSign, Clock } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    minBet: 10,
    maxBet: 100000,
    commission: 5,
    maxPayout: 1000000,
    maintenanceMode: false,
    registrationOpen: true,
    withdrawalEnabled: true,
    autoSettlement: true,
  });

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Platform Settings</h1>
      <p className="page-subtitle">Configure platform parameters and controls</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Betting Limits */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xl)' }}>
            <DollarSign size={18} style={{ color: 'var(--accent-green)' }} />
            <h3 style={{ fontWeight: 700 }}>Betting Limits</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="input-group">
              <label>Minimum Bet Amount (₹)</label>
              <input type="number" className="input-field" value={settings.minBet} onChange={e => update('minBet', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Maximum Bet Amount (₹)</label>
              <input type="number" className="input-field" value={settings.maxBet} onChange={e => update('maxBet', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Maximum Payout (₹)</label>
              <input type="number" className="input-field" value={settings.maxPayout} onChange={e => update('maxPayout', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Commission Rate (%)</label>
              <input type="number" className="input-field" value={settings.commission} onChange={e => update('commission', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Platform Controls */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xl)' }}>
            <Shield size={18} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontWeight: 700 }}>Platform Controls</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable platform access', icon: <AlertTriangle size={16} style={{ color: 'var(--accent-orange)' }} />, danger: true },
              { key: 'registrationOpen', label: 'Open Registration', desc: 'Allow new user registrations', icon: <Globe size={16} style={{ color: 'var(--accent-green)' }} /> },
              { key: 'withdrawalEnabled', label: 'Withdrawals Enabled', desc: 'Allow users to withdraw funds', icon: <DollarSign size={16} style={{ color: 'var(--accent-green)' }} /> },
              { key: 'autoSettlement', label: 'Auto Settlement', desc: 'Automatically settle bets on result', icon: <Clock size={16} style={{ color: 'var(--accent-blue)' }} /> },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-lg)',
                background: item.danger && settings[item.key] ? 'var(--accent-red-dim)' : 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: item.danger && settings[item.key] ? '1px solid rgba(255,82,82,0.3)' : '1px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  {item.icon}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{item.label}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => update(item.key, !settings[item.key])}
                  style={{
                    width: 44, height: 24, borderRadius: 'var(--radius-full)',
                    background: settings[item.key] ? (item.danger ? 'var(--accent-red)' : 'var(--accent-green)') : 'var(--bg-elevated)',
                    position: 'relative', transition: 'background var(--transition-fast)', flexShrink: 0
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3,
                    left: settings[item.key] ? 23 : 3,
                    transition: 'left var(--transition-fast)',
                  }}></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
        <button className="btn btn-primary btn-lg">
          <Save size={18} /> Save Settings
        </button>
        <button className="btn btn-secondary btn-lg">
          Reset to Default
        </button>
      </div>
    </div>
  );
}
