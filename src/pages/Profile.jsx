import { User, Mail, Shield, Bell, Key, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const [notifications, setNotifications] = useState({ bets: true, promos: false, results: true });

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your account settings and preferences</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Profile Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--font-2xl)', fontWeight: 800, position: 'relative'
            }}>
              RS
              <button style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent-green)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--bg-card)'
              }}>
                <Camera size={12} color="#000" />
              </button>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>Rahul Sharma</h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Member since Jan 2026</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
                <span style={{ color: 'var(--accent-green)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>Verified</span>
              </div>
            </div>
          </div>
          <div className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" className="input-field" defaultValue="Rahul Sharma" />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" defaultValue="rahul@email.com" />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input type="tel" className="input-field" defaultValue="+91 98765 43210" />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" className="input-field" defaultValue="1995-06-15" />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
          </div>
        </div>

        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* KYC Status */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
              <Shield size={18} />
              <h3 style={{ fontWeight: 700 }}>KYC Verification</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                { label: 'Email Verification', status: 'verified' },
                { label: 'Phone Verification', status: 'verified' },
                { label: 'Identity Document', status: 'verified' },
                { label: 'Address Proof', status: 'pending' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--space-md)', background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>{item.label}</span>
                  {item.status === 'verified' ? (
                    <span className="badge badge-won"><CheckCircle size={10} /> Verified</span>
                  ) : (
                    <span className="badge badge-pending"><AlertCircle size={10} /> Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
              <Bell size={18} />
              <h3 style={{ fontWeight: 700 }}>Notifications</h3>
            </div>
            {[
              { key: 'bets', label: 'Bet Updates', desc: 'Get notified about bet settlements' },
              { key: 'promos', label: 'Promotions', desc: 'Receive promotional offers' },
              { key: 'results', label: 'Match Results', desc: 'Live match result notifications' },
            ].map(item => (
              <div key={item.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-md) 0',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{item.label}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  style={{
                    width: 44, height: 24, borderRadius: 'var(--radius-full)',
                    background: notifications[item.key] ? 'var(--accent-green)' : 'var(--bg-elevated)',
                    position: 'relative', transition: 'background var(--transition-fast)'
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3,
                    left: notifications[item.key] ? 23 : 3,
                    transition: 'left var(--transition-fast)',
                  }}></div>
                </button>
              </div>
            ))}
          </div>

          {/* Change Password */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
              <Key size={18} />
              <h3 style={{ fontWeight: 700 }}>Change Password</h3>
            </div>
            <div className="auth-form">
              <div className="input-group">
                <label>Current Password</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
