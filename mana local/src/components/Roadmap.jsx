import React from 'react';
import { HiLocationMarker, HiCog, HiSearch, HiCheck } from 'react-icons/hi';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Roadmap.css';

export default function Roadmap() {
  const containerRef = useScrollReveal();

  const steps = [
    { id: 1, title: '1. Fetch Location', desc: 'Allow GPS access to auto-detect your current location.', Icon: HiLocationMarker },
    { id: 2, title: '2. Choose Category', desc: 'Select electrician, plumber, cleaner, AC repair etc.', Icon: HiCog },
    { id: 3, title: '3. Find Nearby Workers', desc: 'Instantly match with workers nearest to you.', Icon: HiSearch },
    { id: 4, title: '4. Instant Booking', desc: 'Confirm with one tap & track live worker arrival.', Icon: HiCheck },
  ];

  return (
    <section className="roadmap-section" ref={containerRef}>
      <div className="roadmap-inner">
        <h2 className="roadmap-title reveal-on-scroll">Quick Worker Booking – Roadmap</h2>
        <div className="roadmap-container">
          <div className="roadmap-line"></div>
          {steps.map((step, index) => (
            <div key={step.id} className={`roadmap-step ${index % 2 === 0 ? 'left' : 'right'} reveal-on-scroll`}>
              <div className="rs-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
              <div className="rs-icon-wrap">
                <step.Icon className="rs-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
