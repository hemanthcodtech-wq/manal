import React, { useState } from 'react';
import { HiUserGroup, HiBriefcase, HiBadgeCheck } from 'react-icons/hi';
import { MdOutlinePlumbing, MdElectricalServices } from 'react-icons/md';
import Footer from '../components/Footer';
import Roadmap from '../components/Roadmap';
import aboutHeroImg from '../assets/about_hero.jpg';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './About.css';

export default function About() {
  const containerRef = useScrollReveal();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="about-page" ref={containerRef}>
      <div className="about-hero">
        <img 
          src={aboutHeroImg} 
          alt="Our Diverse Workforce" 
          className="about-hero-img" 
        />
        <div className="about-hero-overlay">
          <div className="about-hero-badge">
            <span className="about-badge-dot"></span> Empowering Local Workforces
          </div>
          <h1>About Mana Local</h1>
          <p>Connecting skilled professionals with the communities that need them across India.</p>
        </div>
      </div>

      <div className="about-content">
        <section className="about-vision-mission reveal-on-scroll">
          <div className="vm-box">
            <h2>Vision 🌟</h2>
            <p className="vm-te">“ప్రతి ప్రాంతంలోని ప్రజలకు అవసరమైన సేవలు, వ్యాపారాలు, ఉద్యోగాలు, ఆస్తులు మరియు షాపింగ్ ను ఒకే చోట సులభంగా అందుబాటులోకి తీసుకురావడం.”</p>
            <p className="vm-en">“To bring essential services, businesses, jobs, real estate properties, and local shopping easily accessible in one place for people in every region.”</p>
          </div>
          <div className="vm-box">
            <h2>Mission 🎯</h2>
            <p className="vm-te">“మన ప్రాంతంలోని స్థానిక సేవలు, వర్కర్లు, వ్యాపారాలు, ఉద్యోగాలు, ప్రాపర్టీలు మరియు షాపింగ్ ను డిజిటల్ గా అనుసంధానించి, ప్రజలకు సమయం మరియు ఖర్చు ఆదా చేసే నమ్మకమైన Local Marketplace ను నిర్మించడం.”</p>
            <p className="vm-en">“To digitally connect local services, workers, businesses, jobs, real estate properties, and shopping—building a trusted Local Marketplace that saves time and money for the community.”</p>
          </div>
        </section>

        <section className="about-core-values reveal-on-scroll">
          <h2>Core Values</h2>
          <div className="cv-grid">
            <div className="cv-card">
              <h4>1. Local First</h4>
              <p className="cv-te">మన ప్రాంతానికి, మన ప్రజలకు ప్రాధాన్యత</p>
              <p className="cv-en">Prioritizing our region and our people</p>
            </div>
            <div className="cv-card">
              <h4>2. Trust & Transparency</h4>
              <p className="cv-te">నమ్మకం మరియు పారదర్శకత</p>
              <p className="cv-en">Uncompromised honesty and transparency</p>
            </div>
            <div className="cv-card">
              <h4>3. Easy & Accessible</h4>
              <p className="cv-te">అందరికీ సులభంగా ఉపయోగపడే సేవలు</p>
              <p className="cv-en">Seamless and accessible services for everyone</p>
            </div>
            <div className="cv-card">
              <h4>4. Community Growth</h4>
              <p className="cv-te">స్థానిక వ్యాపారాలు, వర్కర్లు, యువత అభివృద్ధి</p>
              <p className="cv-en">Empowering local businesses, workers, and youth</p>
            </div>
            <div className="cv-card">
              <h4>5. Quality & Reliability</h4>
              <p className="cv-te">నాణ్యమైన, నమ్మదగిన సేవలు</p>
              <p className="cv-en">High quality and dependable assistance</p>
            </div>
            <div className="cv-card">
              <h4>6. Innovation</h4>
              <p className="cv-te">ఆధునిక టెక్నాలజీతో స్థానిక అవసరాలకు పరిష్కారాలు</p>
              <p className="cv-en">Modern technology tailored for local everyday needs</p>
            </div>
            <div className="cv-card cv-full">
              <h4>7. One Local Platform</h4>
              <p className="cv-te">“మన ప్రాంతం… మన సేవలు… మన లోకల్”</p>
              <p className="cv-en">“Our Region… Our Services… Mana Local”</p>
            </div>
          </div>
        </section>

        <section className="about-showcase reveal-on-scroll" style={{ margin: '60px 0' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>See Our Work</h2>
          <div className="h-scroll" style={{ paddingBottom: '20px' }}>
            {['video1.mp4', 'video2.mp4', 'video3.mp4'].map((vid, idx) => (
              <div key={idx} style={{ 
                flex: '0 0 280px', // Fixed width for side-by-side scrolling
                borderRadius: '16px', overflow: 'hidden', background: '#0f172a', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
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
        </section>

        <section className="about-launch reveal-on-scroll" style={{ textAlign: 'center', margin: '60px 0', padding: '40px', background: '#f8fafc', borderRadius: '16px' }}>
          <h2>Current Status</h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>Our Local | మన లోకల్ is a new business venture currently in the development and launch stage.</p>
        </section>

        <section className="about-faq reveal-on-scroll">
          <div className="faq-header-center">
            <span className="faq-pill-badge">❓ Got Questions?</span>
            <h2 className="faq-main-title">Frequently Asked Questions</h2>
            <p className="faq-subtitle">Everything you need to know about booking workers, verified real estate, and partnering with Mana Local.</p>
          </div>

          <div className="faq-list">
            {[
              {
                q: "What is Mana Local and how does it work?",
                a: "Mana Local is an intelligent hyper-local marketplace connecting residents directly with verified skilled professionals, heavy construction machinery, and verified real estate. Simply browse the categories or search by your location, view verified ratings, rates, and distances, and connect directly via phone call or WhatsApp."
              },
              {
                q: "Are the professionals and workers on Mana Local background-checked?",
                a: "Yes. Every technician, vehicle operator, and contractor undergoes verification including ID/Aadhaar checks, trade experience validation, and community reviews. Verified profiles display an official blue badge."
              },
              {
                q: "Do I have to pay any upfront booking fee?",
                a: "No! Mana Local has a strict Zero Upfront Fee Policy. You should never pay advance booking charges. You inspect the work quality or machine performance first and settle standard rates directly with the worker upon satisfactory completion."
              },
              {
                q: "How is the distance between me and the professional calculated?",
                a: "When you permit location access, Mana Local uses real-time GPS spatial coordinates to calculate the exact driving distance and route in kilometers between your current spot and the worker's base hub, ensuring prompt local dispatch."
              },
              {
                q: "Can I book heavy equipment like excavators, tractors, or borewell rigs?",
                a: "Yes! Our platform hosts specialized construction and agricultural machinery—including JCB backhoes, tractor rotavators, borewell rigs, and cranes—with transparent hourly and daily hire rates."
              },
              {
                q: "How do I register as a skilled worker or service provider?",
                a: "Click on 'Login' in the navigation bar and choose 'Login', then tap 'Register as Worker'. Provide your name, category, skills, location, and phone number. Once verified by our local administration team, your profile goes live immediately."
              },
              {
                q: "Are real estate properties on Mana Local listed by brokers or admins?",
                a: "All properties on Mana Local are curated and verified directly by authorized platform admins. This ensures 100% genuine titles, verified photos, zero hidden brokerages, and direct contact with authorized site managers."
              },
              {
                q: "What should I do if a worker doesn't arrive or demands extra payment?",
                a: "In the rare event of an issue, you can immediately report the provider through our 24/7 support line (+91 94935 15849) or submit a ticket on our Contact page. Providers with policy violations are instantly suspended."
              },
              {
                q: "In which cities and regions is Mana Local currently operational?",
                a: "We currently have extensive network coverage across Hyderabad, Bangalore, Chimakurty, and neighboring metropolitan corridors, with continuous expansion across South India."
              },
              {
                q: "Is there any cost for customers to search and view profiles?",
                a: "No, browsing profiles, viewing equipment specs, checking real estate listings, and calculating GPS distance is 100% free for all customers."
              }
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="faq-question-row">
                    <span className="faq-question-text">
                      <span className="faq-num">0{idx + 1}</span> {item.q}
                    </span>
                    <span className="faq-chevron-icon">
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="faq-answer-row">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
