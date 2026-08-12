import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiBookOpen, FiTruck, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [otpStep, setOtpStep] = useState('details'); // 'details' | 'verify'
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!form.email || !form.name) {
      toast.error('Please fill in Name and Email');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post('/auth/send-otp', { email: form.email });
      if (res.data.success) {
        setOtpStep('verify');
        toast.success('Verification code sent to your email!');
        if (res.data.otp) {
          toast(`[DEV MODE] OTP Code: ${res.data.otp}`, { icon: '🔑', duration: 10000 });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.phone, otp);
      toast.success(`Welcome to Next Door Library, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.');
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
            <img src="/logo.png" alt="Next Door Library Logo" className="auth-logo-img" />
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: FiBookOpen, text: '100+ curated books at ₹15–30/week' },
              { icon: FiTruck, text: 'Home delivery across Nagpur' },
              { icon: FiMessageSquare, text: 'Community forum & reading groups' },
              { icon: FiUsers, text: 'See what your friends are reading' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(247,240,227,0.85)', fontSize: 'var(--text-sm)' }}>
                <item.icon size={18} style={{ color: 'var(--copper-light)', flexShrink: 0 }} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="auth-left-quote">
            <p>"We read to know we are not alone."</p>
            <span>- C.S. Lewis</span>
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

          {otpStep === 'details' ? (
            <form onSubmit={handleSendOtp} className="auth-form">
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

              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={sendingOtp} id="register-submit-btn">
                {sendingOtp ? 'Sending Verification OTP...' : 'Send Verification OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', border: '1px solid var(--cream-dark)', borderRadius: '8px', backgroundColor: 'rgba(196, 144, 106, 0.05)', textAlign: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 4px 0', lineHeight: 1.5 }}>
                    We've sent a 6-digit verification code to
                  </p>
                  <strong style={{ color: 'var(--brown-rich)', fontSize: 'var(--text-sm)' }}>{form.email}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Verification Code (OTP)</label>
                  <div className="input-icon-wrap">
                    <FiLock size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-input with-icon"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={6}
                      required
                      id="register-otp"
                      style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.2rem', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setOtpStep('details')} style={{ flex: 1 }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }} id="register-verify-btn">
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
                Didn't receive the email? <span onClick={handleSendOtp} style={{ color: 'var(--copper)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Resend code</span>
              </p>
            </form>
          )}

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
        .auth-logo-img { width: 48px; height: 48px; object-fit: contain; border-radius: 50%; }
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
