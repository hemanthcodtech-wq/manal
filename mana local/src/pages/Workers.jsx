import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { services } from '../data/services';
import { HiLocationMarker, HiPhone, HiStar, HiBadgeCheck, HiBriefcase, HiSearch, HiMap } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuthStore } from '../store/useAuthStore';
import { createPortal } from 'react-dom';
import './Workers.css';

export default function Workers() {
  const [params] = useSearchParams();
  const serviceId = params.get('service');
  const subcategoryId = params.get('subcategory');
  const subcategoryName = params.get('name') || 'Service';
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const containerRef = useScrollReveal([searchQuery, workers]);
  
  const user = useAuthStore(s => s.user);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verifyMode, setVerifyMode] = useState('new'); // 'new' or 'existing'
  const [verifyForm, setVerifyForm] = useState({ name: '', email: '', phone: '' });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if (user || localStorage.getItem('mana_lead_verified') === 'true') {
      setIsVerified(true);
    }
  }, [user]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/lead-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...verifyForm, mode: verifyMode })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('mana_lead_verified', 'true');
        setIsVerified(true);
        setShowModal(false);
      } else {
        setVerifyError(data.error || 'Verification failed');
      }
    } catch (err) {
      setVerifyError('Network error. Try again.');
    } finally {
      setVerifyLoading(false);
    }
  };
  
  const service = serviceId ? services.find(s => s.id === serviceId) : { name: subcategoryName };

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const url = subcategoryId 
          ? `${import.meta.env.VITE_API_URL}/api/public/workers?subcategory_id=${subcategoryId}`
          : `${import.meta.env.VITE_API_URL}/api/admin/workers`; // Fallback for old route
          
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          const formatted = data.workers.map(w => ({
            id: w.id,
            name: w.name || w.email || 'Anonymous Professional',
            location: w.location || 'Local',
            image: w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || w.email || 'W')}&background=random`,
            rating: w.rating || '5.0',
            jobsCompleted: w.jobs_done || 0,
            experience: w.experience || '5+ years',
            distance: '2.0',
            rate: w.rate_per_hour || '500',
            phone: w.phone || 'Not provided',
            whatsapp: w.phone || ''
          }));
          setWorkers(formatted);
        }
      } catch (err) {
        console.error('Error fetching workers:', err);
      } finally {
        setLoading(false);
      }
    };
    if (service || subcategoryId) {
      fetchWorkers();
    }
  }, [serviceId, subcategoryId]);

  const serviceWorkers = workers.filter(w => {
    const lowerQuery = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(lowerQuery) || w.location.toLowerCase().includes(lowerQuery);
  });

  if (!service && !subcategoryId) {
    return (
      <div className="workers-page not-found">
        <h2>Service not found</h2>
        <button className="back-btn" onClick={() => navigate('/browse')}>Go back to Browse</button>
      </div>
    );
  }

  return (
    <div className="workers-page" ref={containerRef}>
      <div className="workers-header reveal-fade-in">
        <div className="wh-content">
          <h1>{service.name} Professionals</h1>
          <p>Found {serviceWorkers.length} highly rated {service.name.toLowerCase()}s near you</p>
        </div>
        <div className="wh-search">
          <HiSearch className="wh-search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="workers-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="worker-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                <Skeleton type="avatar" style={{ width: '60px', height: '60px' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton type="title" style={{ width: '60%', marginBottom: '8px' }} />
                  <Skeleton type="text" style={{ width: '40%' }} />
                </div>
              </div>
              <Skeleton type="card" style={{ height: '50px' }} />
            </div>
          ))
        ) : serviceWorkers.map(worker => (
          <div key={worker.id} className="worker-card reveal-on-scroll">
            <div className="wc-header">
              <img src={worker.image} alt={worker.name} className="wc-avatar" />
              <div className="wc-info">
                <h3>{worker.name} <HiBadgeCheck className="verified-badge" /></h3>
              </div>
            </div>
            
            <div className="wc-price">
              <span>Cost: </span>
              <strong>₹{worker.rate}/hr</strong>
            </div>

            {isVerified ? (
              <>
                <div className="wc-details">
                  <div className="wc-detail-item">
                    <HiBriefcase className="wc-icon" />
                    <span>Experience: <strong>{worker.experience}</strong></span>
                  </div>
                  <div className="wc-detail-item">
                    <HiLocationMarker className="wc-icon" />
                    <span>{worker.location}</span>
                  </div>
                  <div className="wc-detail-item">
                    <HiMap className="wc-icon" />
                    <span><strong>{worker.distance} km</strong> away</span>
                  </div>
                </div>

                <div className="wc-actions">
                  <a href={`https://wa.me/${worker.whatsapp}?text=Hi ${worker.name}, I found your profile on Mana Local and need your services.`} target="_blank" rel="noreferrer" className="wc-btn whatsapp-btn">
                    <FaWhatsapp /> WhatsApp
                  </a>
                  <a href={`tel:${worker.phone}`} className="wc-btn call-btn">
                    <HiPhone /> Call Now
                  </a>
                </div>
              </>
            ) : (
              <div style={{ padding: '0 24px 24px' }}>
                <button 
                  onClick={() => setShowModal(true)}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}
                >
                  View More Details
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && serviceWorkers.length === 0 && (
          <div className="no-workers">
            <p>No professionals available for this service right now.</p>
          </div>
        )}
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {verifyMode === 'new' ? 'Verify Details' : 'Already Verified'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              {verifyMode === 'new' ? 'Please enter your details to view contact information.' : 'Enter your registered email to continue.'}
            </p>

            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {verifyMode === 'new' && (
                <input 
                  type="text" placeholder="Full Name" required value={verifyForm.name}
                  onChange={e => setVerifyForm(p => ({...p, name: e.target.value}))}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                />
              )}
              <input 
                type="email" placeholder="Email Address" required value={verifyForm.email}
                onChange={e => setVerifyForm(p => ({...p, email: e.target.value}))}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }}
              />
              {verifyMode === 'new' && (
                <input 
                  type="tel" placeholder="Mobile Number" required value={verifyForm.phone}
                  onChange={e => setVerifyForm(p => ({...p, phone: e.target.value}))}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                />
              )}

              {verifyError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>{verifyError}</div>}

              <button type="submit" disabled={verifyLoading} style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
                {verifyLoading ? 'Processing...' : 'Continue'}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  setVerifyMode(prev => prev === 'new' ? 'existing' : 'new');
                  setVerifyError('');
                }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                {verifyMode === 'new' ? 'Already Verified? Login here' : 'New User? Verify Details'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
