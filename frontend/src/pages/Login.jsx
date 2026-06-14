import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 📚`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <motion.div
          className="auth-left-content"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-logo">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
              <circle cx="30" cy="30" r="28" stroke="var(--cream)" strokeWidth="1.5" opacity="0.4"/>
              <path d="M30 46C21 38 15 30 15 22C15 17.6 18.6 14 23 14C26 14 28.7 15.7 30 18C31.3 15.7 34 14 37 14C41.4 14 45 17.6 45 22C45 30 39 38 30 46Z"
                stroke="var(--cream)" strokeWidth="1.5" fill="var(--cream)" fillOpacity="0.15"/>
              <line x1="30" y1="18" x2="30" y2="46" stroke="var(--cream)" strokeWidth="1.2" opacity="0.6"/>
            </svg>
            <div>
              <span className="auth-logo-text">Next Door Library</span>
              <span className="auth-logo-sub">Nagpur</span>
            </div>
          </div>

          <div className="auth-left-hero">
            <h2 className="auth-left-title">
              Welcome<br />back, reader.
            </h2>
            <p className="auth-left-sub">
              Your next chapter is waiting. Sign in to continue your reading journey.
            </p>
          </div>

          <div className="auth-left-quote">
            <p>"Not all those who wander are lost."</p>
            <span>— J.R.R. Tolkien</span>
          </div>
        </motion.div>
      </div>

      <div className="auth-right">
        <motion.div
          className="auth-form-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-form-header">
            <h1 className="auth-form-title">Sign In</h1>
            <p className="auth-form-sub">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Join the library</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <FiMail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input with-icon"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  id="login-email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <FiLock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input with-icon with-icon-right"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  id="login-password"
                  autoComplete="current-password"
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} id="login-submit-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <Link to="/books" className="btn btn-ghost w-full" style={{ justifyContent: 'center' }}>
            Browse books without an account
          </Link>
        </motion.div>
      </div>

      <style>{`
        .auth-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        .auth-left {
          background: var(--brown-deep);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(196, 144, 106, 0.2) 0%, transparent 60%);
        }

        .auth-left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 48px;
          max-width: 400px;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auth-logo-text {
          display: block;
          font-family: var(--font-serif);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--cream);
          line-height: 1;
        }

        .auth-logo-sub {
          display: block;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--copper-light);
          margin-top: 3px;
        }

        .auth-left-hero {}

        .auth-left-title {
          font-family: var(--font-serif);
          font-size: 3rem;
          font-weight: 600;
          color: var(--cream);
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .auth-left-sub {
          font-size: var(--text-base);
          color: rgba(247, 240, 227, 0.6);
          line-height: 1.7;
        }

        .auth-left-quote {
          padding: 20px;
          border-left: 2px solid var(--copper);
          background: rgba(196, 144, 106, 0.08);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }

        .auth-left-quote p {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: var(--text-base);
          color: rgba(247, 240, 227, 0.8);
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .auth-left-quote span {
          font-size: var(--text-xs);
          color: var(--copper-light);
          letter-spacing: 0.05em;
        }

        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          background: var(--cream);
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        .auth-form-header {
          margin-bottom: 36px;
        }

        .auth-form-title {
          font-family: var(--font-serif);
          font-size: var(--text-4xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .auth-form-sub {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .auth-link {
          color: var(--copper);
          font-weight: 500;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .auth-link:hover { color: var(--brown-rich); }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          z-index: 1;
        }

        .with-icon { padding-left: 42px !important; }
        .with-icon-right { padding-right: 42px !important; }

        .input-icon-right {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          transition: color var(--transition-fast);
        }

        .input-icon-right:hover { color: var(--text-primary); }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 20px 0;
          color: var(--text-muted);
          font-size: var(--text-sm);
        }

        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(196, 144, 106, 0.2);
        }

        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 40px 24px; }
        }
      `}</style>
    </div>
  );
}
