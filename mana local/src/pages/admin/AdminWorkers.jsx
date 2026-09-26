import { useState, useEffect } from 'react';
import { HiStar, HiPhone } from 'react-icons/hi';
import { MdDirectionsCar } from 'react-icons/md';
import Skeleton from '../../components/Skeleton';
import './Admin.css';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/admin/workers');
        const data = await res.json();
        if (data.success) {
          setWorkers(data.workers);
        }
      } catch (err) {
        console.error('Error fetching workers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const toggleStatus = async (workerId, currentStatus) => {
    // Basic optimistic update for UI. A full implementation would hit a PUT /api/admin/worker/:id/status route.
    const newStatus = currentStatus === 'active' ? 'busy' : 'active';
    setWorkers(workers.map(w => w.id === workerId ? { ...w, status: newStatus } : w));
  };

  const [selectedWorker, setSelectedWorker] = useState(null);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <Skeleton type="title" style={{ width: '200px' }} />
            <Skeleton type="text" style={{ width: '150px' }} />
          </div>
        </div>
        <div className="workers-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="worker-card">
              <div className="wc-top">
                <Skeleton type="avatar" style={{ width: '40px', height: '40px' }} />
                <Skeleton type="text" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
              </div>
              <Skeleton type="title" style={{ width: '120px', marginTop: '10px' }} />
              <Skeleton type="text" style={{ width: '140px' }} />
              <Skeleton type="text" style={{ width: '100px' }} />
              <div className="wc-stats">
                <Skeleton type="card" style={{ width: '100%', height: '40px' }} />
              </div>
              <Skeleton type="card" style={{ width: '100%', height: '36px', marginTop: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div><h1>Worker Management</h1><p>Manage professionals and their availability</p></div>
      </div>

      <div className="workers-grid">
        {workers.length === 0 ? (
           <p className="empty-msg">No workers registered.</p>
        ) : (
          workers.map(w => {
            const displayName = w.name || 'Unnamed Worker';
            const displayEmail = w.email || 'No Email';
            const displayPhone = w.phone || 'No phone number provided';
            
            return (
              <div key={w.id} className="worker-card">
                <div className="wc-top">
                  <div className="wc-avatar">{displayName.charAt(0).toUpperCase()}</div>
                  <div className={`wc-status ${w.status === 'active' ? 'on' : 'off'}`}>
                    {w.status === 'active' ? '● Available' : '● Busy'}
                  </div>
                </div>
                <h3 style={{ marginBottom: '4px' }}>{displayName}</h3>
                <p className="wc-phone" style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                  {displayEmail}
                </p>
                <p className="wc-phone">
                  <HiPhone style={{ width: 13, height: 13, verticalAlign: 'middle', marginRight: 4 }} />
                  {displayPhone}
                </p>
                
                <div className="wc-stats">
                  <div>
                    <strong>
                      <HiStar style={{ width: 14, height: 14, color: '#f59e0b', verticalAlign: 'middle' }} /> {w.rating || '5.0'}
                    </strong>
                    <span>Rating</span>
                  </div>
                  <div><strong>{w.jobs_done || 0}</strong><span>Jobs Done</span></div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <button
                    className={`toggle-avail ${w.status === 'active' ? 'set-busy' : 'set-avail'}`}
                    style={{ flex: 1 }}
                    onClick={() => toggleStatus(w.id, w.status)}
                  >
                    {w.status === 'active' ? 'Mark Busy' : 'Set Active'}
                  </button>
                  <button 
                    className="toggle-avail" 
                    style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#0f172a' }}
                    onClick={() => setSelectedWorker(w)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedWorker && (
        <div className="modal-overlay" onClick={() => setSelectedWorker(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>Worker Details</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Full Name</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.name || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Email</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.email || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Phone</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.phone || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Aadhar No.</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.aadhar_no || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Category</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.category_name || selectedWorker.category_id || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Sub Category</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.subcategory_name || selectedWorker.subcategory_id || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Experience</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.experience || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Location</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.location || 'Not Provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Plan ID</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.plan_id || 'Free'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Payment ID</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWorker.payment_id || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedWorker(null)}
              style={{ marginTop: '24px', width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
