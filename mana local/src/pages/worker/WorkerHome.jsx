import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStore } from '../../store/useStore';
import {
  HiStar, HiBriefcase, HiCheckCircle, HiCurrencyRupee,
  HiLocationMarker, HiBadgeCheck, HiLightningBolt, HiCalendar, HiUser, HiArrowRight
} from 'react-icons/hi';
import { MdDirectionsCar, MdTrendingUp } from 'react-icons/md';
import '../Workers.css'; 
import './Worker.css'; 

export default function WorkerHome() {
  const user = useAuthStore(s => s.user);
  const updateWorkerAvailability = useAuthStore(s => s.updateWorkerAvailability);
  const orders = useStore(s => s.orders);
  const advanceStage = useStore(s => s.advanceStage);

  const myOrders = orders.filter(o => o.operator?.id === user.id);
  const activeJob = myOrders.find(o => ['assigned', 'active'].includes(o.status));
  const completedJobs = myOrders.filter(o => o.status === 'completed');
  
  // Fix Earnings calculation
  const dbJobs = parseInt(user.jobs_done) || user.jobsDone || 0;
  const totalCompleted = dbJobs + completedJobs.length;
  const baseRate = user.rate_per_day || 1200; // fallback avg rate
  
  const appEarnings = completedJobs.reduce((s, o) => s + (Number(o.booking?.total) || Number(o.booking?.price) || Number(o.vehicle?.price) || 0), 0);
  const dbEarnings = dbJobs * baseRate;
  const totalEarnings = appEarnings + dbEarnings;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const STATS = [
    { Icon: HiStar,          val: `${user.rating || '5.0'}★`,           label: 'Overall Rating',      color: '#f59e0b', bg: '#fef3c7' },
    { Icon: HiBriefcase,     val: totalCompleted,                        label: 'Total Jobs Done',     color: '#3b82f6', bg: '#eff6ff' },
    { Icon: HiLightningBolt, val: '98%',                                 label: 'Response Rate',       color: '#10b981', bg: '#ecfdf5' },
    { Icon: HiCurrencyRupee, val: `₹${totalEarnings.toLocaleString()}`, label: 'Total Earnings',      color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  if (loading) {
    return (
      <div className="worker-page">
        <div className="skeleton sk-box" style={{ height: '90px', marginBottom: '28px' }}></div>
        <div className="sk-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="skeleton sk-box"></div><div className="skeleton sk-box"></div>
          <div className="skeleton sk-box"></div><div className="skeleton sk-box"></div>
        </div>
        <div className="skeleton sk-card" style={{ height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className="worker-page" style={{ maxWidth: '1200px' }}>
      
      {/* Premium Header */}
      <div className="worker-header" style={{ padding: '24px', border: 'none', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="wh-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 min-content' }}>
          <div className="wh-avatar" style={{ background: '#3b82f6', minWidth: 60, width: 60, height: 60, fontSize: 28, border: '3px solid #334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ wordBreak: 'break-word' }}>
            <h1 style={{ color: '#fff', fontSize: 'clamp(20px, 4vw, 26px)', margin: '0 0 4px 0', lineHeight: 1.2 }}>Welcome back,<br/>{user.name.split(' ')[0]}! 👋</h1>
            <p className="wh-vehicle" style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>
              {user.vehicle || 'Professional Worker'}
            </p>
          </div>
        </div>
        <div className="avail-toggle" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#e2e8f0', fontWeight: 500 }}>Availability:</span>
          <button
            className={`toggle-btn ${user.available ? 'on' : 'off'}`}
            style={{ padding: '8px 24px', fontSize: '15px' }}
            onClick={() => updateWorkerAvailability(user.id, !user.available)}
          >
            {user.available ? '● Accepting Jobs' : '○ Offline'}
          </button>
        </div>
      </div>

      {/* Desktop Optimized Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px', marginBottom: '32px' }}>
        {STATS.map((st, i) => (
          <div key={i} className="admin-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: st.bg, color: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <st.Icon size={28} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{st.label}</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{st.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split for Desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
        
        {/* Profile Identity Card */}
        <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', margin: 0, color: '#0f172a' }}>My Profile Details</h2>
            <HiBadgeCheck size={28} color="#3b82f6" />
          </div>
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
              <img src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }} />
              <div>
                <h3 style={{ fontSize: '22px', margin: '0 0 6px 0', color: '#0f172a' }}>{user.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 600 }}>
                  <HiStar size={18} /> {user.rating || '5.0'} 
                  <span style={{ color: '#64748b', fontWeight: 400, fontSize: '14px' }}>({totalCompleted} reviews)</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f1f5f9', borderRadius: '12px' }}>
                <HiBriefcase size={24} color="#64748b" />
                <div>
                  <p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '13px' }}>Experience</p>
                  <strong style={{ color: '#1e293b', fontSize: '15px' }}>{user.experience || '3+ Years Professional'}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f1f5f9', borderRadius: '12px' }}>
                <HiLocationMarker size={24} color="#64748b" />
                <div>
                  <p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '13px' }}>Service Area</p>
                  <strong style={{ color: '#1e293b', fontSize: '15px' }}>{user.location || user.address || 'Chimakurty & Surroundings'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Job Premium Card */}
          {activeJob ? (
            <div className="admin-card" style={{ border: '2px solid #3b82f6', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#3b82f6' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ display: 'inline-block', padding: '6px 12px', background: '#eff6ff', color: '#2563eb', fontSize: '13px', fontWeight: 700, borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  🔴 Active Job
                </span>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{activeJob.id || 'New Order'}</span>
              </div>
              
              <h2 style={{ fontSize: '22px', margin: '0 0 16px 0', color: '#0f172a' }}>{activeJob.vehicle?.name || activeJob.booking?.service || 'Service Request'}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '15px' }}>
                  <HiLocationMarker size={20} color="#94a3b8" /> <strong>{activeJob.booking?.location || 'Address hidden'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '15px' }}>
                  <HiCalendar size={20} color="#94a3b8" /> <strong>{activeJob.booking?.date || new Date().toLocaleDateString()}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '15px', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginTop: '4px' }}>
                  <div style={{ width: 36, height: 36, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HiUser size={18} color="#64748b" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#1e293b' }}>{activeJob.customer?.name || 'Customer'}</strong>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{activeJob.customer?.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Stage</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{activeJob.stages?.[activeJob.stage] || 'Processing'}</div>
                </div>
                {activeJob.stages && activeJob.stage < activeJob.stages.length - 1 && (
                  <button onClick={() => advanceStage(activeJob.id)} className="admin-btn-primary" style={{ background: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Next Stage <HiArrowRight />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: '64px', height: '64px', background: user.available ? '#dcfce7' : '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '28px' }}>
                {user.available ? '🟢' : '💤'}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>
                {user.available ? 'Waiting for Jobs' : 'You are Offline'}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>
                {user.available ? 'Keep this page open to receive instant job notifications.' : 'Go online to start receiving and accepting new jobs.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
