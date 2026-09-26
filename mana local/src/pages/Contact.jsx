import React from 'react';
import { HiLocationMarker, HiPhone, HiMail, HiShieldCheck, HiClock, HiChatAlt2 } from 'react-icons/hi';
import Footer from '../components/Footer';
import contactHeroImg from '../assets/contact_hero.jpg';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Contact.css';

export default function Contact() {
  const containerRef = useScrollReveal();

  return (
    <div className="contact-page" ref={containerRef}>
      <div className="contact-hero reveal-fade-in">
        <img 
          src={contactHeroImg} 
          alt="Contact OurLocal Support" 
          className="contact-hero-img" 
        />
        <div className="contact-hero-overlay">
          <h1>Get in Touch</h1>
          <p>We're here to help! Whether you're a customer looking for services or a worker looking for jobs.</p>
        </div>
      </div>

      <div className="contact-content reveal-on-scroll">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p>Our support team is available around the clock to assist you with any questions or concerns.</p>
            
            <div className="info-item">
              <div className="info-icon-wrap"><HiLocationMarker className="info-icon" /></div>
              <div>
                <strong>Office Address</strong>
                <span>Chimakurty</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon-wrap"><HiPhone className="info-icon" /></div>
              <div>
                <strong>Phone Support</strong>
                <span>+91 98486 15849</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon-wrap"><HiMail className="info-icon" /></div>
              <div>
                <strong>Email Us</strong>
                <span>info@ourlocal.in</span>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Send us a Message</h2>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>

        {/* Trust Elements Section */}
        <div className="contact-trust-section reveal-on-scroll">
          <h2>Our Support Guarantee</h2>
          <div className="trust-grid">
            <div className="trust-card">
              <HiClock className="trust-icon" />
              <h4>Fast Response</h4>
              <p>We aim to respond to all support inquiries within 2 hours during normal business hours.</p>
            </div>
            <div className="trust-card">
              <HiShieldCheck className="trust-icon" />
              <h4>Secure & Confidential</h4>
              <p>Your data, bookings, and privacy are fully protected under our strict security protocols.</p>
            </div>
            <div className="trust-card">
              <HiChatAlt2 className="trust-icon" />
              <h4>Dedicated Team</h4>
              <p>Our local support team is thoroughly trained to resolve your issues quickly and effectively.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
