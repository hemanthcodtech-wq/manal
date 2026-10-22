import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HiLocationMarker, 
  HiPhone, 
  HiBadgeCheck, 
  HiClock, 
  HiOutlineInformationCircle, 
  HiChevronLeft,
  HiShieldCheck,
  HiStar,
  HiBriefcase,
  HiSparkles,
  HiCheckCircle,
  HiShare
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuthStore } from '../store/useAuthStore';
import { createPortal } from 'react-dom';
import Skeleton from '../components/Skeleton';
import CustomerWorkerRouteMap from '../components/CustomerWorkerRouteMap';
import { calculateDistanceKm, formatDistance, getWorkerCoordinates, getCustomerLocation } from '../utils/geoDistance';
import './WorkerDetails.css';

export default function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Verification state for customer phone protection
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

  // Fetch real customer geolocation
  useEffect(() => {
    getCustomerLocation((loc) => {
      setUserLocation(loc);
    });
  }, []);

  // Fetch worker profile details from backend
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
      const cleanPhone = (worker.phone || '').replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=Hi ${encodeURIComponent(worker.name)}, I found your profile on Mana Local and would like to hire you for ${encodeURIComponent(worker.subcategory_name || 'services')}.`, '_blank');
    } else if (type === 'call') {
      window.location.href = `tel:${worker.phone}`;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${worker.name} on Mana Local`,
        text: `Hire ${worker.name} for ${worker.subcategory_name || 'services'} in ${worker.location || 'Local'}.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="wd-page-wrapper">
        <div className="wd-container wd-loading-container">
          <Skeleton type="card" style={{ height: '320px', borderRadius: '24px', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Skeleton type="card" style={{ height: '240px' }} />
            <Skeleton type="card" style={{ height: '240px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="wd-page-wrapper">
        <div className="wd-container wd-not-found">
          <div className="wd-empty-icon">👷</div>
          <h2>Professional Not Found</h2>
          <p>We couldn't locate this professional's verified profile.</p>
          <button onClick={() => navigate(-1)} className="wd-btn wd-btn-primary">
            Explore All Professionals
          </button>
        </div>
      </div>
    );
  }

  // Derive coordinates and distance
  const workerCoords = getWorkerCoordinates(worker, userLocation);
  const distanceKm = userLocation 
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, workerCoords.lat, workerCoords.lng)
    : (worker.distance ? parseFloat(worker.distance) : 4.2);

  const formattedDistance = formatDistance(distanceKm);

  const avatarUrl = worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'W')}&background=0284c7&color=fff&size=200`;
  
  let coverImageUrl = 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1600&q=80';
  if (worker.cover_image && worker.cover_image !== 'null' && worker.cover_image !== 'undefined') {
    coverImageUrl = worker.cover_image;
  } else if (worker.category_image && worker.category_image !== 'null' && worker.category_image !== 'undefined') {
    coverImageUrl = worker.category_image;
  }
  
  const displayName = worker.name || 'Professional Specialist';
  const displayRating = worker.rating ? parseFloat(worker.rating).toFixed(1) : '5.0';
  const jobsDone = worker.jobs_done || 48;

  return (
    <div className="wd-page-wrapper">
      {/* Top Floating Glass Navigation Header */}
      <header className="wd-header-glass">
        <div className="wd-header-inner">
          <button onClick={() => navigate(-1)} className="wd-nav-back-btn" title="Go back">
            <HiChevronLeft size={22} />
            <span className="wd-back-text">Back</span>
          </button>
          
          <div className="wd-header-title">
            <span className="wd-header-sub">{worker.category_name}</span>
            <span className="wd-header-main">{worker.subcategory_name || 'Professional Profile'}</span>
          </div>

          <div className="wd-header-actions">
            <button onClick={handleShare} className="wd-icon-btn" title="Share Profile">
              <HiShare size={19} />
              {copiedLink && <span className="wd-copied-tooltip">Copied!</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="wd-container">
        {/* Hero Banner Section */}
        <div className="wd-hero-banner">
          <img src={coverImageUrl} alt="Workplace Banner" className="wd-hero-img" />
          <div className="wd-hero-overlay"></div>
          
          <div className="wd-hero-floating-badges">
            <div className="wd-badge-pill wd-badge-verified">
              <HiShieldCheck size={18} /> Verified Specialist
            </div>
            <div className="wd-badge-pill wd-badge-dist">
              <HiLocationMarker size={16} /> {formattedDistance} away
            </div>
          </div>
        </div>

        {/* Master Responsive Grid (2-Column Desktop: Left Profile Info, Right Route Map & Pricing) */}
        <div className="wd-master-grid">
          
          {/* LEFT COLUMN: Worker Bio, Key Highlights, Pricing & Guarantees */}
          <div className="wd-left-column">
            
            {/* Identity Card */}
            <div className="wd-card wd-profile-card">
              <div className="wd-profile-top">
                <div className="wd-avatar-wrapper">
                  <img src={avatarUrl} alt={displayName} className="wd-avatar-large" />
                  <span className="wd-online-dot" title="Available for work"></span>
                </div>

                <div className="wd-profile-titles">
                  <div className="wd-name-row">
                    <h1 className="wd-worker-name">{displayName}</h1>
                    <HiBadgeCheck className="wd-verified-check" title="Identity Verified" />
                  </div>
                  <p className="wd-profession-tag">
                    {worker.subcategory_name || worker.category_name || 'Verified Professional'}
                  </p>
                  <p className="wd-location-meta">
                    <HiLocationMarker size={16} className="wd-loc-icon" /> 
                    {worker.location || 'Hyderabad Metro Region'}
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="wd-stats-strip">
                <div className="wd-stat-box">
                  <div className="wd-stat-val rating-gold">
                    <HiStar size={18} /> {displayRating}
                  </div>
                  <div className="wd-stat-lbl">Rating (50+ reviews)</div>
                </div>

                <div className="wd-stat-box">
                  <div className="wd-stat-val">
                    <HiBriefcase size={18} /> {jobsDone}+
                  </div>
                  <div className="wd-stat-lbl">Jobs Finished</div>
                </div>

                <div className="wd-stat-box">
                  <div className="wd-stat-val">
                    <HiClock size={18} /> {worker.experience || '6+ yrs'}
                  </div>
                  <div className="wd-stat-lbl">Experience</div>
                </div>
              </div>

              {/* Description */}
              <div className="wd-about-section">
                <h2 className="wd-section-title">
                  <HiSparkles className="wd-sparkle-icon" /> About the Professional
                </h2>
                <p className="wd-desc-text">
                  {worker.description || `${displayName} is an experienced, certified specialist in ${worker.subcategory_name || 'field services'} with guaranteed on-time arrival and transparent pricing.`}
                </p>
              </div>

              {/* Verified Highlights */}
              <div className="wd-features-list">
                <div className="wd-feature-chip">
                  <HiCheckCircle size={18} className="feat-check" /> Background Checked
                </div>
                <div className="wd-feature-chip">
                  <HiCheckCircle size={18} className="feat-check" /> GPS Direct Dispatch
                </div>
                <div className="wd-feature-chip">
                  <HiCheckCircle size={18} className="feat-check" /> Zero Upfront Booking Fee
                </div>
                <div className="wd-feature-chip">
                  <HiCheckCircle size={18} className="feat-check" /> Official Mana Local Warranty
                </div>
              </div>
            </div>

            {/* Fee Transparency & Trust Banner */}
            <div className="wd-trust-banner">
              <HiOutlineInformationCircle size={28} className="wd-trust-icon" />
              <div>
                <h3 className="wd-trust-title">Zero Upfront Fee Guarantee</h3>
                <p className="wd-trust-desc">
                  Never pay booking fees in advance. Inspect work quality first and settle rates directly with the worker upon satisfactory completion.
                </p>
              </div>
            </div>

            {/* Availability & Service Schedule */}
            <div className="wd-card wd-schedule-card">
              <h2 className="wd-section-title">
                <HiClock className="wd-sparkle-icon" /> Working Hours & Availability
              </h2>
              <div className="wd-schedule-grid">
                <div className="wd-sched-item">
                  <span className="sched-lbl">Daily Shift</span>
                  <span className="sched-val">
                    {worker.available_from && worker.available_to 
                      ? `${worker.available_from} - ${worker.available_to}`
                      : '8:00 AM - 8:00 PM (Standard)'}
                  </span>
                </div>
                <div className="wd-sched-item">
                  <span className="sched-lbl">Operating Days</span>
                  <span className="sched-val">{worker.available_days || 'Monday - Sunday (7 Days)'}</span>
                </div>
                <div className="wd-sched-item">
                  <span className="sched-lbl">Emergency Service</span>
                  <span className="sched-val sched-badge-live">Available on Call</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Customer-To-Worker Live Route Map & Direct Contact Card */}
          <div className="wd-right-column">
            
            {/* Interactive Customer -> Worker Route Map */}
            <div className="wd-card wd-map-card">
              <div className="wd-map-header">
                <div>
                  <h2 className="wd-map-title">Direct GPS Distance & Route</h2>
                  <p className="wd-map-sub">
                    Live route from your current location to {displayName}
                  </p>
                </div>
                <div className="wd-distance-tag">
                  {formattedDistance}
                </div>
              </div>

              {/* The Route Mapbox Visualizer */}
              <div className="wd-map-embed">
                <CustomerWorkerRouteMap 
                  customerCoords={userLocation || { lat: 17.3850, lng: 78.4867 }}
                  workerCoords={workerCoords}
                  customerLocationName={userLocation ? 'Your Current Location' : 'Hyderabad Central'}
                  workerLocationName={worker.location || 'Service Hub'}
                  workerName={displayName}
                  distanceKm={distanceKm}
                />
              </div>

              <div className="wd-map-notes">
                <span>📍 Dispatch Point: <strong>{worker.location || 'Local Area Center'}</strong></span>
                <span>⏱ Rapid response within 30-45 mins</span>
              </div>
            </div>

            {/* Pricing & Fast Contact Box */}
            <div className="wd-card wd-action-card">
              <div className="wd-pricing-header">
                <span className="wd-pricing-sub">Standard Transparent Rate</span>
                <div className="wd-pricing-main">
                  {worker.rate_per_hour ? (
                    <>
                      <span className="wd-price-currency">₹</span>
                      <span className="wd-price-amt">{worker.rate_per_hour}</span>
                      <span className="wd-price-unit">/ hr</span>
                    </>
                  ) : (
                    <span className="wd-price-custom">Standard Market Rates</span>
                  )}
                </div>
              </div>

              {/* Rate breakdown tags */}
              <div className="wd-rate-tags">
                {worker.rate_per_day && (
                  <div className="wd-rt-item">
                    <span>Full Day (8 hrs)</span>
                    <strong>₹{worker.rate_per_day}</strong>
                  </div>
                )}
                {worker.rate_per_week && (
                  <div className="wd-rt-item">
                    <span>Weekly Contract</span>
                    <strong>₹{worker.rate_per_week}</strong>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="wd-cta-group">
                <button 
                  onClick={() => handleAction('call')} 
                  className="wd-btn wd-btn-call-large"
                  id="btn-call-worker"
                >
                  <HiPhone size={22} className="btn-icon-wiggle" /> 
                  <span>Call {displayName}</span>
                </button>

                <button 
                  onClick={() => handleAction('whatsapp')} 
                  className="wd-btn wd-btn-whatsapp-large"
                  id="btn-chat-worker"
                >
                  <FaWhatsapp size={22} /> 
                  <span>Chat on WhatsApp</span>
                </button>
              </div>

              <div className="wd-contact-privacy">
                <HiShieldCheck size={18} className="privacy-shield" />
                <span>Verified lead protection enabled. Direct operator connection.</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Bottom Bar for Mobile Devices */}
      <div className="wd-bottom-mobile-bar">
        <div className="wd-mobile-price">
          <span className="mob-rate-lbl">Rate</span>
          <span className="mob-rate-val">
            {worker.rate_per_hour ? `₹${worker.rate_per_hour}/hr` : 'Verified Rate'}
          </span>
        </div>
        <div className="wd-mobile-btns">
          <button onClick={() => handleAction('whatsapp')} className="wd-mob-btn wd-mob-wa">
            <FaWhatsapp size={20} /> Chat
          </button>
          <button onClick={() => handleAction('call')} className="wd-mob-btn wd-mob-call">
            <HiPhone size={20} /> Call Now
          </button>
        </div>
      </div>

      {/* Verification Modal for New Inquirers */}
      {showModal && createPortal(
        <div className="wd-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="wd-modal-dialog">
            <button 
              onClick={() => setShowModal(false)} 
              className="wd-modal-close"
              aria-label="Close modal"
            >
              &times;
            </button>
            
            <div className="wd-modal-header">
              <div className="modal-shield-badge">
                <HiShieldCheck size={28} />
              </div>
              <h2 className="modal-title">
                {verifyMode === 'new' ? 'Connect With Specialist' : 'Welcome Back'}
              </h2>
              <p className="modal-sub">
                {verifyMode === 'new' 
                  ? 'Enter your name and contact number to reveal phone details and speak directly.' 
                  : 'Enter your registered email to continue instantly.'}
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="wd-modal-form">
              {verifyMode === 'new' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Sharma" 
                    required 
                    value={verifyForm.name}
                    onChange={e => setVerifyForm(p => ({...p, name: e.target.value}))}
                    className="modal-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={verifyForm.email}
                  onChange={e => setVerifyForm(p => ({...p, email: e.target.value}))}
                  className="modal-input"
                />
              </div>

              {verifyMode === 'new' && (
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number" 
                    required 
                    value={verifyForm.phone}
                    onChange={e => setVerifyForm(p => ({...p, phone: e.target.value}))}
                    className="modal-input"
                  />
                </div>
              )}

              {verifyError && (
                <div className="modal-error-box">{verifyError}</div>
              )}

              <button type="submit" disabled={verifyLoading} className="wd-modal-submit-btn">
                {verifyLoading ? 'Connecting...' : (verifyMode === 'new' ? 'Verify & View Number' : 'Continue')}
              </button>
            </form>

            <div className="modal-footer-toggle">
              <button 
                type="button"
                onClick={() => {
                  setVerifyMode(prev => prev === 'new' ? 'existing' : 'new');
                  setVerifyError('');
                }}
                className="modal-toggle-btn"
              >
                {verifyMode === 'new' ? 'Already verified? Login with email' : 'New to Mana Local? Quick Verify'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
