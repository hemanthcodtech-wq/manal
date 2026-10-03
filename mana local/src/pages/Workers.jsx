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

// Global cache to prevent reloading when navigating back from details
let cachedWorkersData = null;
let cachedSubcategoryId = null;

export default function Workers() {
  const [params] = useSearchParams();
  const serviceId = params.get('service');
  const subcategoryId = params.get('subcategory');
  const subcategoryName = params.get('name') || 'Service';
  const [searchQuery, setSearchQuery] = useState('');
  
  const isCached = cachedSubcategoryId === subcategoryId && cachedWorkersData !== null;
  const [workers, setWorkers] = useState(isCached ? cachedWorkersData : []);
  const [loading, setLoading] = useState(!isCached);
  
  const navigate = useNavigate();
  const containerRef = useScrollReveal([searchQuery, workers]);
  
  const [verifyError, setVerifyError] = useState('');

  // Verification logic moved to WorkerDetails
  
  const service = serviceId ? services.find(s => s.id === serviceId) : { name: subcategoryName };

  useEffect(() => {
    if (isCached) return;

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
          cachedWorkersData = formatted;
          cachedSubcategoryId = subcategoryId;
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
        ) : serviceWorkers.map((worker, idx) => (
          <div key={worker.id} className="worker-card reveal-on-scroll" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="wc-header">
              <img src={worker.image} alt={worker.name} className="wc-avatar" />
              <div className="wc-info">
                <h3>{worker.name} <HiBadgeCheck className="verified-badge" /></h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <div className="wc-rating">
                    <HiStar className="star-icon" /> {worker.rating} <span>({worker.jobsCompleted} jobs)</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px' }}>
                    <HiLocationMarker style={{ color: '#0ea5e9' }} /> {worker.distance} km
                  </div>
                </div>
              </div>
            </div>
            
            <div className="wc-price" style={{ margin: '0 24px 16px', padding: '12px 16px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
              <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Starting at</span>
              <strong style={{ fontSize: '20px' }}>₹{worker.rate}/hr</strong>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <button 
                onClick={() => navigate(`/professional/${worker.id}`)}
                className="wd-premium-btn"
                style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 12px rgba(2,132,199,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(2,132,199,0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(2,132,199,0.2)'; }}
              >
                View Premium Profile
              </button>
            </div>
          </div>
        ))}
        {!loading && serviceWorkers.length === 0 && (
          <div className="no-workers">
            <p>No professionals available for this service right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
