import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import logo from '../../assets/logo.png';
import './Auth.css';

const DEMOS = [
  { label: 'Admin', email: 'admin@ourlocal.in', password: 'admin123', color: '#0f172a' },
  { label: 'Worker', email: 'ravi@ourlocal.in', password: 'worker123', color: '#0284c7' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // For now we assume worker login. If you want a unified login endpoint you would need to adjust the backend.
      // But let's try worker first, if it fails try admin.
      let res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/worker/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      let resultData = await res.json();
      
      // If it fails with invalid credentials, it might be an admin
      if (!res.ok && resultData.error === 'Invalid credentials') {
        res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        resultData = await res.json();
      }

      setLoading(false);
      
      if (!res.ok || resultData.error) {
        setError(resultData.error || 'Failed to login');
        return;
      }
      
      // Fetch the full user profile based on role (optional, but good for populate)
      // Since login just returns token, let's decode or we can fetch the profile
      const decodedToken = JSON.parse(atob(resultData.token.split('.')[1]));
      
      let fullProfile = { id: decodedToken.id, email: decodedToken.email, role: decodedToken.role };
      if (decodedToken.role === 'worker') {
        const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${decodedToken.id}/profile`);
        const profData = await profRes.json();
        if (profData.success) fullProfile = { ...fullProfile, ...profData.profile };
      }
      
      setUser(fullProfile, resultData.token);
      
      if (fullProfile.role === 'admin') navigate('/admin');
      else if (fullProfile.role === 'worker') navigate('/worker');
      else navigate('/');
    } catch (err) {
      setLoading(false);
      setError('Server connection error. Please try again.');
    }
  };

  const fillDemo = (demo) => setForm({ email: demo.email, password: demo.password });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <Link to="/">
            <img src={logo} alt="Mana Local" className="auth-logo" />
          </Link>
        </div>
        <h1>Welcome back</h1>
        <p className="auth-sub">Login to your professional account</p>

        {/* <div className="demo-pills">
          {DEMOS.map(d => (
            <button key={d.label} className="demo-pill" style={{ borderColor: d.color, color: d.color }} onClick={() => fillDemo(d)}>
              Try {d.label}
            </button>
          ))}
        </div> */}

        <form onSubmit={handleSubmit}>
          <label>Email
            <div className="input-wrap">
              <HiMail className="input-icon" />
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
          </label>
          <label>Password
            <div className="input-wrap">
              <HiLockClosed className="input-icon" />
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
          </label>
          {error && <div className="auth-error">⚠️ {error}</div>}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '8px' }}>
            <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--auth-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : <><span>Login</span> <HiArrowRight style={{width:16,height:16}} /></>}
          </button>
        </form>

        <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>

      <div className="auth-visual">
        <div className="av-content">
          <div className="av-icon">✨</div>
          <h2>Everything local, all in one place.</h2>
          <p>Connect with trusted professionals, discover jobs, and explore real estate tailored to your needs.</p>
          
          <div className="av-features-grid">
            <div className="feature-item">
              <span className="feature-icon">🔧</span>
              <span>Skilled Services</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💼</span>
              <span>Local Jobs</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏠</span>
              <span>Real Estate</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌟</span>
              <span>Trusted Ratings</span>
            </div>
          </div>

          <div className="av-stats">
            <div><strong>10k+</strong><span>Professionals</span></div>
            <div><strong>50+</strong><span>Services</span></div>
            <div><strong>4.8★</strong><span>Rating</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
