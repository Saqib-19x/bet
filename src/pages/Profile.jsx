import { Shield, Bell, Key, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth as authApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const [notifications, setNotifications] = useState({ bets: true, promos: false, results: true });

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const saveProfile = async () => {
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile(profile);
      updateUser({ name: res.user.name, phone: res.user.phone });
      setProfileMsg('Profile updated.');
    } catch (err) {
      setProfileErr(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setPwMsg('');
    setPwErr('');
    if (pw.next.length < 6) {
      setPwErr('New password must be at least 6 characters.');
      return;
    }
    setSavingPw(true);
    try {
      const res = await authApi.changePassword({ currentPassword: pw.current, newPassword: pw.next });
      setPwMsg(res.message || 'Password updated.');
      setPw({ current: '', next: '' });
    } catch (err) {
      setPwErr(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your account settings and preferences</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--font-2xl)', fontWeight: 800, position: 'relative'
            }}>
              {initials}
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
              <h3 style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>{user?.name}</h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Member since {joined}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
                <span style={{ color: 'var(--accent-green)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                  {user?.status === 'active' ? 'Active' : user?.status}
                </span>
              </div>
            </div>
          </div>
          <div className="auth-form">
            {profileErr && <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: 'var(--font-sm)' }}>{profileErr}</div>}
            {profileMsg && <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(0,230,118,0.1)', color: 'var(--accent-green)', fontSize: 'var(--font-sm)' }}>{profileMsg}</div>}
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                className="input-field"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" value={user?.email || ''} disabled />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input
                type="tel"
                className="input-field"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
              <Shield size={18} />
              <h3 style={{ fontWeight: 700 }}>KYC Verification</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                { label: 'Email Verification', status: 'verified' },
                { label: 'Phone Verification', status: user?.phone ? 'verified' : 'pending' },
                { label: 'Identity Document', status: 'pending' },
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

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
              <Bell size={18} />
              <h3 style={{ fontWeight: 700 }}>Notifications</h3>
            </div>
            {[
              { key: 'bets', label: 'Bet Updates', desc: 'Get notified about bet settlements' },
              { key: 'promos', label: 'Promotions', desc: 'Receive promotional offers' },
              { key: 'results', label: 'Match Results', desc: 'Live match result notifications' },
            ].map((item) => (
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
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
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

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
              <Key size={18} />
              <h3 style={{ fontWeight: 700 }}>Change Password</h3>
            </div>
            <div className="auth-form">
              {pwErr && <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: 'var(--font-sm)' }}>{pwErr}</div>}
              {pwMsg && <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(0,230,118,0.1)', color: 'var(--accent-green)', fontSize: 'var(--font-sm)' }}>{pwMsg}</div>}
              <div className="input-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={pw.current}
                  onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={pw.next}
                  onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                />
              </div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={changePassword} disabled={savingPw}>
                {savingPw ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
