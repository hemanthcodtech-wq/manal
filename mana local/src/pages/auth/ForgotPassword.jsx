import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import logo from '../../assets/logo.png';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { users, updatePassword } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!email) { setError('Email is required'); return; }

    const userExists = users.some(u => u.email === email);
    if (!userExists) {
      setError('No account found with this email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      
      if (data.success) {
        setResendCooldown(30);
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to connect to server to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter a 6-digit OTP'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      setLoading(false);
      
      if (data.success) {
        setStep(3);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to verify OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (passwords.password !== passwords.confirm) { setError('Passwords do not match'); return; }
    if (passwords.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate delay
    updatePassword(email, passwords.password);
    setLoading(false);
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <Link to="/">
            <img src={logo} alt="Mana Local" className="auth-logo" />
          </Link>
        </div>
        
        {step === 1 && (
          <>
            <h1>Reset Password</h1>
            <p className="auth-sub">Enter your email to receive an OTP</p>
            <form onSubmit={handleSendOtp}>
              <label>Email Address
                <div className="input-wrap">
                  <HiMail className="input-icon" />
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
              </label>
              {error && <div className="auth-error">⚠️ {error}</div>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Sending OTP...' : <><span>Send Recovery OTP</span> <HiArrowRight style={{width:16,height:16}} /></>}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Verify Email</h1>
            <p className="auth-sub">OTP sent to {email}</p>
            <form onSubmit={handleVerifyOtp}>
              <label>Enter 6-digit OTP
                <div className="input-wrap">
                  <HiLockClosed className="input-icon" />
                  <input type="text" placeholder="123456" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required autoFocus />
                </div>
              </label>
              <div className="otp-hint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💡 Check your email for the code.</span>
                <button type="button" onClick={() => handleSendOtp()} disabled={resendCooldown > 0 || loading} 
                  style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : 'var(--auth-primary)', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: 600, padding: 0, fontSize: '13px' }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
              {error && <div className="auth-error">⚠️ {error}</div>}
              <button type="submit" className="auth-submit" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : <><span>Verify OTP</span> <HiArrowRight style={{width:16,height:16}} /></>}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h1>New Password</h1>
            <p className="auth-sub">Enter your new secure password</p>
            <form onSubmit={handleResetPassword}>
              <label>New Password
                <div className="input-wrap">
                  <HiLockClosed className="input-icon" />
                  <input type="password" placeholder="••••••••" value={passwords.password}
                    onChange={e => setPasswords(p => ({ ...p, password: e.target.value }))} required autoFocus />
                </div>
              </label>
              <label>Confirm New Password
                <div className="input-wrap">
                  <HiLockClosed className="input-icon" />
                  <input type="password" placeholder="••••••••" value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required />
                </div>
              </label>
              {error && <div className="auth-error">⚠️ {error}</div>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Saving...' : <><span>Reset Password</span> <HiArrowRight style={{width:16,height:16}} /></>}
              </button>
            </form>
          </>
        )}

        <p className="auth-switch" style={{ marginTop: '32px' }}>
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>

      <div className="auth-visual">
        <div className="av-content">
          <div className="av-icon">🔒</div>
          <h2>Secure your account.</h2>
          <p>Get back into your account securely to manage your bookings, messages, and local business operations.</p>
          
          <div className="av-features-grid">
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>Bank-level Security</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Fast Recovery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
