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

const BANNERS = [
  { id: 1, tag: 'Most Booked', title: 'JCB on Demand', sub: 'Backhoe Loader at your site in 60 mins', cta: 'Book JCB', vehicleId: 'jcb', bg: 'linear-gradient(135deg, #0369a1, #0284c7)', accent: '#fff', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80' },
  { id: 2, tag: 'Instant Booking', title: 'Crane Hire Made Easy', sub: 'Tower & Mobile cranes for any project', cta: 'Book Crane', vehicleId: 'crane', bg: 'linear-gradient(135deg, #0f766e, #115e59)', accent: '#fff', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80' },
  { id: 3, tag: 'Fast Delivery', title: 'Tipper Trucks Ready', sub: 'Sand, gravel & debris transport — same day', cta: 'Book Tipper', vehicleId: 'dump-truck', bg: 'linear-gradient(135deg, #0284c7, #10b981)', accent: '#fff', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&q=80' },
  { id: 4, tag: 'Heavy Lifting', title: 'Bulldozer & Grader', sub: 'Land leveling & road construction experts', cta: 'Book Now', vehicleId: 'bulldozer', bg: 'linear-gradient(135deg, #059669, #047857)', accent: '#fff', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80' },
];

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
  
  const { data: services, loading: servicesLoading } = useDataFetch(highlightedServices, 2000);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const banner = BANNERS[bannerIdx];
  const isDark = banner.accent === '#fff';

  return (
    <div className="home" ref={containerRef}>

      {/* ── Hero Banner ── */}
      <section className="hero-banner elegant-banner reveal-fade-in">
        <img src={banner.img} alt={banner.title} className="eb-bg" />
        
        <div className="eb-dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`eb-dot ${i === bannerIdx ? 'active' : ''}`} onClick={() => setBannerIdx(i)} />
          ))}
        </div>
      </section>

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
            {servicesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="service-card reveal-on-scroll" style={{ padding: '10px' }}>
                  <Skeleton type="card" style={{ height: '120px', marginBottom: '10px' }} />
                  <Skeleton type="title" style={{ width: '60%' }} />
                  <Skeleton type="text" count={2} />
                </div>
              ))
            ) : (
              services.map(s => (
                <div key={s.id} className="service-card reveal-on-scroll" onClick={() => navigate(`/workers?service=${s.id}`)}>
                  <div className="sc-img-wrap">
                    <img src={s.image} alt={s.name} className="sc-img" />
                    <div className="sc-rating"><HiStar style={{ width: 11, height: 11, color: '#f59e0b' }} /> {s.rating}</div>
                  </div>
                  <div className="sc-body">
                    <div className="sc-name">{s.name}</div>
                    <div className="sc-desc">{s.desc}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <Roadmap />

      {/* ── Category Scroll Sections ── */}
      {categories.map((cat, idx) => {
        const CatIcon = CAT_ICONS[cat.id] || MdConstruction;
        const color = CAT_COLORS[cat.id] || '#ff6b00';
        return (
          <section key={cat.id} className={`section ${idx % 2 === 1 ? 'section-gray' : ''}`}>
            <div className="section-inner">
              <div className="section-header">
                <div className="cat-section-title">
                  <div className="cat-section-icon-wrap" style={{ background: color + '18', color }}>
                    <CatIcon className="cat-section-icon" />
                  </div>
                  <div>
                    <h2>{cat.label}</h2>
                    <span className="cat-section-count">{cat.vehicles.length} services</span>
                  </div>
                </div>
                <button className="see-all-btn" onClick={() => navigate(`/browse?cat=${cat.id}`)}>See all <HiChevronRight style={{ width: 14, height: 14, verticalAlign: 'middle' }} /></button>
              </div>
              <div className="h-scroll">
                {cat.vehicles.map(v => (
                  <div key={v.id} className="hs-card" onClick={() => navigate(`/workers?service=${v.id}`)}>
                    <div className="hs-img-wrap">
                      <img src={v.image} alt={v.name} className="hs-img" />
                      <div className="hs-overlay">
                        <span className="hs-avail">✓ Available</span>
                      </div>
                    </div>
                    <div className="hs-body">
                      <div className="hs-name">{v.name}</div>
                      <div className="hs-desc">{v.desc}</div>
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
