import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page" style={{
      backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0,230,118,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(68,138,255,0.05) 0%, transparent 50%)'
    }}>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-green), #00c853)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
          }}>👑</div>
          <h1>BetKing</h1>
        </div>
        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: '4px', fontSize: 'var(--font-xl)' }}>
          Welcome back
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-2xl)' }}>
          Sign in to your account to continue
        </p>

        <div className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input type="email" className="input-field" placeholder="you@example.com" />
            </div>
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <a href="#" style={{ color: 'var(--accent-green)', fontSize: 'var(--font-xs)' }}>Forgot password?</a>
            </label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={16} className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Link to="/" className="btn btn-primary btn-lg w-full" style={{ marginTop: 'var(--space-sm)' }}>
            Sign In
          </Link>
        </div>

        <div className="auth-divider">or continue with</div>

        <div className="social-buttons">
          <button className="social-btn">
            <span>G</span> Google
          </button>
          <button className="social-btn">
            <span>📱</span> Phone
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
