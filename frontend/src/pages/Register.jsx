import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.phone);
      toast.success(`Welcome to Next Door Library, ${user.name.split(' ')[0]}! 🌳`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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
          transition={{ duration: 0.8 }}
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

          <div>
            <h2 className="auth-left-title">Join our community of readers.</h2>
            <p className="auth-left-sub">
              Become part of Nagpur's growing reading culture. Access hundreds of books, join discussions, and connect with fellow book lovers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['📚 100+ curated books at ₹15–30/week', '🏠 Home delivery across Nagpur', '💬 Community forum & reading groups', '👥 See what your friends are reading'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(247,240,227,0.75)', fontSize: 'var(--text-sm)' }}>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="auth-left-quote">
            <p>"We read to know we are not alone."</p>
            <span>— C.S. Lewis</span>
          </div>
        </motion.div>
      </div>

      <div className="auth-right">
        <motion.div
          className="auth-form-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: '440px' }}
        >
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-sub">
              Already a member?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap">
                  <FiUser size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input with-icon"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                    id="register-name"
                  />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
                    id="register-email"
                  />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Phone Number</label>
                <div className="input-icon-wrap">
                  <FiPhone size={16} className="input-icon" />
                  <input
                    type="tel"
                    className="form-input with-icon"
                    placeholder="For rental coordination"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    id="register-phone"
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
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    id="register-password"
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-icon-wrap">
                  <FiLock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input with-icon"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    required
                    id="register-confirm-password"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} id="register-submit-btn">
              {loading ? 'Creating Account...' : 'Join the Library 🌳'}
            </button>
          </form>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px', lineHeight: '1.5' }}>
            By joining, you agree to our terms. We'll use your contact info solely for rental coordination.
          </p>
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
          gap: 40px;
          max-width: 400px;
        }
        .auth-logo { display: flex; align-items: center; gap: 12px; }
        .auth-logo-text { display: block; font-family: var(--font-serif); font-size: 1.1rem; font-weight: 600; color: var(--cream); }
        .auth-logo-sub { display: block; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--copper-light); margin-top: 3px; }
        .auth-left-title { font-family: var(--font-serif); font-size: 2.5rem; font-weight: 600; color: var(--cream); line-height: 1.2; margin-bottom: 12px; }
        .auth-left-sub { font-size: var(--text-sm); color: rgba(247, 240, 227, 0.6); line-height: 1.7; }
        .auth-left-quote { padding: 16px; border-left: 2px solid var(--copper); background: rgba(196, 144, 106, 0.08); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
        .auth-left-quote p { font-family: var(--font-serif); font-style: italic; font-size: var(--text-sm); color: rgba(247, 240, 227, 0.8); margin-bottom: 6px; }
        .auth-left-quote span { font-size: var(--text-xs); color: var(--copper-light); }
        .auth-right { display: flex; align-items: center; justify-content: center; padding: 60px; background: var(--cream); overflow-y: auto; }
        .auth-form-wrap { width: 100%; }
        .auth-form-header { margin-bottom: 32px; }
        .auth-form-title { font-family: var(--font-serif); font-size: var(--text-4xl); font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
        .auth-form-sub { font-size: var(--text-sm); color: var(--text-muted); }
        .auth-link { color: var(--copper); font-weight: 500; text-decoration: none; transition: color var(--transition-fast); }
        .auth-link:hover { color: var(--brown-rich); }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .input-icon-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--text-muted); pointer-events: none; z-index: 1; }
        .with-icon { padding-left: 42px !important; }
        .with-icon-right { padding-right: 42px !important; }
        .input-icon-right { position: absolute; right: 12px; color: var(--text-muted); cursor: pointer; padding: 4px; }
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 40px 24px; }
        }
      `}</style>
    </div>
  );
}
