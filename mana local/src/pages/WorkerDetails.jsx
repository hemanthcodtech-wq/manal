import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiLocationMarker, HiPhone, HiBadgeCheck, HiClock, HiOutlineInformationCircle, HiChevronLeft } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuthStore } from '../store/useAuthStore';
import { createPortal } from 'react-dom';
import Skeleton from '../components/Skeleton';
import './WorkerDetails.css';

export default function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verification state
  const user = useAuthStore(s => s.user);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verifyMode, setVerifyMode] = useState('new');
  const [verifyForm, setVerifyForm] = useState({ name: '', email: '', phone: '' });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if (user || localStorage.getItem('mana_lead_verified') === 'true') {
      setIsVerified(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${id}/profile`);
        const data = await res.json();
        if (data.success && data.profile) {
          setWorker(data.profile);
        }
      } catch (err) {
        console.error('Error fetching worker details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchWorker();
  }, [id]);

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

  const handleAction = (type) => {
    if (!isVerified) {
      setShowModal(true);
      return;
    }
    if (type === 'whatsapp') {
      window.open(`https://wa.me/${worker.phone}?text=Hi ${worker.name}, I found your profile on Mana Local and need your services.`, '_blank');
    } else if (type === 'call') {
      window.location.href = `tel:${worker.phone}`;
    }
  };

  if (loading) {
    return (
      <div className="wd-container" style={{ padding: '80px 20px', maxWidth: 800, margin: '0 auto' }}>
        <Skeleton type="card" style={{ height: '200px', marginBottom: '20px' }} />
        <Skeleton type="title" />
        <Skeleton type="text" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="wd-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Professional not found</h2>
        <button onClick={() => navigate(-1)} className="wd-btn wd-btn-call" style={{ maxWidth: 200, margin: '20px auto' }}>Go Back</button>
      </div>
    );
  }

  const avatarUrl = worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'W')}&background=random`;
  
  // Use the worker's uploaded cover image, fallback to category image, then fallback to placeholder
  let coverImageUrl = 'https://images.unsplash.com/photo-1556761175-5972d9314cd1?auto=format&fit=crop&w=1200&q=80';
  if (worker.cover_image && worker.cover_image !== 'null' && worker.cover_image !== 'undefined') {
    coverImageUrl = worker.cover_image;
  } else if (worker.allow_showcase_images && worker.category_image && worker.category_image !== 'null' && worker.category_image !== 'undefined') {
    coverImageUrl = worker.category_image;
  }
  
  const displayName = worker.name || 'Professional';

  return (
    <div className="wd-container">
      {/* Top Bar Navigation */}
      <div className="wd-top-bar">
        <div className="wd-top-bar-inner">
          <button onClick={() => navigate(-1)} className="wd-back-btn">
            <HiChevronLeft />
          </button>
          <span style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Details</span>
        </div>
      </div>

      <div className="wd-content">
        {/* Cover Image */}
        <div className="wd-cover">
          <img src={coverImageUrl} alt="Cover" />
          <div className="wd-badge-location">
             <HiLocationMarker style={{ color: '#0284c7' }} /> {worker.distance || '15'} km • {worker.location || 'Local'}
          </div>
        </div>

        <div className="wd-details-card">
          
          {/* Profile Info */}
          <div className="wd-profile-header">
            <img src={avatarUrl} alt={worker.name} className="wd-avatar" />
            <div>
              <h1 className="wd-name">
                {displayName} <HiBadgeCheck style={{ color: '#0284c7' }} />
              </h1>
              <p className="wd-category">{worker.category_name} {worker.subcategory_name && `• ${worker.subcategory_name}`}</p>
            </div>
          </div>

          <h2 className="wd-title">
            {worker.subcategory_name || 'Professional Services'} with a personal touch
          </h2>
          
          {worker.description && (
            <p className="wd-desc">
              {worker.description}
            </p>
          )}

          {/* Info Grid */}
          <div className="wd-info-grid">
            <div className="wd-info-item">
              <div className="wd-info-icon">
                <HiClock />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Availability</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                  {worker.available_from && worker.available_to 
                    ? `${worker.available_from} to ${worker.available_to}` 
                    : 'Open Business Hours'}
                </div>
                {worker.available_days && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{worker.available_days}</div>}
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹</span>
              </div>
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Pricing</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  {worker.rate_per_hour && <div style={{ fontSize: '14px', fontWeight: '600' }}>₹{worker.rate_per_hour}/hr</div>}
                  {worker.rate_per_day && <div style={{ fontSize: '14px', fontWeight: '600' }}>₹{worker.rate_per_day}/day</div>}
                  {worker.rate_per_week && <div style={{ fontSize: '14px', fontWeight: '600' }}>₹{worker.rate_per_week}/week</div>}
                  {(!worker.rate_per_hour && !worker.rate_per_day && !worker.rate_per_week) && <div style={{ fontSize: '14px', fontWeight: '600' }}>Contact for pricing</div>}
                </div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                <span style={{ fontSize: '20px' }}>💼</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Experience</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                  {worker.experience || 'Not Specified'}
                </div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
                <HiLocationMarker />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Location</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                  {worker.location || 'Local Provider'}
                </div>
              </div>
            </div>
          </div>

          <hr className="wd-divider" />

          {/* Fee Not Required */}
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Fee not required</h3>
          <div className="wd-fee-box">
            <HiOutlineInformationCircle size={28} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#9a3412' }}>Avoid paying fees</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.6' }}>
                Professionals should not charge you any upfront booking fee. In case they do, please complain to us.
              </p>
            </div>
          </div>

          <hr className="wd-divider" />

          {/* Disclaimer */}
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#64748b', marginBottom: '12px' }}>Disclaimer</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            Mana Local is not responsible for the accuracy of the service details or the claims made by the professional in this profile.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '13px' }}>
            <span>Joined on {new Date(worker.created_at).toLocaleDateString()}</span>
            <span>👁 {worker.profile_views || 0} views</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="wd-bottom-bar">
        <div className="wd-bottom-bar-inner">
          <button onClick={() => handleAction('whatsapp')} className="wd-btn wd-btn-chat">
            <FaWhatsapp size={22} /> Chat
          </button>
          <button onClick={() => handleAction('call')} className="wd-btn wd-btn-call">
            <HiPhone size={22} /> Call Worker
          </button>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', position: 'relative', animation: 'slideUpFade 0.3s ease-out' }}>
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

              <button type="submit" disabled={verifyLoading} className="wd-btn wd-btn-call" style={{ marginTop: '8px' }}>
                {verifyLoading ? 'Processing...' : 'Continue'}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button 
                type="button"
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
