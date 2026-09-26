import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { HiHome, HiUser, HiBriefcase, HiCurrencyRupee, HiSupport } from 'react-icons/hi';
import logo from '../../assets/logo.png';
import './Worker.css';

const NAV = [
  { to: '/worker',                icon: HiHome,           label: 'Dashboard'  },
  { to: '/worker/services',       icon: HiBriefcase,      label: 'Services'   },
  { to: '/worker/subscription',   icon: HiCurrencyRupee,  label: 'Plan'       },
  { to: '/worker/profile',        icon: HiUser,           label: 'Profile'    },
  { to: '/worker/support',        icon: HiSupport,        label: 'Support'    },
];

export default function WorkerLayout() {
  const user = useAuthStore(s => s.user);
  if (!user) return null;

  return (
    <div className="worker-layout">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="worker-sidebar">
        <div className="ws-header">
          <Link to="/">
            <img src={logo} alt="Mana Local" />
          </Link>
          <span className="wth-badge">Worker</span>
        </div>
        
        <nav className="ws-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/worker'} className={({ isActive }) => `ws-nav-item ${isActive ? 'active' : ''}`}>
              <Icon className="ws-nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ws-user">
          <div className="wth-avatar">{user.name.charAt(0)}</div>
          <div className="wth-info">
            <strong>{user.name.split(' ')[0]}</strong>
            <span className={`wth-status ${user.available ? 'online' : 'offline'}`}>
              {user.available ? '● Online' : '○ Offline'}
            </span>
          </div>
        </div>
      </aside>

      {/* --- MOBILE TOP HEADER --- */}
      <header className="worker-top-header">
        <div className="wth-brand">
          <Link to="/">
            <img src={logo} alt="Mana Local" style={{ height: '28px', marginRight: '6px', objectFit: 'contain' }} />
          </Link>
          <span className="wth-badge">Worker</span>
        </div>
        <div className="wth-user">
          <div className="wth-avatar">{user.name.charAt(0)}</div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="worker-main-content">
        <div className="worker-content">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="worker-bottom-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/worker'} className={({ isActive }) => `wbn-item ${isActive ? 'active' : ''}`}>
            <Icon className="wbn-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
