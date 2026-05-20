import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogoTile } from '../components/BrandMark';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page" style={{
      backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0,230,118,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(68,138,255,0.05) 0%, transparent 50%)'
    }}>
      <div className="auth-card">
        <div className="auth-logo">
          <BrandLogoTile size={44} />
          <h1>BetKing</h1>
        </div>
        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: '4px', fontSize: 'var(--font-xl)' }}>
          Welcome back
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-2xl)' }}>
          Sign in to your account to continue
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
          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <a href="#" style={{ color: 'var(--accent-green)', fontSize: 'var(--font-xs)' }}>Forgot password?</a>
            </label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full"
            style={{ marginTop: 'var(--space-sm)' }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
