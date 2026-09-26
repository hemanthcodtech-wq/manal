import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiClipboardList, HiLightningBolt, HiCheckCircle,
  HiCurrencyRupee, HiUsers, HiArrowRight, HiStar,
} from 'react-icons/hi';
import { MdPendingActions } from 'react-icons/md';
import Skeleton from '../../components/Skeleton';
import './Admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('http://localhost:3000/api/admin/dashboard-stats');
        const statsData = await statsRes.json();
        
        const workersRes = await fetch('http://localhost:3000/api/admin/workers');
        const workersData = await workersRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (workersData.success) setWorkers(workersData.workers);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="dash-welcome">
          <Skeleton type="title" style={{ width: '40%' }} />
        </div>
        <div className="stats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card" style={{ padding: '20px' }}>
              <Skeleton type="title" style={{ width: '50%', marginBottom: '10px' }} />
              <Skeleton type="text" style={{ width: '80%' }} />
            </div>
          ))}
        </div>
        <div className="quick-actions" style={{ marginTop: '20px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} type="text" style={{ width: '150px', height: '40px', borderRadius: '8px', display: 'inline-block', marginRight: '10px' }} />
          ))}
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Jobs',         val: stats?.totalJobs || 0,                           Icon: HiClipboardList,  cls: 'orange' },
    { label: 'Pending',            val: stats?.pendingJobs || 0,                         Icon: MdPendingActions, cls: 'yellow' },
    { label: 'Active Jobs',        val: (stats?.totalJobs || 0) - (stats?.pendingJobs || 0) - (stats?.completedJobs || 0), Icon: HiLightningBolt,  cls: 'blue'   },
    { label: 'Completed',          val: stats?.completedJobs || 0,                       Icon: HiCheckCircle,    cls: 'green'  },
    { label: 'Revenue',            val: `₹${(stats?.revenue || 0).toLocaleString()}`,    Icon: HiCurrencyRupee,  cls: 'purple' },
    { label: 'Total Workers',      val: stats?.totalWorkers || 0,                        Icon: HiUsers,          cls: 'teal'   },
  ];

  return (
    <div className="admin-page">
      <div className="dash-welcome">
        <p>Here's what's happening today 👋</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STAT_CARDS.map(({ label, val, Icon, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="sc-top">
              <div className="sc-val">{val}</div>
              <div className={`sc-icon-wrap ${cls}`}><Icon className="sc-icon" /></div>
            </div>
            <div className="sc-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {[
          { label: 'Manage Customers',   path: '/admin/customers',     cls: 'blue'   },
          { label: 'Manage Workers',     path: '/admin/workers',       cls: 'green'  },
          { label: 'Jobs Posting',       path: '/admin/jobs',          cls: 'orange' },
          { label: 'Real Estate',        path: '/admin/realestate',    cls: 'teal'   },
          { label: 'Subscriptions',      path: '/admin/subscriptions', cls: 'purple' },
        ].map(({ label, path, cls }) => (
          <button key={path} className={`qa-btn ${cls}`} onClick={() => navigate(path)}>
            {label} <HiArrowRight style={{ width: 14, height: 14 }} />
          </button>
        ))}
      </div>

      {/* Workers */}
      <div className="admin-section" style={{ marginTop: 16 }}>
        <div className="as-header">
          <h2>Workers</h2>
          <button onClick={() => navigate('/admin/workers')}>Manage <HiArrowRight style={{ width: 13, height: 13 }} /></button>
        </div>
        <div className="worker-list">
          {workers.length === 0 ? (
            <p className="empty-msg">No workers found.</p>
          ) : (
            workers.map(w => (
              <div key={w.id} className="worker-row">
                <div className="wr-avatar">{w.name ? w.name.charAt(0) : 'W'}</div>
                <div className="wr-info">
                  <strong>{w.name || w.email}</strong>
                  <span>{w.phone || 'No phone'}</span>
                </div>
                <div className={`avail-dot ${w.status === 'active' ? 'on' : 'off'}`} />
                <span className="wr-rating">
                  <HiStar style={{ width: 12, height: 12, color: '#f59e0b' }} /> {w.rating || '5.0'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
