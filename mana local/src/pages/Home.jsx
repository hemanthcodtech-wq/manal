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
import { calculateDistanceKm, formatDistance, getWorkerCoordinates, getCustomerLocation } from '../utils/geoDistance';
import './Home.css';

import heroBannerImg from '../assets/hero_banner.jpg';

const MANA_LOCAL_BANNER = {
  id: 'default',
  tag: 'Welcome to',
  title: 'OurLocal',
  sub: 'Connecting you with verified professionals, heavy machinery, and prime real estate.',
  cta: 'Explore Services',
  bg: 'linear-gradient(135deg, #1e40af, #3b82f6)',
  accent: '#fff',
  img: heroBannerImg
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
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const containerRef = useScrollReveal([dbCategories.length, nearbyWorkers.length]);
  const [bannerIdx, setBannerIdx] = useState(0);
  
  const [activeAds, setActiveAds] = useState([]);
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [showcaseVideos, setShowcaseVideos] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [workersLoading, setWorkersLoading] = useState(true);

  // Request customer's live GPS location with shared cache
  useEffect(() => {
    getCustomerLocation((loc) => {
      setUserLocation(loc);
    });
  }, []);

  useEffect(() => {
    fetchAds();
    fetchCategoriesData();
    fetchShowcaseVideos();
    if (userLocation) {
      fetchNearbyWorkers();
    }
  }, [userLocation]);

  const fetchNearbyWorkers = async () => {
    try {
      setWorkersLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/workers`);
      const data = await res.json();
      if (data.success && data.workers) {
        const mapped = data.workers.map((w) => {
          const coords = getWorkerCoordinates(w, userLocation);
          const distKm = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng) : null;
          const displayDist = formatDistance(distKm);

          return {
            ...w,
            latitude: coords.lat,
            longitude: coords.lng,
            displayDistance: displayDist,
            numDist: distKm != null ? distKm : 999999
          };
        }).sort((a, b) => a.numDist - b.numDist); // Sort nearest worker first!

        setNearbyWorkers(mapped.slice(0, 10)); // Take top 10 closest
      }
    } catch (err) {
      console.error('Error fetching nearby workers:', err);
    } finally {
      setWorkersLoading(false);
    }
  };

  const fetchShowcaseVideos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/showcase-videos`);
      const data = await res.json();
      if (data.success && data.videos) {
        setShowcaseVideos(data.videos);
      }
    } catch (err) {
      console.error('Error fetching showcase videos for home:', err);
    }
  };

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
          <button className="qa-btn qa-green" onClick={() => window.open('https://wa.me/919493515849')}>
            <div className="qa-icon-wrap"><FaWhatsapp className="qa-icon" /></div>
            <span className="qa-text">WhatsApp Connect</span>
            <HiArrowRight className="qa-arrow" />
          </button>
        </div>
      </section>

      {/* ── Nearby Verified Professionals ── */}
      <section className="section nearby-workers-section reveal-on-scroll" style={{ padding: '40px 0 20px', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="section-inner">
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                <HiLocationMarker style={{ color: '#0284c7' }} /> NEARBY PROFESSIONALS
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                Verified Workers Near You
              </h2>
              <p className="section-sub" style={{ margin: 0 }}>
                Instant connect with background-checked local specialists
              </p>
            </div>
            <button className="see-all-btn" onClick={() => navigate('/browse')}>
              Explore All <HiChevronRight style={{ width: 14, height: 14, verticalAlign: 'middle' }} />
            </button>
          </div>

          <div className="h-scroll" style={{ paddingBottom: '16px', gap: '18px' }}>
            {workersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ flex: '0 0 280px', background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <Skeleton type="avatar" style={{ width: '50px', height: '50px' }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton type="title" style={{ width: '70%', marginBottom: '6px' }} />
                      <Skeleton type="text" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <Skeleton type="card" style={{ height: '40px' }} />
                </div>
              ))
            ) : nearbyWorkers.length > 0 ? (
              nearbyWorkers.map((w) => {
                const subName = dbSubcategories.find(s => s.id === w.subcategory_id)?.name || w.category_name || 'Home Specialist';
                const hourlyRate = w.rate_per_hour || 500;
                const avatarImg = w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || 'W')}&background=random`;

                return (
                  <div 
                    key={w.id}
                    onClick={() => navigate(`/professional/${w.id}`)}
                    style={{
                      flex: '0 0 280px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.boxShadow = '0 16px 30px rgba(2, 132, 199, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.04)';
                    }}
                  >
                    <div>
                      {/* Top Row: Avatar & Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={avatarImg} 
                            alt={w.name} 
                            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} 
                          />
                          <HiBadgeCheck style={{ position: 'absolute', bottom: -2, right: -2, color: '#0284c7', background: '#fff', borderRadius: '50%', fontSize: '18px' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {w.name}
                          </h4>
                          <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#0369a1', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                            {subName}
                          </span>
                        </div>
                      </div>

                      {/* Distance and Rating Pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#0284c7', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '14px' }}>
                          <HiLocationMarker /> {w.displayDistance}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#fef3c7', color: '#b45309', fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '14px' }}>
                          <HiStar style={{ color: '#f59e0b' }} /> {w.rating || '5.0'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Pricing & Action */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Starting</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₹{hourlyRate}/hr</div>
                      </div>
                      <button 
                        style={{
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '24px', color: '#64748b', fontSize: '14px' }}>
                No professionals found in your immediate radius.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Popular Services & Workers ── */}
      <section className="section services-section reveal-on-scroll">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">⚡ Instant Booking</span>
              <h2>Popular Services</h2>
              <p className="section-sub">Skilled workers, machine operators, and contractors at your doorstep</p>
            </div>
            <button className="see-all-btn" onClick={() => navigate('/browse')}>
              See all categories <HiChevronRight style={{ width: 16, height: 16, verticalAlign: 'middle' }} />
            </button>
          </div>
          
          <div className="popular-services-grid">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="service-card reveal-on-scroll" style={{ padding: '12px' }}>
                  <Skeleton type="card" style={{ height: '140px', marginBottom: '12px', borderRadius: '16px' }} />
                  <Skeleton type="title" style={{ width: '70%' }} />
                </div>
              ))
            ) : (
              dbCategories.map(c => (
                <div key={c.id} className="service-card" onClick={() => navigate(`/category/${c.id}`)}>
                  <div className="sc-img-wrap">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="sc-img" />
                    ) : (
                      <div className="sc-fallback-box">
                        <h3>{c.name}</h3>
                      </div>
                    )}
                    <div className="sc-overlay-badge">
                      <span>Verified Category</span>
                    </div>
                  </div>
                  <div className="sc-body">
                    <h3 className="sc-name">{c.name}</h3>
                    <p className="sc-desc">Explore verified specialists & machines</p>
                    <div className="sc-action-row">
                      <span className="sc-action-link">View Services →</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Video Showcase ── */}
      <section className="section section-dark video-showcase-section reveal-on-scroll">
        <div className="section-inner">
          <div className="video-section-header">
            <div>
              <span className="video-eyebrow">🎥 Field Footage</span>
              <h2 className="white-h2">Mana Local in Action</h2>
              <p className="white-sub">See how our verified machine operators and professionals deliver excellence on-site.</p>
            </div>
            <div className="video-stats-badge">
              <span className="video-live-dot"></span> Live Operations
            </div>
          </div>
          
          <div className="video-showcase-grid">
            {(showcaseVideos.length > 0 ? showcaseVideos : [
              { id: 'v1', video_url: '/videos/video1.mp4', title: 'Quality Workmanship', tag: 'Excavation & Earthwork' },
              { id: 'v2', video_url: '/videos/video2.mp4', title: 'Verified Professionals', tag: 'Construction & Masonry' },
              { id: 'v3', video_url: '/videos/video3.mp4', title: 'Prompt Local Service', tag: 'Machinery Dispatch' }
            ]).map((vid, idx) => (
              <div key={vid.id || idx} className="video-card-premium">
                <div className="video-player-wrap">
                  <video 
                    src={vid.video_url}
                    controls
                    preload="metadata"
                    className="video-element"
                  />
                  <div className="video-gradient-overlay"></div>
                </div>
                <div className="video-card-footer">
                  <span className="video-card-tag">{vid.tag || 'Verified Field Work'}</span>
                  <h4 className="video-card-title">{vid.title}</h4>
                </div>
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
