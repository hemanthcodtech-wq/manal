import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiSearch, HiFilter, HiHome, HiArrowRight } from 'react-icons/hi';
import { MdConstruction } from 'react-icons/md';
import { useScrollReveal } from '../hooks/useScrollReveal';
import Skeleton from '../components/Skeleton';
import './Browse.css';

const FALLBACK = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80';

export default function Browse() {
  const containerRef = useScrollReveal();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="browse" ref={containerRef}>
      {/* Header */}
      <div className="browse-header reveal-fade-in">
        <div className="header-text">
          <h1>Explore Services</h1>
          <p>{filtered.length} services available</p>
        </div>
        <div className="search-wrap">
          <HiSearch className="search-icon" />
          <input
            className="search-input"
            placeholder="Search Plumber, Electrician..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="vehicles-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="vehicle-card reveal-on-scroll">
              <Skeleton type="card" style={{ height: '160px', marginBottom: '10px' }} />
              <Skeleton type="title" style={{ width: '60%', margin: '0 16px' }} />
              <Skeleton type="text" style={{ width: '80%', margin: '0 16px 16px' }} />
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map(c => (
            <div key={c.id} className="vehicle-card reveal-on-scroll" onClick={() => navigate(`/category/${c.id}`)}>
              <div className="vc-img-wrap" style={{ height: '160px', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {c.image ? (
                  <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <h3 style={{ color: '#fff', textAlign: 'center', padding: '10px', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontSize: '24px' }}>{c.name}</h3>
                )}
              </div>
              <div className="vc-body">
                <h3>{c.name}</h3>
                <p>Explore {c.name.toLowerCase()} subcategories and professionals.</p>
                
                <div className="vc-footer" style={{ marginTop: '16px' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>
                    View Subcategories <HiArrowRight style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <HiFilter style={{ width: 40, height: 40, color: '#ddd', marginBottom: 12 }} />
            <p>No categories found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
