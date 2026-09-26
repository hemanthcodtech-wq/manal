import React, { useState, useEffect } from 'react';
import { HiLocationMarker, HiPhone, HiMail, HiChatAlt2, HiQuestionMarkCircle, HiShieldCheck } from 'react-icons/hi';
import './Worker.css';
import '../admin/Admin.css';

export default function WorkerSupport() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    content: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const { name, mobile, email, subject, content } = form;
    
    // Construct the WhatsApp message
    const message = `*Support Request*
*Name:* ${name}
*Mobile:* ${mobile}
*Email:* ${email}
*Subject:* ${subject}
*Message:*
${content}`;
    
    // Encode for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Support phone number (without +)
    const waNumber = '919848615849';
    
    // Open WhatsApp URL in a new tab
    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
  };
  
  if (loading) {
    return (
      <div className="worker-page">
        <div className="worker-header">
          <div className="wh-left">
            <div>
              <h1>Help & Support</h1>
              <p>Get assistance with your account, services, or jobs.</p>
            </div>
          </div>
        </div>
        <div className="admin-section" style={{ marginTop: 24, paddingBottom: 64 }}>
          <div className="sk-grid">
            <div className="skeleton sk-card" style={{ height: '180px' }}></div>
            <div className="skeleton sk-card" style={{ height: '180px' }}></div>
          </div>
          <div className="skeleton sk-card" style={{ height: '120px' }}></div>
          <div className="skeleton sk-card" style={{ height: '400px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-page">
      <div className="worker-header">
        <div className="wh-left">
          <div>
            <h1>Help & Support</h1>
            <p>Get assistance with your account, services, or jobs.</p>
          </div>
        </div>
      </div>

      <div className="admin-section" style={{ marginTop: 24, paddingBottom: 64 }}>
        
        {/* Support Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiPhone size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Phone Support</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Call us for immediate assistance</p>
              </div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: '600', color: '#1e293b', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>+91 98486 15849</span>
              <a href="tel:+919848615849" className="admin-btn-primary" style={{ padding: '8px 16px', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>Call Now</a>
            </div>
          </div>

          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HiMail size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Email Support</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Send us your queries anytime</p>
              </div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: '600', color: '#1e293b', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ wordBreak: 'break-all' }}>info@ourlocal.in</span>
              <a href="mailto:info@ourlocal.in" className="admin-btn-primary" style={{ padding: '8px 16px', background: '#ef4444', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>Email Us</a>
            </div>
          </div>

        </div>

        <div className="admin-card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiLocationMarker style={{ color: '#2563eb' }} /> Office Location
          </h2>
          <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiLocationMarker size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '18px', margin: '0 0 6px 0', color: '#1e293b' }}>OurLocal Headquarters</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Chimakurty</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiChatAlt2 style={{ color: '#10b981' }} /> Send a Message
          </h2>
          
          <form className="premium-form" onSubmit={handleWhatsAppSubmit}>
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input type="tel" className="form-input" placeholder="e.g. 9876543210" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-input" placeholder="e.g. ramesh@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Subject</label>
              <input type="text" className="form-input" placeholder="What do you need help with?" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label>Message Details</label>
              <textarea className="form-input" placeholder="Describe your issue in detail..." rows={5} style={{ width: '100%', resize: 'vertical' }} value={form.content} onChange={e => setForm({...form, content: e.target.value})} required></textarea>
            </div>
            <button type="submit" className="submit-btn" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#25D366' }}>
              <HiChatAlt2 size={20} /> Send via WhatsApp
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
