import React, { useState, useEffect } from 'react';
import { HiLocationMarker, HiPhone, HiSearch, HiOfficeBuilding, HiMap } from 'react-icons/hi';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import realEstateBannerImg from '../assets/real_estate_banner.jpg';
import './RealEstate.css';
import Footer from '../components/Footer';

export default function RealEstate() {
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useScrollReveal([searchQuery, properties.length]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/real-estate`);
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          // Normalize DB properties to match UI fields
          const formatted = data.properties.map(p => {
            let images = [];
            try {
              images = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []);
            } catch (e) {
              images = [];
            }
            let videos = [];
            try {
              videos = Array.isArray(p.videos) ? p.videos : (typeof p.videos === 'string' ? JSON.parse(p.videos) : []);
            } catch (e) {
              videos = [];
            }

            const coverImage = (images && images.length > 0)
              ? images[0]
              : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';

            // Format price: e.g. if numeric string or already formatted
            let formattedPrice = p.price || '';
            if (formattedPrice && !formattedPrice.startsWith('₹')) {
              const num = parseFloat(formattedPrice);
              if (!isNaN(num)) {
                formattedPrice = `₹${num.toLocaleString('en-IN')}`;
              } else {
                formattedPrice = `₹${formattedPrice}`;
              }
            }

            // Format area
            let areaDisplay = p.area_sqft ? `${p.area_sqft} Sq. Ft` : (p.area || '');

            return {
              ...p,
              id: p.id,
              title: p.title || 'Untitled Property',
              type: p.property_type || 'Sale',
              location: p.location || '',
              price: formattedPrice || 'Price on Request',
              area: areaDisplay,
              image: coverImage,
              images: images,
              videos: videos,
              contact: p.contact_phone || '',
              email: p.contact_email || '',
              facing: p.facing || '',
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              description: p.description || ''
            };
          });
          setProperties(formatted);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to fetch real estate from server:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(property => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (property.title && property.title.toLowerCase().includes(lowerQuery)) ||
      (property.type && property.type.toLowerCase().includes(lowerQuery)) ||
      (property.location && property.location.toLowerCase().includes(lowerQuery))
    );
  });

  return (
    <div className="re-page" ref={containerRef}>
      {/* Hero Section */}
      <div className="re-hero">
        <img 
          src={realEstateBannerImg} 
          alt="Real Estate Banner" 
          className="re-hero-bg" 
        />
        <div className="re-hero-overlay">
          <div className="re-hero-content">
            <div className="re-hero-badge">
              <span className="re-badge-dot"></span> Premium Verified Listings
            </div>
            <h1>Discover Your Dream Property</h1>
            <p>Explore verified plots, luxury villas, commercial spaces, and agricultural lands across Hyderabad and Bangalore.</p>
            
            <div className="re-search">
              <HiSearch className="re-search-icon" />
              <input 
                type="text" 
                placeholder="Search by location, type, or property name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="re-container">
        <div className="re-header reveal-on-scroll">
          <h2>Featured Listings</h2>
          <p>{loading ? 'Loading properties...' : `Found ${filteredProperties.length} exclusive properties matching your criteria`}</p>
        </div>

        {loading ? (
          <div className="re-grid">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="re-card" style={{ padding: '16px' }}>
                <Skeleton type="image" style={{ height: '240px', borderRadius: '16px', marginBottom: '16px' }} />
                <Skeleton type="title" style={{ width: '70%', marginBottom: '12px' }} />
                <Skeleton type="text" style={{ width: '90%', marginBottom: '8px' }} />
                <Skeleton type="text" style={{ width: '50%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="re-grid">
            {filteredProperties.map(property => (
              <div key={property.id} className="re-card reveal-on-scroll">
                <div className="re-card-img-wrap">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="re-card-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';
                    }}
                  />
                  <div className="re-card-type">{property.type}</div>
                  <div className="re-card-price">{property.price}</div>
                </div>
                
                <div className="re-card-content">
                  <h3>{property.title}</h3>
                  
                  <div className="re-meta">
                    {property.location && (
                      <div className="re-meta-item">
                        <HiLocationMarker className="re-meta-icon" />
                        <span>{property.location}</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="re-meta-item">
                        <HiMap className="re-meta-icon" />
                        <span>{property.area}</span>
                      </div>
                    )}
                    {property.facing && (
                      <div className="re-meta-item">
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0284c7' }}>
                          🧭 {property.facing} Facing
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="re-card-footer" style={{ borderTop: 'none', padding: '0', marginTop: '16px' }}>
                    <button 
                      onClick={() => navigate(`/property/${property.id}`, { state: { property } })}
                      className="wd-premium-btn"
                      style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredProperties.length === 0 && (
              <div className="no-properties" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
                <HiOfficeBuilding className="no-prop-icon" style={{ fontSize: '48px', color: '#94a3b8', margin: '0 auto 16px' }} />
                <h3>No Properties Found</h3>
                <p style={{ color: '#64748b' }}>
                  {properties.length === 0 
                    ? 'No property listings have been added by admin yet. Please check back later!'
                    : "Try adjusting your search filters to find what you're looking for."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
