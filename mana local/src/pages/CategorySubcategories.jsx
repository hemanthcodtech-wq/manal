import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { HiChevronRight } from 'react-icons/hi';
import Skeleton from '../components/Skeleton';
import './Home.css';

export default function CategorySubcategories() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useScrollReveal();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/categories/${id}/subcategories`);
        const data = await res.json();
        if (data.success) {
          setSubcategories(data.subcategories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategories();
  }, [id]);

  return (
    <div className="home" ref={containerRef} style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <section className="section services-section" style={{ background: 'transparent' }}>
        <div className="section-inner" style={{ padding: '0 20px' }}>
          <div className="section-header">
            <div>
              <h2 style={{ fontSize: '24px' }}>Explore Subcategories</h2>
              <p className="section-sub">Choose a specialized service</p>
            </div>
            <button className="see-all-btn" onClick={() => navigate('/')}>Back <HiChevronRight style={{ width: 14, height: 14, verticalAlign: 'middle' }} /></button>
          </div>
          
          <div className="why-grid" style={{ marginTop: '20px' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="why-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '24px', borderRadius: '16px' }}>
                  <Skeleton type="avatar" style={{ width: '60px', height: '60px', borderRadius: '12px' }} />
                  <div>
                    <Skeleton type="title" style={{ width: '70%', marginBottom: '8px' }} />
                    <Skeleton type="text" style={{ width: '90%' }} />
                    <Skeleton type="text" style={{ width: '50%' }} />
                  </div>
                </div>
              ))
            ) : subcategories.length === 0 ? (
              <p style={{ color: '#64748b' }}>No subcategories found for this category.</p>
            ) : (
              subcategories.map(sub => (
                <div key={sub.id} className="why-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/workers?subcategory=${sub.id}&name=${encodeURIComponent(sub.name)}`)}>
                  <div className="why-icon-wrap" style={{ background: '#3b82f618', color: '#3b82f6', overflow: 'hidden', padding: sub.image ? 0 : undefined }}>
                    {sub.image ? (
                      <img src={sub.image} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{sub.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="why-card-content">
                    <strong style={{ fontSize: '18px' }}>{sub.name}</strong>
                    <p>Find skilled {sub.name.toLowerCase()} professionals</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
