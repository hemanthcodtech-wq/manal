import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useStore } from '../store/useStore';
import {
  HiChevronDown, HiChevronUp,
  HiClipboardList, HiCog, HiLogout,
  HiLocationMarker, HiUser, HiSearch,
} from 'react-icons/hi';
import logo from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const cartCount = useStore(s => s.cart.length);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [authDropOpen, setAuthDropOpen] = useState(false);
  const [loc, setLoc] = useState('');
  const dropRef = useRef();
  const authDropRef = useRef();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = (e) => { 
      if (!dropRef.current?.contains(e.target)) setDropOpen(false); 
      if (!authDropRef.current?.contains(e.target)) setAuthDropOpen(false); 
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          const data = await res.json();
          if (data.address) setLoc(data.address.suburb || data.address.city_district || data.address.city || 'Unknown');
        } catch { setLoc('Location unavailable'); }
      },
      () => setLoc('Enable location')
    );
  }, []);

  return (
    <nav className="navbar">
      {/* ── Main Row ── */}
      <div className="nav-inner">
        <div className="nav-left">
          <Link to="/" className="brand">
            <img src={logo} alt="OurLocal Logo" className="brand-logo-img" />
          </Link>
        </div>

        <div className="nav-right">
          <div className="desktop-links">
            <Link to="/" className="desktop-link">Home</Link>
            <Link to="/browse" className="desktop-link">Categories</Link>
            <Link to="/jobs" className="desktop-link">Jobs</Link>
            <Link to="/realestate" className="desktop-link">Real Estate</Link>
            <Link to="/about" className="desktop-link">About Us</Link>
            <Link to="/contact" className="desktop-link">Contact Us</Link>
            {user && <Link to="/orders" className="desktop-link">Orders</Link>}
          </div>

          <button className="nav-search-btn" onClick={() => navigate('/browse')}>
            <HiSearch className="ns-icon" />
            <span className="ns-label">Search...</span>
          </button>

          {/* Auth Dropdown */}
          {!user && (
            <div className="user-menu" ref={authDropRef}>
              <button className="btn-nav-primary" onClick={() => setAuthDropOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Login {authDropOpen ? <HiChevronUp className="chevron-icon" /> : <HiChevronDown className="chevron-icon" />}
              </button>
              {authDropOpen && (
                <div className="dropdown">
                  <div className="drop-header">
                    <strong>Select Login</strong>
                  </div>
                  <hr />
                  <Link to="/login" className="drop-item" onClick={() => setAuthDropOpen(false)}>
                    <HiUser className="drop-icon" /> Worker Login
                  </Link>
                  <Link to="/login" className="drop-item" onClick={() => setAuthDropOpen(false)}>
                    <HiCog className="drop-icon" /> Admin Login
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Only show after login */}
          {user && (
            <div className="user-menu" ref={dropRef}>
              <button className="avatar-btn" onClick={() => setDropOpen(o => !o)}>
                <span className="avatar-circle">{user.name.charAt(0).toUpperCase()}</span>
                <span className="avatar-name">{user.name.split(' ')[0]}</span>
                {dropOpen ? <HiChevronUp className="chevron-icon" /> : <HiChevronDown className="chevron-icon" />}
              </button>
              {dropOpen && (
                <div className="dropdown">
                  <div className="drop-header">
                    <strong>{user.name}</strong>
                    <span className={`role-tag ${user.role}`}>{user.role}</span>
                  </div>
                  <div className="drop-email">{user.email}</div>
                  <hr />
                  {user.role === 'customer' && (
                    <Link to="/orders" className="drop-item" onClick={() => setDropOpen(false)}>
                      <HiClipboardList className="drop-icon" /> My Orders
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="drop-item" onClick={() => setDropOpen(false)}>
                      <HiCog className="drop-icon" /> Admin Panel
                    </Link>
                  )}
                  {user.role === 'worker' && (
                    <Link to="/worker" className="drop-item" onClick={() => setDropOpen(false)}>
                      <HiCog className="drop-icon" /> My Jobs
                    </Link>
                  )}
                  <button className="drop-item logout" onClick={handleLogout}>
                    <HiLogout className="drop-icon" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </nav>
  );
}
