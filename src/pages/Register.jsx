import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page" style={{
      backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(0,230,118,0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(179,136,255,0.05) 0%, transparent 50%)'
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
          Create your account
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-2xl)' }}>
          Join BetKing and start winning today
        </p>

        <div className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>First Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input type="text" className="input-field" placeholder="Rahul" />
              </div>
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" className="input-field" placeholder="Sharma" />
            </div>
          </div>
          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input type="email" className="input-field" placeholder="you@example.com" />
            </div>
          </div>
          <div className="input-group">
            <label>Phone</label>
            <div className="input-with-icon">
              <Phone size={16} className="input-icon" />
              <input type="tel" className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={16} className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="Min 8 characters" />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
            <input type="checkbox" style={{ marginTop: 2, accentColor: 'var(--accent-green)' }} />
            I agree to the <a href="#" style={{ color: 'var(--accent-green)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent-green)' }}>Privacy Policy</a>. I confirm I am at least 18 years old.
          </label>
          <Link to="/" className="btn btn-primary btn-lg w-full">
            Create Account
          </Link>
        </div>

        <div className="auth-divider">or sign up with</div>

        <div className="social-buttons">
          <button className="social-btn">
            <span>G</span> Google
          </button>
          <button className="social-btn">
            <span>📱</span> Phone
          </button>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
