import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useState, useRef, useEffect } from 'react';
import { HiHome, HiClipboardList, HiUsers, HiDotsHorizontal, HiLogout, HiChevronDown, HiDocumentText, HiCurrencyRupee, HiChartBar, HiOfficeBuilding, HiViewGridAdd } from 'react-icons/hi';
import { MdEngineering, MdConstruction } from 'react-icons/md';
import logo from '../../assets/logo.png';
import './Admin.css';

const NAV = [
  { to: '/admin',                       icon: HiHome,           label: 'Dashboard', end: true },
  { to: '/admin/customers',             icon: HiUsers,          label: 'Customers'           },
  { to: '/admin/workers',               icon: MdEngineering,    label: 'Workers'             },
  { to: '/admin/jobs',                  icon: HiClipboardList,  label: 'Jobs Posting'        },
  { to: '/admin/realestate',            icon: HiOfficeBuilding, label: 'Real Estate'         },
  { to: '/admin/categories',            icon: HiViewGridAdd,    label: 'Categories'          },
  { to: '/admin/subscriptions',         icon: HiCurrencyRupee,  label: 'Subscriptions'       },
  { to: '/admin/promotional-ads',       icon: HiDocumentText,   label: 'Promo Ads & Subs'    },
  { to: '/admin/subscription-reports',  icon: HiChartBar,       label: 'Reports'             },
];

export default function AdminLayout() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef();

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    const handler = (e) => { if (!dropRef.current?.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand desktop-only">
          <img src={logo} alt="Mana Local" className="sidebar-logo" />
          <span className="ath-badge">Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `abn-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="abn-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-top-header">
          <div className="ath-brand mobile-only">
            <img src={logo} alt="Mana Local" style={{ height: '28px', marginRight: '8px', objectFit: 'contain' }} />
            <span className="ath-badge">Admin</span>
          </div>
          <div className="desktop-only" style={{ flex: 1 }}></div>

          <div className="ath-user" ref={dropRef}>
            <button className="ath-user-btn" onClick={() => setDropOpen(o => !o)}>
              <div className="ath-avatar">{user?.name?.charAt(0)}</div>
              <div className="ath-info">
                <strong>{user?.name?.split(' ')[0]}</strong>
                <span>Administrator</span>
              </div>
              <HiChevronDown className={`ath-chevron ${dropOpen ? 'open' : ''}`} />
            </button>
            {dropOpen && (
              <div className="ath-dropdown">
                <div className="ath-drop-header">
                  <div className="ath-drop-avatar">{user?.name?.charAt(0)}</div>
                  <div>
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>
                </div>
                <hr className="ath-drop-divider" />
                <button className="ath-drop-item logout" onClick={handleLogout}>
                  <HiLogout className="ath-drop-icon" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
