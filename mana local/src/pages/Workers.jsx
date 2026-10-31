import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { services } from '../data/services';
import { HiLocationMarker, HiPhone, HiStar, HiBadgeCheck, HiBriefcase, HiSearch, HiMap, HiViewGrid } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';
import WorkersMap from '../components/WorkersMap';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuthStore } from '../store/useAuthStore';
import { calculateDistanceKm, formatDistance, getWorkerCoordinates, getCustomerLocation } from '../utils/geoDistance';
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
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'grid' | 'map'
  const [hoveredWorkerId, setHoveredWorkerId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  const isCached = cachedSubcategoryId === subcategoryId && cachedWorkersData !== null;
  const [workers, setWorkers] = useState(isCached ? cachedWorkersData : []);
  const [loading, setLoading] = useState(!isCached);
  
  const navigate = useNavigate();
  const containerRef = useScrollReveal([searchQuery, workers]);

  // Request browser geolocation with shared cache
  useEffect(() => {
    getCustomerLocation((loc) => {
      setUserLocation(loc);
    });
  }, []);
  
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
          const formatted = data.workers.map(w => {
            const hasCustomRate = w.rate_per_hour && Number(w.rate_per_hour) > 0;
            const hourlyPrice = hasCustomRate ? Number(w.rate_per_hour) : null;

            return {
              id: w.id,
              name: w.name || w.email || 'Anonymous Professional',
              location: w.location || 'Local',
              image: w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || w.email || 'W')}&background=random`,
              rating: w.rating || '5.0',
              jobsCompleted: w.jobs_done || 0,
              experience: w.experience || '5+ years',
              distance: w.distance || '2.0',
              ratePerHour: hourlyPrice,
              rate: hourlyPrice ? `₹${hourlyPrice}/hr` : null,
              hasCustomRate,
              phone: w.phone || 'Not provided',
              whatsapp: w.phone || '',
              description: w.description || '',
              latitude: w.latitude || null,
              longitude: w.longitude || null
            };
          });
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

  const serviceWorkers = workers
    .map((w) => {
      const coords = getWorkerCoordinates(w, userLocation);
      const distKm = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng) : null;
      const displayDistance = formatDistance(distKm);

      return {
        ...w,
        latitude: coords.lat,
        longitude: coords.lng,
        distance: displayDistance,
        numericDistance: distKm != null ? distKm : 999999
      };
    })
    .filter(w => {
      const lowerQuery = searchQuery.toLowerCase();
      return w.name.toLowerCase().includes(lowerQuery) || (w.location && w.location.toLowerCase().includes(lowerQuery));
    })
    .sort((a, b) => a.numericDistance - b.numericDistance); // Nearest workers always on top

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

        <div className="wh-controls">
          <div className="wh-search">
            <HiSearch className="wh-search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="wh-view-toggle">
            <button 
              className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Split View"
            >
              <HiMap className="vb-icon" /> Split
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View Only"
            >
              <HiViewGrid className="vb-icon" /> List
            </button>
            <button 
              className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              title="Full Map View"
            >
              <HiLocationMarker className="vb-icon" /> Map
            </button>
          </div>
        </div>
      </div>

      <div className={`workers-main-layout mode-${viewMode}`}>
        {(viewMode === 'split' || viewMode === 'grid') && (
          <div className="workers-grid-pane">
            <div className={`workers-grid ${viewMode === 'split' ? 'is-split' : ''}`}>
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
                <div 
                  key={worker.id} 
                  className={`worker-card ${hoveredWorkerId === worker.id ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => setHoveredWorkerId(worker.id)}
                  onMouseLeave={() => setHoveredWorkerId(null)}
                >
                  <div className="wc-header">
                    <div className="wc-avatar-container">
                      <img src={worker.image} alt={worker.name} className="wc-avatar" />
                      <span className="wc-online-indicator" title="Available now" />
                    </div>
                    <div className="wc-info">
                      <h3>{worker.name} <HiBadgeCheck className="verified-badge" /></h3>
                      <div className="wc-meta-row">
                        <div className="wc-rating">
                          <HiStar className="star-icon" /> {worker.rating} <span>({worker.jobsCompleted} jobs)</span>
                        </div>
                        <div className="wc-distance-badge">
                          <HiLocationMarker /> {worker.distance}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="wc-price-card">
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748b', fontWeight: 700 }}>
                        {worker.hasCustomRate ? 'Starting Rate' : 'Pricing'}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#0369a1', fontWeight: 700, marginTop: '3px' }}>📍 {worker.location}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {worker.hasCustomRate ? (
                        <div className="wc-price-rate">
                          {worker.rate}
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                          On Request
                        </div>
                      )}
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{worker.experience} exp</span>
                    </div>
                  </div>

                  {worker.description && (
                    <p 
                      title={worker.description}
                      style={{
                        margin: '10px 0 0',
                        fontSize: '12.5px',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.4
                      }}
                    >
                      {worker.description}
                    </p>
                  )}

                  <div className="wc-actions-wrap">
                    <div className="wc-contact-grid">
                      <a 
                        href={`tel:${worker.phone}`}
                        className="wc-action-call"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HiPhone style={{ fontSize: '16px' }} /> Call
                      </a>
                      <a 
                        href={`https://wa.me/${worker.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="wc-action-chat"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaWhatsapp style={{ fontSize: '16px' }} /> WhatsApp
                      </a>
                    </div>
                    <button 
                      onClick={() => navigate(`/professional/${worker.id}`)}
                      className="wc-action-profile"
                    >
                      View Full Profile →
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
        )}

        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={`workers-map-pane ${viewMode === 'map' ? 'is-fullscreen' : ''}`}>
            <WorkersMap 
              workers={serviceWorkers}
              hoveredWorkerId={hoveredWorkerId}
              onSelectWorker={(w) => navigate(`/professional/${w.id}`)}
              userLocation={userLocation}
            />
          </div>
        )}
      </div>
    </div>
  );
}

