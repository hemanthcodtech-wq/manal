import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data/vehicles';
import { highlightedServices } from '../data/services';
import Footer from '../components/Footer';
import Roadmap from '../components/Roadmap';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  HiStar, HiUsers, HiTruck, HiLocationMarker,
  HiShieldCheck, HiLightningBolt, HiPhone,
  HiArrowRight, HiChevronRight, HiSearch, HiCheckCircle, HiBadgeCheck,
  HiBriefcase, HiUserAdd,
} from 'react-icons/hi';
import {
  MdConstruction, MdEngineering,
  MdSecurity, MdOutlineVerified,
} from 'react-icons/md';
import { FaTractor, FaRoad, FaSpa, FaLeaf, FaWhatsapp } from 'react-icons/fa';
import { GiCrane, GiPickelhaube } from 'react-icons/gi';
import { TbTruckDelivery } from 'react-icons/tb';
import './Home.css';

const MANA_LOCAL_BANNER = {
  id: 'default',
  tag: 'Welcome to',
  title: 'Mana Local',
  sub: 'Your trusted platform for booking verified local professionals instantly.',
  cta: 'Explore Services',
  bg: 'linear-gradient(135deg, #1e40af, #3b82f6)',
  accent: '#fff',
  img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80'
};

const WHY = [
  { Icon: MdOutlineVerified, t: 'Verified Professionals',  d: 'All workers are background-checked and highly skilled.', color: '#3b82f6' },
  { Icon: HiLocationMarker,  t: 'Local & Near You',        d: 'Find professionals working in your immediate neighborhood.', color: '#ef4444' },
  { Icon: MdSecurity,        t: 'Transparent Pricing',     d: 'No hidden charges. Negotiate directly with the worker.', color: '#10b981' },
  { Icon: HiLightningBolt,   t: 'Instant Connect',         d: 'Call or WhatsApp professionals directly in under 60 seconds.', color: '#f59e0b' },
  { Icon: HiStar,            t: 'Community Trusted',       d: 'Read genuine ratings and reviews from local residents.', color: '#8b5cf6' },
  { Icon: HiPhone,           t: '24/7 Local Support',      d: 'Our local support team is always available to assist you.', color: '#06b6d4' },
];

const CAT_ICONS = {
  excavation:   GiPickelhaube,
  transport:    TbTruckDelivery,
  road:         FaRoad,
  lifting:      GiCrane,
  agricultural: FaTractor,
  native:       FaLeaf,
  beauty:       FaSpa,
  other:        MdEngineering,
};

const CAT_COLORS = {
  excavation:   '#f59e0b',
  transport:    '#3b82f6',
  road:         '#6b7280',
  lifting:      '#8b5cf6',
  agricultural: '#84cc16',
  native:       '#10b981',
  beauty:       '#ec4899',
  other:        '#06b6d4',
};

import Skeleton from '../components/Skeleton';
import { useDataFetch } from '../hooks/useDataFetch';

