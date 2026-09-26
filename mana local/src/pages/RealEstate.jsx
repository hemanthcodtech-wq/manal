import React, { useState } from 'react';
import { realestate } from '../data/realestate';
import { HiLocationMarker, HiPhone, HiSearch, HiOfficeBuilding, HiMap } from 'react-icons/hi';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './RealEstate.css';

export default function RealEstate() {
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useScrollReveal([searchQuery]);

  const filteredProperties = realestate.filter(property => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      property.title.toLowerCase().includes(lowerQuery) ||
      property.type.toLowerCase().includes(lowerQuery) ||
      property.location.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="re-page" ref={containerRef}>
      {/* Hero Section */}
      <div className="re-hero">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80" 
          alt="Real Estate Banner" 
          className="re-hero-bg" 
        />
        <div className="re-hero-overlay">
          <div className="re-hero-content reveal-fade-in">
            <h1>Discover Your Dream Property</h1>
            <p>Explore premium lands, luxury villas, and commercial spaces near you.</p>
            
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
          <p>Found {filteredProperties.length} exclusive properties matching your criteria</p>
        </div>

        <div className="re-grid">
          {filteredProperties.map(property => (
            <div key={property.id} className="re-card reveal-on-scroll">
              <div className="re-card-img-wrap">
                <img src={property.image} alt={property.title} className="re-card-img" />
                <div className="re-card-type">{property.type}</div>
                <div className="re-card-price">{property.price}</div>
              </div>
              
              <div className="re-card-content">
                <h3>{property.title}</h3>
                
                <div className="re-meta">
                  <div className="re-meta-item">
                    <HiLocationMarker className="re-meta-icon" />
                    <span>{property.location}</span>
                  </div>
                  <div className="re-meta-item">
                    <HiMap className="re-meta-icon" />
                    <span>{property.area}</span>
                  </div>
                </div>

                <p className="re-desc">{property.description}</p>

                <div className="re-card-footer">
                  <a href={`tel:${property.contact}`} className="re-contact-btn">
                    <HiPhone /> Contact Seller
                  </a>
                </div>
              </div>
            </div>
          ))}

          {filteredProperties.length === 0 && (
            <div className="no-properties">
              <HiOfficeBuilding className="no-prop-icon" />
              <h3>No Properties Found</h3>
              <p>Try adjusting your search filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
