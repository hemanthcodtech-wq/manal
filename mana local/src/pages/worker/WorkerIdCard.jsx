import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useAuthStore } from '../../store/useAuthStore';
import { HiDownload, HiBadgeCheck, HiPhone, HiLocationMarker, HiBriefcase } from 'react-icons/hi';
import logo from '../../assets/logo.png';

export default function WorkerIdCard() {
  const user = useAuthStore(s => s.user);
  const cardRef = useRef(null);

  if (!user) return null;

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `ManaLocal_ID_${user.name.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="worker-page">
      <div className="wp-title hide-on-print">
        <HiBadgeCheck className="wp-title-icon" />
        <h1>My ID Card</h1>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <p className="hide-on-print" style={{ color: '#64748b', marginBottom: '24px', textAlign: 'center' }}>
          This is your official Mana Local professional ID card. You can download and print it to show to customers for verification.
        </p>

        {/* The ID Card */}
        <div 
          ref={cardRef}
          className="id-card-container"
          style={{
            background: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}
        >
          {/* Top Banner */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '24px', textAlign: 'center', color: '#fff' }}>
            <img src={logo} alt="Mana Local" style={{ height: '30px', filter: 'brightness(0) invert(1)', marginBottom: '8px' }} />
            <div style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, fontWeight: 600 }}>Official Professional ID</div>
          </div>

          {/* Profile Section */}
          <div style={{ padding: '24px', textAlign: 'center', position: 'relative', marginTop: '-40px' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              margin: '0 auto 16px',
              border: '4px solid #fff',
              background: '#e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
              color: '#94a3b8'
            }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {user.name} <HiBadgeCheck style={{ color: '#0ea5e9', fontSize: '20px' }} />
            </h2>
            <div style={{ color: '#0ea5e9', fontWeight: 600, fontSize: '14px', marginBottom: '20px' }}>
              Verified Professional
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#475569' }}>
                <HiBriefcase style={{ color: '#94a3b8', fontSize: '18px' }} />
                <span><strong style={{ color: '#1e293b' }}>Service:</strong> {user.category_name || user.category_id || 'Professional'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#475569' }}>
                <HiPhone style={{ color: '#94a3b8', fontSize: '18px' }} />
                <span><strong style={{ color: '#1e293b' }}>Contact:</strong> {user.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#475569' }}>
                <HiLocationMarker style={{ color: '#94a3b8', fontSize: '18px' }} />
                <span><strong style={{ color: '#1e293b' }}>Location:</strong> {user.location || user.address || 'Local Area'}</span>
              </div>
            </div>

            {/* ID Number Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>ID: ML-{user.id?.toString().padStart(6, '0') || '000000'}</span>
              <span>Valid: {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        <button 
          className="hide-on-print"
          onClick={handleDownload}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '16px', 
            fontWeight: 600, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}
          disabled={isDownloading}
        >
          <HiDownload style={{ fontSize: '20px' }} />
          {isDownloading ? 'Generating Image...' : 'Download ID Card'}
        </button>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .id-card-container, .id-card-container * {
              visibility: visible !important;
            }
            .id-card-container {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 350px;
              box-shadow: none !important;
              border: 1px solid #cbd5e1 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .hide-on-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
