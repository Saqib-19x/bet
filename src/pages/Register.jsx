import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogoTile } from '../components/BrandMark';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', agree: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.agree) {
      setError('Please agree to the Terms of Service.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page" style={{
      backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(0,230,118,0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(179,136,255,0.05) 0%, transparent 50%)'
    }}>
      <div className="auth-card">
        <div className="auth-logo">
          <BrandLogoTile size={44} />
          <h1>BetKing</h1>
        </div>
        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: '4px', fontSize: 'var(--font-xl)' }}>
          Create your account
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-2xl)' }}>
          Join BetKing and start winning today
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: 'var(--font-sm)'
            }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>First Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Rahul"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Sharma"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="input-group">
            <label>Phone</label>
            <div className="input-with-icon">
              <Phone size={16} className="input-icon" />
              <input
                type="tel"
                className="input-field"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              style={{ marginTop: 2, accentColor: 'var(--accent-green)' }}
              checked={form.agree}
              onChange={(e) => update('agree', e.target.checked)}
            />
            I agree to the <a href="#" style={{ color: 'var(--accent-green)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent-green)' }}>Privacy Policy</a>. I confirm I am at least 18 years old.
          </label>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
