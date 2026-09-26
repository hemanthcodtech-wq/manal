import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { categories, services as allServices } from '../data/services';
import { useStore } from '../store/useStore';
import { HiSearch, HiFilter, HiHome, HiArrowRight } from 'react-icons/hi';
import { MdConstruction, MdCleaningServices } from 'react-icons/md';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Browse.css';

const CAT_ICONS = {
  'home-services': HiHome,
  'cleaning': MdCleaningServices,
  'construction': MdConstruction,
};

const FALLBACK = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80';

export default function Browse() {
  const containerRef = useScrollReveal();
  const [params] = useSearchParams();
  const [activeCat, setActiveCat] = useState(params.get('cat') || 'all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cat = params.get('cat');
    if (cat) setActiveCat(cat);
  }, [params]);

  const filtered = allServices.filter(v => {
    const matchCat = activeCat === 'all' || v.category === activeCat;
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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

      {/* Category Tabs */}
      <div className="cat-tabs reveal-on-scroll">
        <button className={activeCat === 'all' ? 'active' : ''} onClick={() => setActiveCat('all')}>
          <MdConstruction className="tab-icon" /> All Services
        </button>
        {categories.map(c => {
          const Icon = CAT_ICONS[c.id] || MdConstruction;
          return (
            <button
              key={c.id}
              className={activeCat === c.id ? 'active' : ''}
              onClick={() => setActiveCat(c.id)}
            >
              <Icon className="tab-icon" /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="vehicles-grid">
        {filtered.map(v => (
          <div key={v.id} className="vehicle-card reveal-on-scroll" onClick={() => navigate(`/workers?service=${v.id}`)}>
            <div className="vc-img-wrap">
              <img
                src={v.image || FALLBACK}
                alt={v.name}
                className="vc-img"
                onError={e => { e.target.src = FALLBACK; }}
              />
            </div>
            <div className="vc-body">
              <h3>{v.name}</h3>
              <p>{v.desc}</p>
              
              <div className="vc-footer" style={{ marginTop: '16px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>
                  View Professionals <HiArrowRight style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <HiFilter style={{ width: 40, height: 40, color: '#ddd', marginBottom: 12 }} />
            <p>No services found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
