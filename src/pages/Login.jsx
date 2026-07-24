import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_ID = 'demo@betking.com';
const DEMO_PASSWORD = 'demo1234';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const signIn = async (id, pwd) => {
    setError('');
    setSubmitting(true);
    try {
      const user = await login(id, pwd);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(identifier, password);
  };

  const handleDemoLogin = () => {
    setIdentifier(DEMO_ID);
    setPassword(DEMO_PASSWORD);
    signIn(DEMO_ID, DEMO_PASSWORD);
  };

  return (
    <div className="login-screen">
      <button
        type="button"
        className="login-close"
        aria-label="Close"
        onClick={() => navigate('/')}
      >
        <X size={26} strokeWidth={3} />
      </button>

      <div className="login-stack">
        <h1 className="login-wordmark">
          BET<span>KING</span>
        </h1>

        <div className="login-card">
          <h2 className="login-heading">
            LOGIN <span className="login-heading-mark">🔒</span>
          </h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <input
              type="text"
              className="login-input"
              placeholder="User Name / Email"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-btn" disabled={submitting}>
              <span>{submitting ? 'Please wait…' : 'Login'}</span>
              <LogIn size={20} className="login-btn-icon" />
            </button>
          </form>

          <button
            type="button"
            className="login-btn"
            onClick={handleDemoLogin}
            disabled={submitting}
          >
            <span>Login with Demo ID</span>
            <LogIn size={20} className="login-btn-icon" />
          </button>

          <p className="login-legal">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>{' '}
            and{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a>{' '}
            apply.
          </p>

          <a className="login-support" href="mailto:support@betking.com">
            support@betking.com
          </a>
        </div>
      </div>
    </div>
  );
}
