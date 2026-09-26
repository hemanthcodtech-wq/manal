import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { services } from '../data/services';
import { HiLocationMarker, HiPhone, HiStar, HiBadgeCheck, HiBriefcase, HiSearch, HiMap } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Workers.css';

export default function Workers() {
  const [params] = useSearchParams();
  const serviceId = params.get('service');
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const containerRef = useScrollReveal([searchQuery, workers]);
  
  const service = services.find(s => s.id === serviceId);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/admin/workers');
        const data = await res.json();
        if (data.success) {
          // In a real scenario, we might filter by subscribed workers:
          // const activeSubscribers = data.workers.filter(w => w.status === 'active' || w.subscription_status === 'active');
          const formatted = data.workers.map(w => ({
            id: w.id,
            name: w.name || w.email || 'Anonymous Professional',
            serviceId: serviceId || 'default', // Mock matching for now
            location: 'Local',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || w.email || 'W')}&background=random`,
            rating: w.rating || '5.0',
            jobsCompleted: 0,
            experience: '5+ years',
            distance: '2.0',
            rate: '500',
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
    if (service) {
      fetchWorkers();
    }
  }, [service, serviceId]);

  const serviceWorkers = workers.filter(w => {
    const lowerQuery = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(lowerQuery) || w.location.toLowerCase().includes(lowerQuery);
  });

  if (!service) {
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
          <p style={{ textAlign: 'center', width: '100%' }}>Loading professionals...</p>
        ) : serviceWorkers.map(worker => (
          <div key={worker.id} className="worker-card reveal-on-scroll">
            <div className="wc-header">
              <img src={worker.image} alt={worker.name} className="wc-avatar" />
              <div className="wc-info">
                <h3>{worker.name} <HiBadgeCheck className="verified-badge" /></h3>
                <div className="wc-rating">
                  <HiStar className="star-icon" /> {worker.rating} 
                  <span>({worker.jobsCompleted} jobs)</span>
                </div>
              </div>
            </div>
            
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

            <div className="wc-price">
              <span>Cost: </span>
              <strong>₹{worker.rate}/hr</strong>
            </div>

            <div className="wc-actions">
              <a href={`https://wa.me/${worker.whatsapp}?text=Hi ${worker.name}, I found your profile on Mana Local and need your services.`} target="_blank" rel="noreferrer" className="wc-btn whatsapp-btn">
                <FaWhatsapp /> WhatsApp
              </a>
              <a href={`tel:${worker.phone}`} className="wc-btn call-btn">
                <HiPhone /> Call Now
              </a>
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
