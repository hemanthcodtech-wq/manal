import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { HiChevronRight, HiArrowLeft } from 'react-icons/hi';
import Skeleton from '../components/Skeleton';
import './CategorySubcategories.css';

export default function CategorySubcategories() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useScrollReveal([subcategories.length]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/categories/${id}/subcategories`);
        const data = await res.json();
        if (data.success && Array.isArray(data.subcategories)) {
          setSubcategories(data.subcategories);
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategories();
  }, [id]);

  return (
    <div className="subcat-page" ref={containerRef}>
      <div className="subcat-container">
        <div className="subcat-header reveal-fade-in">
          <div>
            <h1>Explore Specialized Services</h1>
            <p>Find verified professionals and equipment operators for your job</p>
          </div>
          <button className="subcat-back-btn" onClick={() => navigate('/')}>
            <HiArrowLeft /> Back to Home
          </button>
        </div>

        {loading ? (
          <div className="subcat-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="subcat-card" style={{ padding: '16px' }}>
                <Skeleton type="image" style={{ height: '170px', borderRadius: '16px', marginBottom: '16px' }} />
                <Skeleton type="title" style={{ width: '70%', marginBottom: '10px' }} />
                <Skeleton type="text" style={{ width: '90%', marginBottom: '8px' }} />
                <Skeleton type="text" style={{ width: '50%' }} />
              </div>
            ))}
          </div>
        ) : subcategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '24px' }}>
            <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>No Subcategories Found</h3>
            <p style={{ color: '#64748b' }}>Please select another category or check back soon.</p>
          </div>
        ) : (
          <div className="subcat-grid">
            {subcategories.map(sub => {
              const initialLetter = sub.name ? sub.name.trim().charAt(0).toUpperCase() : 'S';
              const fallbackImg = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80';
              const displayImg = sub.image || fallbackImg;

              return (
                <div 
                  key={sub.id} 
                  className="subcat-card reveal-on-scroll" 
                  onClick={() => navigate(`/workers?subcategory=${sub.id}&name=${encodeURIComponent(sub.name)}`)}
                >
                  <div className="subcat-img-wrap">
                    <img 
                      src={displayImg} 
                      alt={sub.name} 
                      className="subcat-img" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                      }}
                    />
                    <div className="subcat-initial-badge">
                      {initialLetter}
                    </div>
                  </div>

                  <div className="subcat-content">
                    <h3>{sub.name}</h3>
                    <p>Find skilled {sub.name.toLowerCase()} professionals</p>
                    
                    <div className="subcat-footer">
                      <span className="subcat-action-text">
                        View Verified Workers <HiChevronRight />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