export default function Home() {
  const navigate = useNavigate();
  const containerRef = useScrollReveal();
  const [bannerIdx, setBannerIdx] = useState(0);
  
  const [activeAds, setActiveAds] = useState([]);
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchAds();
    fetchCategoriesData();
  }, []);

  const fetchCategoriesData = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/public/categories`),
        fetch(`${import.meta.env.VITE_API_URL}/api/public/subcategories/all`)
      ]);
      const catData = await catRes.json();
      const subData = await subRes.json();
      if (catData.success) {
        setDbCategories(catData.categories);
      }
      if (subData.success) {
        setDbSubcategories(subData.subcategories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/active-ads`);
      const data = await res.json();
      if (data.success && data.ads.length > 0) {
        setActiveAds(data.ads);
        // If there's a video ad, show it
        const videoAd = data.ads.find(a => {
          const url = a.ad_image_url;
          return url && (url.match(/\.(mp4|webm|ogg|mov|mkv)$/i) || url.includes('/video/upload/'));
        });
        if (videoAd) {
          setShowVideoAd(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to detect video URLs from Cloudinary or extensions
  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov|mkv)$/i) || url.includes('/video/upload/');
  };

  // Combine default banners with image ads
  const imageAds = activeAds.filter(a => !isVideoUrl(a.ad_image_url)).map(a => ({
    id: `ad_${a.id}`,
    tag: 'Promoted',
    title: a.plan_name || 'Special Offer',
    sub: 'Verified Professional Ad',
    cta: 'View',
    vehicleId: '',
    bg: 'linear-gradient(135deg, #059669, #047857)',
    accent: '#fff',
    img: a.ad_image_url
  }));
  const displayBanners = [MANA_LOCAL_BANNER, ...imageAds];

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const delay = bannerIdx === 0 ? 2000 : 5000;
    const t = setTimeout(() => {
      setBannerIdx((bannerIdx + 1) % displayBanners.length);
    }, delay);
    return () => clearTimeout(t);
  }, [bannerIdx, displayBanners.length]);

  const banner = displayBanners[bannerIdx];
  const isDark = banner?.accent === '#fff';

  const videoAd = activeAds.find(a => isVideoUrl(a.ad_image_url));

  return (
    <div className="home" ref={containerRef}>
      
      {/* ── Video Ad Modal ── */}
      {showVideoAd && videoAd && (
        <div className="modal-overlay" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}>
          <div className="modal" style={{ padding: '20px', maxWidth: '600px', width: '90%', textAlign: 'center', background: '#1e293b' }}>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>Watch this Ad to Unlock Content</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Support our local professionals</p>
            <video 
              src={videoAd.ad_image_url} 
              autoPlay 
              controls 
              style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} 
            />
            <button 
              onClick={() => setShowVideoAd(false)}
              style={{ padding: '12px 24px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
            >
              Close & Continue to Website
            </button>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      {displayBanners.length > 0 && banner && (
        <section className="hero-banner elegant-banner reveal-fade-in" style={{ cursor: banner.id !== 'default' ? 'pointer' : 'default' }}>
          <img src={banner.img} alt={banner.title} className="eb-bg" style={{ objectFit: banner.id === 'default' ? 'cover' : 'contain', width: '100%', height: '100%', background: banner.id !== 'default' ? '#0f172a' : 'transparent' }} />
          
          {banner.id === 'default' && (
            <div className="eb-content" style={{ padding: '40px 20px', position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <span className="eb-tag" style={{ background: 'var(--primary)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{banner.tag}</span>
              <h1 style={{ color: '#fff', fontSize: '32px', margin: '8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{banner.title}</h1>
              <p style={{ color: '#f8fafc', fontSize: '14px', maxWidth: '80%', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{banner.sub}</p>
            </div>
          )}

          <div className="eb-dots">
            {displayBanners.map((_, i) => (
              <button key={i} className={`eb-dot ${i === bannerIdx ? 'active' : ''}`} onClick={() => setBannerIdx(i)} />
            ))}
          </div>
        </section>
      )}

      {/* ── Stats Bar ── */}
      <section className="stats-bar reveal-on-scroll">
        <div className="stats-container">
          <div className="stats-inner">
            {[
              { Icon: HiStar,     label: 'TOP RATED' },
              { Icon: HiUsers,    label: '12M+ CUSTOMERS' },
              { Icon: HiTruck,    label: 'VERIFIED VEHICLES' },
              { Icon: HiLocationMarker, label: 'NATIONWIDE' },
            ].map(({ Icon, label }, i) => (
              <Fragment key={label}>
                {i > 0 && <div className="stat-divider" />}
                <div className="stat-item">
                  <Icon className="stat-icon-elegant" />
                  <span className="stat-label-elegant">{label}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>


      {/* ── Quick Actions ── */}
      <section className="quick-actions-bar reveal-on-scroll">
        <div className="qa-inner">
          <button className="qa-btn qa-blue" onClick={() => navigate('/browse')}>
            <div className="qa-icon-wrap"><HiSearch className="qa-icon" /></div>
            <span className="qa-text">Find Services</span>
            <HiArrowRight className="qa-arrow" />
          </button>
          <button className="qa-btn qa-yellow" onClick={() => navigate('/jobs')}>
            <div className="qa-icon-wrap"><HiBriefcase className="qa-icon" /></div>
            <span className="qa-text">Find Jobs</span>
            <HiArrowRight className="qa-arrow" />
          </button>
          <button className="qa-btn qa-white" onClick={() => navigate('/register')}>
            <div className="qa-icon-wrap"><HiUserAdd className="qa-icon" /></div>
            <span className="qa-text">Join as Worker</span>
            <HiArrowRight className="qa-arrow" />
          </button>
          <button className="qa-btn qa-green" onClick={() => window.open('https://wa.me/919848615849')}>
            <div className="qa-icon-wrap"><FaWhatsapp className="qa-icon" /></div>
            <span className="qa-text">WhatsApp Connect</span>
            <HiArrowRight className="qa-arrow" />
          </button>
        </div>
      </section>

      {/* ── Popular Services & Workers ── */}
      <section className="section services-section reveal-on-scroll">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2>Popular Services</h2>
              <p className="section-sub">Skilled workers at your doorstep</p>
            </div>
            <button className="see-all-btn" onClick={() => navigate('/browse')}>See all <HiChevronRight style={{ width: 14, height: 14, verticalAlign: 'middle' }} /></button>
          </div>
          <div className="h-scroll">
            {categoriesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="service-card reveal-on-scroll" style={{ padding: '10px' }}>
                  <Skeleton type="card" style={{ height: '120px', marginBottom: '10px' }} />
                  <Skeleton type="title" style={{ width: '60%' }} />
                </div>
              ))
            ) : (
              dbCategories.map(c => (
                <div key={c.id} className="service-card reveal-on-scroll" onClick={() => navigate(`/category/${c.id}`)}>
                  <div className="sc-img-wrap" style={{ height: '120px', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.image ? (
                      <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <h3 style={{ color: '#fff', textAlign: 'center', padding: '10px', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{c.name}</h3>
                    )}
                  </div>
                  <div className="sc-body">
                    <div className="sc-name">{c.name}</div>
                    <div className="sc-desc">Explore subcategories</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Video Showcase ── */}
      <section className="section section-dark reveal-on-scroll">
        <div className="section-inner">
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <h2 className="white-h2">Mana Local in Action</h2>
            <p className="white-sub">See how our verified professionals deliver excellence.</p>
          </div>
          <div className="h-scroll" style={{ paddingBottom: '20px' }}>
            {['video1.mp4', 'video2.mp4', 'video3.mp4'].map((vid, idx) => (
              <div key={idx} style={{ 
                flex: '0 0 280px', // Fixed width for side-by-side scrolling
                borderRadius: '16px', overflow: 'hidden', background: '#0f172a', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid #334155',
                position: 'relative', paddingTop: '497px' /* 280 * 16/9 = 497px */
              }}>
                <video 
                  src={`/videos/${vid}`}
                  controls
                  preload="metadata"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <Roadmap />

      {/* ── Category Scroll Sections ── */}
      {dbCategories.map((cat, idx) => {
        const catSubs = dbSubcategories.filter(s => s.category_id === cat.id);
        if (catSubs.length === 0) return null; // Skip if no subcategories

        // Use a generic icon if not mapped, mapped by category name rather than id to be flexible
        const CatIcon = CAT_ICONS[cat.name.toLowerCase()] || MdConstruction;
        const color = CAT_COLORS[cat.name.toLowerCase()] || '#ff6b00';
        
        return (
          <section key={cat.id} className={`section ${idx % 2 === 1 ? 'section-gray' : ''}`}>
            <div className="section-inner">
              <div className="section-header">
                <div className="cat-section-title">
                  <div className="cat-section-icon-wrap" style={{ background: color + '18', color }}>
                    <CatIcon className="cat-section-icon" />
                  </div>
                  <div>
                    <h2>{cat.name}</h2>
                    <span className="cat-section-count">{catSubs.length} services</span>
                  </div>
                </div>
                <button className="see-all-btn" onClick={() => navigate(`/category/${cat.id}`)}>See all <HiChevronRight style={{ width: 14, height: 14, verticalAlign: 'middle' }} /></button>
              </div>
              <div className="h-scroll">
                {catSubs.map(sub => (
                  <div key={sub.id} className="hs-card" onClick={() => navigate(`/workers?subcategory=${sub.id}&name=${encodeURIComponent(sub.name)}`)}>
                    <div className="hs-img-wrap">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="hs-img" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#94a3b8', fontWeight: 'bold' }}>
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="hs-overlay">
                        <span className="hs-avail">✓ Available</span>
                      </div>
                    </div>
                    <div className="hs-body">
                      <div className="hs-name">{sub.name}</div>
                      <div className="hs-desc">Find {sub.name.toLowerCase()} professionals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ── How it works ── */}
      {/* <section className="section section-dark">
        <div className="section-inner">
          <h2 className="white-h2">How OurLocal Works</h2>
          <p className="white-sub">Book construction vehicles in 3 simple steps</p>
          <div className="steps-row">
            {[
              { n: '01', Icon: HiLocationMarker, t: 'Set Your Location',  d: 'Enter your construction site address' },
              { n: '02', Icon: GiCrane,         t: 'Choose Vehicle',    d: 'Pick from 20+ machines with live availability' },
              { n: '03', Icon: HiCheckCircle,    t: 'Confirm & Track',    d: 'Book instantly and track your operator live' },
            ].map(({ n, Icon, t, d }) => (
              <div key={n} className="step-card">
                <div className="step-num">{n}</div>
                <Icon className="step-icon" />
                <strong>{t}</strong>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <button className="cta-big" onClick={() => navigate('/browse')}>
            Book Your First Vehicle <HiArrowRight style={{ width: 18, height: 18, verticalAlign: 'middle' }} />
          </button>
        </div>
      </section> */}

      {/* ── Why OurLocal ── */}
      <section className="home-section why-us">
        <div className="section-header">
          <h2>Why Choose Mana Local?</h2>
        </div>
        <div className="why-grid">
          {WHY.map(({ Icon, t, d, color }) => (
            <div key={t} className="why-card">
              <div className="why-icon-wrap" style={{ background: color + '18', color }}>
                <Icon className="why-icon" />
              </div>
              <div className="why-card-content">
                <strong>{t}</strong>
                <p>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
