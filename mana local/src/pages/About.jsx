import React from 'react';
import { HiUserGroup, HiBriefcase, HiBadgeCheck } from 'react-icons/hi';
import { MdOutlinePlumbing, MdElectricalServices } from 'react-icons/md';
import Footer from '../components/Footer';
import Roadmap from '../components/Roadmap';
import aboutHeroImg from '../assets/about_hero.jpg';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './About.css';

export default function About() {
  const containerRef = useScrollReveal();

  return (
    <div className="about-page" ref={containerRef}>
      <div className="about-hero reveal-fade-in">
        <img 
          src={aboutHeroImg} 
          alt="Our Diverse Workforce" 
          className="about-hero-img" 
        />
        <div className="about-hero-overlay">
          <h1>About Mana Local</h1>
          <p>Connecting skilled professionals with the communities that need them.</p>
        </div>
      </div>

      <div className="about-content">
        <section className="about-vision-mission reveal-on-scroll">
          <div className="vm-box">
            <h2>Vision</h2>
            <p>“పతి పాంతంలోని పజలకు అవసరమైన సేవలు, వాపారాలు, ఉ గాలు, ఆసులు మరియు షాంగ్ ను ఒకే చోట సులభంగా అందుబాటులోకి తీసుకురావడం.”</p>
          </div>
          <div className="vm-box">
            <h2>Mission 🎯</h2>
            <p>“మన పాంతంలోని సానిక సేవలు, వరరు, వాపారాలు, ఉ గాలు, పాపరీలు మరియు షాంగ్ ను డిజిటల్ గా అనుసంధానించి, పజలకు సమయం మరియు ఖరు ఆదా చేసే నమకమైన Local Marketplace ను నిరించడం.”</p>
          </div>
        </section>

        <section className="about-core-values reveal-on-scroll">
          <h2>Core Values</h2>
          <div className="cv-grid">
            <div className="cv-card">
              <h4>1. Local First</h4>
              <p>మన పాంతానికి, మన పజలకు పాధానత</p>
            </div>
            <div className="cv-card">
              <h4>2. Trust & Transparency</h4>
              <p>నమకం మరియు పారదరకత</p>
            </div>
            <div className="cv-card">
              <h4>3. Easy & Accessible</h4>
              <p>అందరికీ సులభంగా ఉపయోగపడే సేవలు</p>
            </div>
            <div className="cv-card">
              <h4>4. Community Growth</h4>
              <p>సానిక వాపారాలు, వరరు, యువత అభివృ</p>
            </div>
            <div className="cv-card">
              <h4>5. Quality & Reliability</h4>
              <p>నాణమైన, నమదగిన సేవలు</p>
            </div>
            <div className="cv-card">
              <h4>6. Innovation</h4>
              <p>ఆధునిక టెకాలజీతో సానిక అవసరాలకు పరిషారాలు</p>
            </div>
            <div className="cv-card cv-full">
              <h4>7. One Local Platform</h4>
              <p>“మన పాంతం… మన సేవలు… మన లోకల”</p>
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
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h4>How do I book a service?</h4>
              <p>Simply navigate to the Categories section, select the service you need, choose a professional, and pick a time slot that works for you.</p>
            </div>
            <div className="faq-item">
              <h4>Are the workers certified?</h4>
              <p>Yes! We verify the credentials and experience of plumbers, electricians, and all technical workers before they join.</p>
            </div>
            <div className="faq-item">
              <h4>How do I join as a worker?</h4>
              <p>Click on the 'Worker Login' in the header and navigate to the registration page. Submit your details, and our team will approve you quickly.</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
