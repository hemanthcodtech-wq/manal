import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiChevronLeft, HiLocationMarker, HiOfficeBuilding, HiMap, HiCheckCircle, HiPhone } from 'react-icons/hi';
import './WorkerDetails.css'; 

export default function RealEstateDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const property = location.state?.property;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!property) {
    return (
      <div className="wd-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Property details not found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Please select a property from the listings.</p>
        <button onClick={() => navigate('/realestate')} className="wd-btn wd-btn-call" style={{ maxWidth: 200, margin: '0 auto' }}>Go Back</button>
      </div>
    );
  }

  const coverImageUrl = property.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80';

  return (
    <div className="wd-container">
      <div className="wd-top-bar">
        <div className="wd-top-bar-inner">
          <button onClick={() => navigate(-1)} className="wd-back-btn">
            <HiChevronLeft />
          </button>
          <span style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Property Details</span>
        </div>
      </div>

      <div className="wd-content">
        <div className="wd-cover" style={{ height: '280px' }}>
          <img src={coverImageUrl} alt="Property Cover" />
          <div className="wd-badge-location" style={{ background: '#0284c7', color: '#fff', border: 'none' }}>
             {property.type}
          </div>
        </div>

        <div className="wd-details-card" style={{ marginTop: '-40px' }}>
          <div className="wd-profile-header" style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="wd-name" style={{ fontSize: '26px' }}>{property.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginTop: '6px' }}>
                <HiLocationMarker style={{ color: '#0ea5e9' }} /> {property.location}
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7' }}>
              {property.price}
            </div>
          </div>

          <div style={{ padding: '0 24px 24px', fontSize: '15px', color: '#475569', lineHeight: '1.7' }}>
            <p>{property.description}</p>
          </div>

          <div className="wd-info-grid">
            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <HiOfficeBuilding />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Property Type</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{property.type}</div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
                <HiMap />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Area / Size</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{property.area}</div>
              </div>
            </div>
          </div>

          <hr className="wd-divider" />
          
          <div style={{ padding: '0 24px 24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Features & Amenities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {property.features?.map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '14px', fontWeight: '500' }}>
                  <HiCheckCircle style={{ color: '#10b981', flexShrink: 0 }} size={18} />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <hr className="wd-divider" />

          <div style={{ padding: '0 24px 24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Seller Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '18px', fontWeight: 'bold' }}>
                  {property.seller?.[0] || 'S'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Name</div>
                  <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>{property.seller}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wd-bottom-bar">
        <a href={`tel:${property.contact}`} className="wd-btn wd-btn-chat" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
          <HiPhone /> Contact Seller
        </a>
      </div>
    </div>
  );
}
