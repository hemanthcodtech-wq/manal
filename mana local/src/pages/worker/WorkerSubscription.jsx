import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import './Worker.css';

export default function WorkerSubscription() {
  const user = useAuthStore(s => s.user);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/subscriptions')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPlans(data.subscriptions);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching plans', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="worker-page">
        <div className="worker-header">
          <div className="wh-left">
            <div>
              <h1>Subscription Plan</h1>
              <p>View your active subscription and manage renewals.</p>
            </div>
          </div>
        </div>
        <div className="worker-section" style={{ marginTop: 24 }}>
          <div className="skeleton sk-card" style={{ height: '220px' }}></div>
        </div>
      </div>
    );
  }

  const activePlan = plans.find(p => p.id == user.plan_id);

  let expiryDate = null;
  let daysLeft = 0;
  let isExpired = false;

  if (activePlan && user.created_at) {
    const createdDate = new Date(user.created_at);
    expiryDate = new Date(createdDate.getTime() + activePlan.days * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffTime = expiryDate - today;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) isExpired = true;
  }

  return (
    <div className="worker-page">
      <div className="worker-header">
        <div className="wh-left">
          <div>
            <h1>Subscription Plan</h1>
            <p>View your active subscription and manage renewals.</p>
          </div>
        </div>
      </div>
      
      <div className="worker-section" style={{ marginTop: 24 }}>
        {activePlan ? (
          <div className="active-job-card" style={{ background: isExpired ? '#fff1f2' : '#f0fdf4', borderColor: isExpired ? '#fecdd3' : '#bbf7d0' }}>
            <span className="aj-badge" style={{ background: isExpired ? '#ef4444' : '#16a34a', animation: 'none' }}>
              {isExpired ? 'EXPIRED' : 'ACTIVE PLAN'}
            </span>
            <h2 style={{ color: isExpired ? '#991b1b' : '#166534' }}>{activePlan.plan} - ₹{activePlan.amount}</h2>
            
            <div className="aj-details" style={{ marginTop: '16px' }}>
              <div className="aj-row">
                <strong>Duration:</strong> {activePlan.days} Days
              </div>
              <div className="aj-row">
                <strong>Expires On:</strong> {expiryDate ? expiryDate.toLocaleDateString() : 'N/A'}
              </div>
              <div className="aj-row">
                <strong>Status:</strong> {isExpired ? 'Plan has expired' : `Expires in ${daysLeft} day(s)`}
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button 
                className="aj-advance" 
                style={{ 
                  background: isExpired ? '#2563eb' : '#94a3b8', 
                  cursor: isExpired ? 'pointer' : 'not-allowed',
                  opacity: isExpired ? 1 : 0.7
                }}
                disabled={!isExpired}
              >
                Renew Subscription
              </button>
            </div>
            
            {!isExpired && (
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
                Renewal will be unlocked once your current plan expires.
              </p>
            )}
          </div>
        ) : (
          <div className="ac-empty">
            <p>You are currently on the free basic tier.</p>
            <button className="admin-btn-primary">View Premium Plans</button>
          </div>
        )}
      </div>
    </div>
  );
}
