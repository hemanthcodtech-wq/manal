import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  HiChevronLeft, 
  HiLocationMarker, 
  HiOfficeBuilding, 
  HiMap, 
  HiCheckCircle, 
  HiPhone, 
  HiMail, 
  HiShieldCheck,
  HiShare,
  HiClock,
  HiSparkles,
  HiOutlineInformationCircle,
  HiBadgeCheck
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import CustomerWorkerRouteMap from '../components/CustomerWorkerRouteMap';
import { calculateDistanceKm, formatDistance, getCustomerLocation } from '../utils/geoDistance';
import Skeleton from '../components/Skeleton';
import './RealEstateDetails.css';

export default function RealEstateDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!location.state?.property);
  const [activeImage, setActiveImage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Request browser geolocation for distance calculation
  useEffect(() => {
    getCustomerLocation((loc) => {
      setUserLocation(loc);
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/real-estate/${id}`);
        const data = await res.json();
        if (data.success && data.property) {
          const p = data.property;
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

          let formattedPrice = p.price || '';
          if (formattedPrice && !formattedPrice.startsWith('₹')) {
            const num = parseFloat(formattedPrice);
            if (!isNaN(num)) {
              formattedPrice = `₹${num.toLocaleString('en-IN')}`;
            } else {
              formattedPrice = `₹${formattedPrice}`;
            }
          }

          setProperty({
            ...p,
            id: p.id,
            title: p.title || 'Exclusive Property',
            type: p.property_type || 'For Sale',
            location: p.location || 'Prime Location',
            price: formattedPrice || 'Price on Request',
            rawPrice: p.price,
            area: p.area_sqft ? `${parseFloat(p.area_sqft).toLocaleString('en-IN')} Sq. Ft` : (p.area || '2,000 Sq. Ft'),
            image: images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
            images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'],
            videos,
            contact: p.contact_phone || '+918179860935',
            email: p.contact_email || 'contact@ourlocal.in',
            facing: p.facing || 'East',
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            description: p.description || 'Premium property situated in a prime locality with superior road connectivity, round-the-clock water, and top-tier infrastructure.'
          });
        }
      } catch (err) {
        console.error('Error fetching property detail:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${property?.title} on Mana Local`,
        text: `Check out ${property?.title} in ${property?.location} on Mana Local Real Estate.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleContact = (type) => {
    if (!property?.contact) return;
    const cleanPhone = property.contact.replace(/[^0-9]/g, '');
    if (type === 'call') {
      window.location.href = `tel:${property.contact}`;
    } else if (type === 'whatsapp') {
      window.open(`https://wa.me/${cleanPhone}?text=Hi, I am interested in viewing your property '${encodeURIComponent(property.title)}' (${encodeURIComponent(property.location)}) listed on Mana Local.`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="red-page-wrapper">
        <div className="red-container red-loading-container">
          <Skeleton type="card" style={{ height: '360px', borderRadius: '28px', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
            <Skeleton type="card" style={{ height: '280px' }} />
            <Skeleton type="card" style={{ height: '280px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="red-page-wrapper">
        <div className="red-container red-not-found">
          <div className="red-empty-icon">🏡</div>
          <h2>Property Not Found</h2>
          <p>We could not retrieve this listing from the verified database.</p>
          <button onClick={() => navigate('/realestate')} className="red-btn red-btn-primary">
            Explore All Properties
          </button>
        </div>
      </div>
    );
  }

  // Coords for Real Estate Property
  // Default to Hyderabad central / Bangalore central based on location string
  const isBangalore = property.location?.toLowerCase().includes('bangalore') || property.location?.toLowerCase().includes('bengaluru');
  const propertyCoords = {
    lat: isBangalore ? 12.9716 : 17.3850,
    lng: isBangalore ? 77.5946 : 78.4867
  };

  const distanceKm = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, propertyCoords.lat, propertyCoords.lng)
    : 3.8;

  const formattedDistance = formatDistance(distanceKm);

  const galleryImages = (property.images && property.images.length > 0)
    ? property.images
    : [property.image];

  const currentCover = activeImage || galleryImages[0];

  return (
    <div className="red-page-wrapper">
      {/* Floating Glass Header */}
      <header className="red-header-glass">
        <div className="red-header-inner">
          <button onClick={() => navigate(-1)} className="red-nav-back-btn" title="Go back">
            <HiChevronLeft size={22} />
            <span className="red-back-text">Back</span>
          </button>

          <div className="red-header-title">
            <span className="red-header-sub">{property.type || 'Exclusive Real Estate'}</span>
            <span className="red-header-main">{property.title}</span>
          </div>

          <div className="red-header-actions">
            <button onClick={handleShare} className="red-icon-btn" title="Share Property">
              <HiShare size={19} />
              {copiedLink && <span className="red-copied-tooltip">Copied!</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="red-container">
        {/* Hero Showcase Banner */}
        <div className="red-hero-banner">
          <img src={currentCover} alt={property.title} className="red-hero-img" />
          <div className="red-hero-overlay"></div>

          <div className="red-hero-floating-badges">
            <div className="red-badge-pill red-badge-verified">
              <HiShieldCheck size={18} /> Verified Real Estate Listing
            </div>
            <div className="red-badge-pill red-badge-dist">
              <HiLocationMarker size={16} /> {formattedDistance} from you
            </div>
          </div>

          <div className="red-hero-price-overlay">
            <span className="hero-price-lbl">Listed Price</span>
            <span className="hero-price-val">{property.price}</span>
          </div>
        </div>

        {/* Multi-Image Gallery Strip */}
        {galleryImages.length > 1 && (
          <div className="red-gallery-strip">
            {galleryImages.map((imgUrl, idx) => (
              <div 
                key={idx} 
                className={`gallery-thumb-wrap ${currentCover === imgUrl ? 'is-active' : ''}`}
                onClick={() => setActiveImage(imgUrl)}
              >
                <img src={imgUrl} alt={`View ${idx + 1}`} className="gallery-thumb-img" />
              </div>
            ))}
          </div>
        )}

        {/* Master Responsive Grid (2-Column Desktop: Left Details & Amenities, Right Route Map & Fast Contact) */}
        <div className="red-master-grid">
          
          {/* LEFT COLUMN: Overview, Highlights, Specs, Description & Trust */}
          <div className="red-left-column">
            
            {/* Main Overview Card */}
            <div className="red-card red-overview-card">
              <div className="red-overview-header">
                <div>
                  <div className="red-type-badge">
                    <HiOfficeBuilding size={16} /> {property.type}
                  </div>
                  <h1 className="red-property-title">{property.title}</h1>
                  <p className="red-location-row">
                    <HiLocationMarker size={18} className="loc-marker-blue" />
                    <span>{property.location || 'Location Not Specified'}</span>
                  </p>
                </div>
                <div className="red-admin-verified-tag">
                  <HiBadgeCheck size={20} /> Admin Verified
                </div>
              </div>

              {/* Specs Grid */}
              <div className="red-specs-strip">
                <div className="red-spec-item">
                  <div className="spec-icon spec-blue">
                    <HiMap size={20} />
                  </div>
                  <div className="spec-info">
                    <span className="spec-lbl">Built-up Area</span>
                    <span className="spec-val">{property.area || '2,000 Sq. Ft'}</span>
                  </div>
                </div>

                {property.bedrooms && (
                  <div className="red-spec-item">
                    <div className="spec-icon spec-green">
                      <span>🛏️</span>
                    </div>
                    <div className="spec-info">
                      <span className="spec-lbl">Bedrooms</span>
                      <span className="spec-val">{property.bedrooms} BHK</span>
                    </div>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="red-spec-item">
                    <div className="spec-icon spec-amber">
                      <span>🚿</span>
                    </div>
                    <div className="spec-info">
                      <span className="spec-lbl">Bathrooms</span>
                      <span className="spec-val">{property.bathrooms} Baths</span>
                    </div>
                  </div>
                )}

                {property.facing && (
                  <div className="red-spec-item">
                    <div className="spec-icon spec-purple">
                      <span>🧭</span>
                    </div>
                    <div className="spec-info">
                      <span className="spec-lbl">Facing</span>
                      <span className="spec-val">{property.facing} Facing</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="red-desc-section">
                <h2 className="red-section-heading">
                  <HiSparkles className="sparkle-blue" /> Property Description
                </h2>
                <p className="red-desc-text">
                  {property.description}
                </p>
              </div>

              {/* Amenities & Verified Highlights */}
              <div className="red-features-section">
                <h3 className="red-subheading">Verified Highlights & Security</h3>
                <div className="red-features-grid">
                  <div className="feature-pill">
                    <HiCheckCircle size={18} className="feat-check-icon" /> 100% Clear Title Documentation
                  </div>
                  <div className="feature-pill">
                    <HiCheckCircle size={18} className="feat-check-icon" /> Direct Admin Listed (No Brokerage)
                  </div>
                  <div className="feature-pill">
                    <HiCheckCircle size={18} className="feat-check-icon" /> Immediate Site Visit Available
                  </div>
                  <div className="feature-pill">
                    <HiCheckCircle size={18} className="feat-check-icon" /> Official RERA Compliance Checked
                  </div>
                </div>
              </div>
            </div>

            {/* Zero Brokerage Trust Banner */}
            <div className="red-trust-banner">
              <HiOutlineInformationCircle size={30} className="trust-icon-gold" />
              <div>
                <h4 className="trust-banner-title">Zero Brokerage Guarantee</h4>
                <p className="trust-banner-desc">
                  This property is listed directly by authorized platform admins. You deal transparently without middleman commissions or unverified surcharges.
                </p>
              </div>
            </div>

            {/* Property Videos if available */}
            {property.videos && property.videos.length > 0 && (
              <div className="red-card red-videos-card">
                <h2 className="red-section-heading">
                  <span>🎥</span> Property Video Tour
                </h2>
                <div className="videos-container">
                  {property.videos.map((vidUrl, vIdx) => (
                    <video key={vIdx} src={vidUrl} controls className="property-video-player" />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Customer-To-Property Route Map & Direct Contact Card */}
          <div className="red-right-column">
            
            {/* Interactive GPS Route Map */}
            <div className="red-card red-map-card">
              <div className="red-map-header">
                <div>
                  <h2 className="red-map-title">Direct GPS Distance & Route</h2>
                  <p className="red-map-sub">Live navigation from your location to this property</p>
                </div>
                <div className="red-distance-tag">
                  {formattedDistance}
                </div>
              </div>

              {/* Route Mapbox Component */}
              <div className="red-map-embed">
                <CustomerWorkerRouteMap 
                  customerCoords={userLocation || { lat: 17.3850, lng: 78.4867 }}
                  workerCoords={propertyCoords}
                  customerLocationName={userLocation ? 'Your Current Location' : 'Hyderabad Metro'}
                  workerLocationName={property.location || 'Property Site'}
                  workerName={property.title}
                  distanceKm={distanceKm}
                />
              </div>

              <div className="red-map-footer-notes">
                <span>📍 Site Location: <strong>{property.location || 'Metro Region'}</strong></span>
                <span>🚗 Approx. {Math.round(distanceKm * 2.5)} mins driving time</span>
              </div>
            </div>

            {/* Fast Contact & Site Inspection Card */}
            <div className="red-card red-action-card">
              <div className="red-pricing-box">
                <span className="pricing-tag">Listed Price</span>
                <div className="pricing-val-large">{property.price}</div>
                <span className="pricing-negotiable">Negotiable for immediate site buyers</span>
              </div>

              {/* Direct CTAs */}
              <div className="red-cta-stack">
                <button 
                  onClick={() => handleContact('call')} 
                  className="red-btn red-btn-call-large"
                  id="btn-call-property"
                >
                  <HiPhone size={22} className="btn-icon-wiggle" />
                  <span>Call Property Manager</span>
                </button>

                <button 
                  onClick={() => handleContact('whatsapp')} 
                  className="red-btn red-btn-whatsapp-large"
                  id="btn-chat-property"
                >
                  <FaWhatsapp size={22} />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>

              {/* Seller details */}
              <div className="red-seller-strip">
                <div className="seller-avatar">🏢</div>
                <div className="seller-meta">
                  <div className="seller-label">Authorized Listing Agent</div>
                  <div className="seller-name">{property.contact_phone || '8179860935'}</div>
                  <div className="seller-email">{property.contact_email || 'kancharla@gmail.com'}</div>
                </div>
              </div>

              <div className="red-privacy-notice">
                <HiShieldCheck size={18} className="shield-green" />
                <span>Verified by Mana Local Real Estate Advisory Team.</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Bottom Bar for Mobile Devices */}
      <div className="red-bottom-mobile-bar">
        <div className="red-mobile-price">
          <span className="mob-rate-lbl">Price</span>
          <span className="mob-rate-val">{property.price}</span>
        </div>
        <div className="red-mobile-btns">
          <button onClick={() => handleContact('whatsapp')} className="red-mob-btn mob-wa">
            <FaWhatsapp size={20} /> WhatsApp
          </button>
          <button onClick={() => handleContact('call')} className="red-mob-btn mob-call">
            <HiPhone size={20} /> Call
          </button>
        </div>
      </div>
    </div>
  );
}
